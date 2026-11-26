# Eole 主题在线更新执行器（由主题设置面板「维护→在线更新」调用）
# 覆盖两个目录：profile\Eole 与 profile\Lxbox（清单里的路径均为“仓库相对路径”）
# 流程：拉清单 → 比对(MD5) → 下载到临时目录并校验 → 等待 foobar2000 退出 → 整份备份 → 重试替换 → 处理 removed → 写日志 + 弹窗报告
param(
    [Parameter(Mandatory = $true)][string]$Profile,
    [string]$ManifestUrl = 'https://raw.githubusercontent.com/zjpm-commits/Eole-foobar-theme-x64-chs/main/update_manifest.json',
    [string]$ManifestUrl2 = 'https://cdn.jsdelivr.net/gh/zjpm-commits/Eole-foobar-theme-x64-chs@main/update_manifest.json',
    [string]$Log = '',
    [int]$AutoRestart = 0
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

# 替换成功后把 foobar2000 拉起来。只在 exe 存在、且更新期间没有别的实例
# 被用户手动打开时才启动，避免出现第二个窗口。
function Start-FoobarAfterUpdate {
    try {
        $root = Split-Path -Parent $Profile
        $exe = Join-Path $root 'foobar2000.exe'
        if (-not (Test-Path -LiteralPath $exe)) {
            WriteLog ('RESTART 未找到 ' + $exe)
            return 'nofile'
        }
        $alive = @(Get-Process -Name 'foobar2000' -ErrorAction SilentlyContinue)
        if ($alive.Count -gt 0) {
            $pids = (@($alive | ForEach-Object { $_.Id }) -join ',')
            WriteLog ('RESTART 已有实例在运行（PID ' + $pids + '），跳过')
            return 'running'
        }
        Start-Process -FilePath $exe -WorkingDirectory $root -WindowStyle Normal
        WriteLog 'RESTART 已启动'
        return 'ok'
    } catch {
        WriteLog ('RESTART 失败 ' + $_.Exception.Message)
        return 'fail'
    }
}

function Show-UpdPopup([string]$msg) {
    try {
        Add-Type -AssemblyName System.Windows.Forms | Out-Null
        [System.Windows.Forms.MessageBox]::Show($msg, 'Eole 主题更新', 'OK', 'Information') | Out-Null
    } catch { }
}

function ExitFail([string]$msg) {
    WriteLog ('FAIL ' + $msg)
    Show-UpdPopup ('主题更新失败：' + $msg + [Environment]::NewLine + '详细日志见 _update_backup\last_update.log')
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
    Show-UpdPopup ('已是最新版本（' + $version + '），无需更新。')
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

# ---------- 5. 等待 foobar2000 退出（退出后应用） ----------
# 面板先弹窗确认 → 启动本脚本 → foobar2000 自行退出。
# 只等待脚本启动瞬间已存在的实例（按 PID）：更新期间用户新开的实例不阻塞流程。
$startPids = @(Get-Process -Name 'foobar2000' -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
WriteLog ('WAIT 记录启动时实例 ' + $(if ($startPids.Count) { $startPids -join ',' } else { '（无）' }))
$waited = 0
while ($waited -lt 40) {
    $alive = @(Get-Process -Name 'foobar2000' -ErrorAction SilentlyContinue | Where-Object { $startPids -contains $_.Id })
    if ($alive.Count -eq 0) { break }
    Start-Sleep -Milliseconds 500
    $waited++
}
WriteLog ('WAIT 等待启动时实例退出 ' + ($waited / 2) + ' 秒')

# ---------- 6. 替换（带重试：等文件句柄释放） ----------
$upd = 0; $add = 0
foreach ($f in $downloaded) {
    if (Test-Path -LiteralPath (Join-Path $Profile ([string]$f.path).Replace('/', '\'))) { $upd++ } else { $add++ }
}
$maxRetry = 60; $tried = 0; $fails = @()
while ($true) {
    $fails = @()
    foreach ($f in $downloaded) {
        $rel = [string]$f.path
        $target = Join-Path $Profile ($rel.Replace('/', '\'))
        $tmpFile = Join-Path $tmpDir ($rel.Replace('/', '\'))
        $tParent = Split-Path -Parent $target
        if (-not (Test-Path -LiteralPath $tParent)) { New-Item -ItemType Directory -Path $tParent -Force | Out-Null }
        try {
            Copy-Item -LiteralPath $tmpFile -Destination $target -Force -ErrorAction Stop
            try { (Get-Item -LiteralPath $target).LastWriteTimeUtc = $epochUtc.AddSeconds([double]$f.mtime) } catch { }
        } catch { $fails += ($rel + ' :: ' + $_.Exception.Message) }
    }
    if ($fails.Count -eq 0) { break }
    $tried++
    if ($tried -ge $maxRetry) { break }
    Start-Sleep -Milliseconds 250
}

# ---------- 7. removed / 移动遗留 ----------
$del = 0
foreach ($r in $removed) {
    $rel = if ($r -is [string]) { [string]$r } else { [string]$r.path }
    $target = Join-Path $Profile ($rel.Replace('/', '\'))
    if (Test-Path -LiteralPath $target) {
        try { Remove-Item -LiteralPath $target -Force -ErrorAction Stop; $del++ }
        catch { $fails += ($rel + ' :: ' + $_.Exception.Message) }
    }
}

Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue

# 记录当前版本，供面板显示
try {
    if (-not (Test-Path -LiteralPath $bakRoot)) { New-Item -ItemType Directory -Path $bakRoot -Force | Out-Null }
    [System.IO.File]::WriteAllText((Join-Path $bakRoot 'version.txt'), $version, (New-Object System.Text.UTF8Encoding($false)))
} catch { }

# 备份保留最近 10 份（目录名形如 yyyyMMdd_HHmmss），更早的自动清理；日志与 version.txt 不动
try {
    $oldBaks = @(Get-ChildItem -LiteralPath $bakRoot -Directory | Where-Object { $_.Name -match '^\d{8}_\d{6}$' } | Sort-Object Name)
    if ($oldBaks.Count -gt 10) {
        foreach ($d in @($oldBaks | Select-Object -First ($oldBaks.Count - 10))) {
            Remove-Item -LiteralPath $d.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        WriteLog ('CLEAN 清理旧备份 ' + ($oldBaks.Count - 10) + ' 份')
    }
} catch { }

if ($fails.Count -gt 0) {
    WriteLog ('FAIL ' + $fails.Count + ' 个文件处理失败（替换已重试 ' + $tried + ' 次）：')
    $i = 0
    foreach ($fl in $fails) {
        WriteLog ('  ' + $fl)
        $i++
        if ($i -ge 10) { WriteLog ('  … 等共 ' + $fails.Count + ' 个'); break }
    }
    Show-UpdPopup ('主题更新未完成：' + $fails.Count + ' 个文件替换失败。' + [Environment]::NewLine + '详细列表见 _update_backup\last_update.log' + [Environment]::NewLine + [Environment]::NewLine + '可启动 foobar2000 后重新执行一次更新。')
    exit 2
}

WriteLog ('OK 完成：更新 ' + $upd + ' / 新增 ' + $add + ' / 删除 ' + $del + ' 版本 ' + $version)

# ---------- 8. 自动重启（可选，面板开关 AUTORESTART） ----------
$tail = ''
if ($AutoRestart -ne 0) {
    switch (Start-FoobarAfterUpdate) {
        'ok'      { $tail = [Environment]::NewLine + [Environment]::NewLine + 'foobar2000 已自动重启。' }
        'running' { $tail = [Environment]::NewLine + [Environment]::NewLine + '检测到 foobar2000 已在运行，未重复启动。' }
        'nofile'  { $tail = [Environment]::NewLine + [Environment]::NewLine + '未找到 foobar2000.exe，请手动启动。' }
        default   { $tail = [Environment]::NewLine + [Environment]::NewLine + '自动重启失败，请手动启动 foobar2000。' }
    }
} else {
    $tail = [Environment]::NewLine + [Environment]::NewLine + '可启动 foobar2000 体验新的版本。'
}

Show-UpdPopup ('主题更新完成：更新 ' + $upd + ' / 新增 ' + $add + ' / 删除 ' + $del + [Environment]::NewLine + '版本 ' + $version + $tail)
exit 0
