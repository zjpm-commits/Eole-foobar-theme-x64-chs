# 生成主题在线更新清单 update_manifest.json（覆盖 Eole 与 Lxbox 两个目录）
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File .\make_update_manifest.ps1
param(
    [string]$RepoDir = $PSScriptRoot,
    [string]$Version = ''
)

$ErrorActionPreference = 'Stop'
$RepoDir = (Resolve-Path -LiteralPath $RepoDir).Path.TrimEnd('\')
if (-not $Version) { $Version = (Get-Date -Format 'yyyy.MM.dd-HHmm') }

# 参与同步的目录（相对仓库根）
$targets = @('Eole', 'Lxbox')

# 不参与同步：本地缓存 / 设置 / 备份 / 编辑器备份 / 用户数据
$excludeDirNames = @('eole-img-cache', 'eole-settings', '_update_backup', '_update_tmp', '.git',
                     'playlists', 'nowplaying', 'data')
function Test-Excluded([string]$rel) {
    $parts = $rel -split '/'
    foreach ($p in $parts) {
        if ($excludeDirNames -contains $p) { return $true }
    }
    if ($rel -match '\.bak') { return $true }
    if ($parts[-1] -eq 'update_manifest.json') { return $true }
    return $false
}

$files = @()
$epoch = [datetime]::SpecifyKind([datetime]'1970-01-01', [System.DateTimeKind]::Utc)
foreach ($t in $targets) {
    $dir = Join-Path $RepoDir $t
    if (-not (Test-Path -LiteralPath $dir)) { continue }
    Get-ChildItem -LiteralPath $dir -Recurse -File -Force | ForEach-Object {
        $rel = $_.FullName.Substring($RepoDir.Length).TrimStart('\', '/').Replace('\', '/')
        if (Test-Excluded $rel) { return }
        $mtime = [int][Math]::Floor(($_.LastWriteTimeUtc - $epoch).TotalSeconds)
        $files += [ordered]@{
            path  = $rel
            mtime = $mtime
            md5   = (Get-FileHash -LiteralPath $_.FullName -Algorithm MD5).Hash.ToLower()
        }
    }
}

$manifestPath = Join-Path $RepoDir 'update_manifest.json'

# removed：显式维护的“远端已删除/移动走的旧文件”，默认空。
# 需要删除旧文件时在下面的 $removedExtra 里追加仓库相对路径（如 'Eole/js/old_script.js'）。
$removedExtra = @(
    'Eole/js/ts_update.ps1'   # 更新执行器已移到 Eole 根目录，旧位置要让客户端删掉
)
$removed = @()
if (Test-Path -LiteralPath $manifestPath) {
    try {
        $prev = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($prev.removed) {
            foreach ($r in $prev.removed) {
                if ($r -is [string]) { $removed += $r } elseif ($r.path) { $removed += [string]$r.path }
            }
        }
    } catch { }
}
$removed = @($removed + $removedExtra | Select-Object -Unique)
# 远端已不存在的旧文件自动从 removed 里剔除（本地有没有都无所谓，反正远端没有）
$removed = @($removed | Where-Object { -not (Test-Path -LiteralPath (Join-Path $RepoDir $_.Replace('/', '\'))) })

$manifest = [ordered]@{
    version   = $Version
    generated = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    base      = @(
        'https://raw.githubusercontent.com/zjpm-commits/Eole-foobar-theme-x64-chs/main/',
        'https://cdn.jsdelivr.net/gh/zjpm-commits/Eole-foobar-theme-x64-chs@main/'
    )
    files     = $files
    removed   = $removed
}

$json = $manifest | ConvertTo-Json -Depth 5
# UTF-8 无 BOM（JSON.parse 在旧 JS 引擎里对 BOM 不友好）
[System.IO.File]::WriteAllText($manifestPath, $json, (New-Object System.Text.UTF8Encoding($false)))
"已写入: $manifestPath  文件数: $($files.Count)  版本: $Version"
