# Eole 主题在线更新执行器（由主题设置面板「维护→在线更新」调用）
# 覆盖两个目录：profile\Eole 与 profile\Lxbox（清单里的路径均为“仓库相对路径”）
# 流程：拉清单 → 比对(MD5) → 下载到临时目录并校验 → 整份备份 → 替换 → 处理 removed → 写日志
param(
    [Parameter(Mandatory = $true)][string]$Profile,
    [string]$ManifestUrl = 'https://raw.githubusercontent.com/zjpm-commits/Eole-foobar-theme-x64-chs/main/update_manifest.json',
    [string]$ManifestUrl2 = 'https://cdn.jsdelivr.net/gh/zjpm-commits/Eole-foobar-theme-x64-chs@main/update_manifest.json',
    [string]$Log = ''
)

$ErrorActionPreference = 'Stop'
$epochUtc = [datetime]::SpecifyKind([datetime]'1970-01-01', [System.DateTimeKind]::Utc)
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 } catch { }
$ProgressPreference = 'SilentlyContinue'
$tmpDir = ''

function WriteLog([string]$msg) {
    if ($Log -and $Log.Length -gt 0) {
        try {
            $dir = Split-Path -Parent $Log
            if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
            Add-Content -LiteralPath $Log -Value $msg -Encoding UTF8
        } catch { }
    }
}

function ExitFail([string]$msg) {
    WriteLog ('FAIL ' + $msg)
    if ($tmpDir -and (Test-Path -LiteralPath $tmpDir)) { Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue }
    exit 1
}

WriteLog ('START ' + (Get-Date).ToString('s'))

$Profile = (Resolve-Path -LiteralPath $Profile).Path.TrimEnd('\')
$tmpDir = Join-Path $Profile '_update_tmp'

# ---------- 1. 拉清单 ----------
$manifestText = $null
foreach ($u in @($ManifestUrl, $ManifestUrl2)) {
    if (-not $u) { continue }
    try {
        $resp = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Eole-Theme-Updater' }
        if ($resp.StatusCode -eq 200 -and $resp.Content) { $manifestText = $resp.Content; WriteLog ('MANIFEST from ' + $u); break }
    } catch { WriteLog ('WARN manifest failed: ' + $u + ' / ' + $_.Exception.Message) }
}
if (-not $manifestText) { ExitFail '无法下载更新清单（网络或代理问题）' }
$manifest = $null
try { $manifest = $manifestText | ConvertFrom-Json } catch { ExitFail '更新清单解析失败（JSON 格式错误）' }
$version = [string]$manifest.version
$base = @($manifest.base)
if (-not $base.Count) { ExitFail '清单缺少下载源(base)' }

# ---------- 2. 比对 ----------
$need = @()
foreach ($f in $manifest.files) {
    $rel = [string]$f.path
    $target = Join-Path $Profile ($rel.Replace('/', '\'))
    $same = $false
    if (Test-Path -LiteralPath $target) {
        try { $same = ((Get-FileHash -LiteralPath $target -Algorithm MD5).Hash.ToLower() -eq ([string]$f.md5).ToLower()) } catch { $same = $false }
    }
    if (-not $same) { $need += $f }
}
WriteLog ('PLAN 版本 ' + $version + ' 需处理 ' + $need.Count + ' 个文件')

$removed = @()
if ($manifest.removed) { $removed = @($manifest.removed) }

if ($need.Count -eq 0 -and $removed.Count -eq 0) {
    # 只是日期差异 → 把本地时间对齐清单，下次检查不再误报
    foreach ($f in $manifest.files) {
        $target = Join-Path $Profile ([string]$f.path).Replace('/', '\')
        if (Test-Path -LiteralPath $target) {
            try { (Get-Item -LiteralPath $target).LastWriteTimeUtc = $epochUtc.AddSeconds([double]$f.mtime) } catch { }
        }
    }
    WriteLog ('OK 已是最新：' + $version)
    exit 0
}

# ---------- 3. 下载到临时目录并校验 ----------
if (Test-Path -LiteralPath $tmpDir) { Remove-Item -LiteralPath $tmpDir -Recurse -Force }
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$downloaded = @()
foreach ($f in $need) {
    $rel = [string]$f.path
    $tmpFile = Join-Path $tmpDir ($rel.Replace('/', '\'))
    $tmpParent = Split-Path -Parent $tmpFile
    if (-not (Test-Path -LiteralPath $tmpParent)) { New-Item -ItemType Directory -Path $tmpParent -Force | Out-Null }
    $ok = $false
    foreach ($b in $base) {
        if (-not $b) { continue }
        $url = ([string]$b).TrimEnd('/') + '/' + $rel
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60 -OutFile $tmpFile -Headers @{ 'User-Agent' = 'Eole-Theme-Updater' } | Out-Null
            $ok = $true
            break
        } catch { WriteLog ('WARN download failed: ' + $url + ' / ' + $_.Exception.Message) }
    }
    if (-not $ok) { ExitFail ('下载失败：' + $rel) }
    $h = (Get-FileHash -LiteralPath $tmpFile -Algorithm MD5).Hash.ToLower()
    if ($h -ne ([string]$f.md5).ToLower()) { ExitFail ('校验失败（文件可能不完整或源不一致）：' + $rel) }
    $downloaded += $f
    WriteLog ('GET ' + $rel)
}

# ---------- 4. 备份 ----------
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$bakRoot = Join-Path $Profile '_update_backup'
$bakDir = Join-Path $bakRoot $stamp
New-Item -ItemType Directory -Path $bakDir -Force | Out-Null
function Backup-Rel([string]$rel) {
    $target = Join-Path $Profile ($rel.Replace('/', '\'))
    if (Test-Path -LiteralPath $target) {
        $bakFile = Join-Path $bakDir ($rel.Replace('/', '\'))
        $bakParent = Split-Path -Parent $bakFile
        if (-not (Test-Path -LiteralPath $bakParent)) { New-Item -ItemType Directory -Path $bakParent -Force | Out-Null }
        Copy-Item -LiteralPath $target -Destination $bakFile -Force
    }
}
foreach ($f in $downloaded) { Backup-Rel ([string]$f.path) }
foreach ($r in $removed) {
    $rel = if ($r -is [string]) { [string]$r } else { [string]$r.path }
    Backup-Rel $rel
}
WriteLog ('BACKUP ' + $bakDir)

# ---------- 5. 替换 ----------
$upd = 0; $add = 0
foreach ($f in $downloaded) {
    $rel = [string]$f.path
    $target = Join-Path $Profile ($rel.Replace('/', '\'))
    $tmpFile = Join-Path $tmpDir ($rel.Replace('/', '\'))
    $tParent = Split-Path -Parent $target
    if (-not (Test-Path -LiteralPath $tParent)) { New-Item -ItemType Directory -Path $tParent -Force | Out-Null }
    if (Test-Path -LiteralPath $target) { $upd++ } else { $add++ }
    Copy-Item -LiteralPath $tmpFile -Destination $target -Force
    try { (Get-Item -LiteralPath $target).LastWriteTimeUtc = $epochUtc.AddSeconds([double]$f.mtime) } catch { }
}

# ---------- 6. removed / 移动遗留 ----------
$del = 0
foreach ($r in $removed) {
    $rel = if ($r -is [string]) { [string]$r } else { [string]$r.path }
    $target = Join-Path $Profile ($rel.Replace('/', '\'))
    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Force
        $del++
    }
}

Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue

# 记录当前版本，供面板显示
try {
    if (-not (Test-Path -LiteralPath $bakRoot)) { New-Item -ItemType Directory -Path $bakRoot -Force | Out-Null }
    [System.IO.File]::WriteAllText((Join-Path $bakRoot 'version.txt'), $version, (New-Object System.Text.UTF8Encoding($false)))
} catch { }

WriteLog ('OK 完成：更新 ' + $upd + ' / 新增 ' + $add + ' / 删除 ' + $del + ' 版本 ' + $version)
exit 0
