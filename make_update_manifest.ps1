# 生成主题在线更新清单 update_manifest.json（覆盖 Eole、Lxbox 与 webview-ui 三个目录）
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File .\make_update_manifest.ps1
param(
    [string]$RepoDir = $PSScriptRoot,
    [string]$Version = ''
)

$ErrorActionPreference = 'Stop'
$RepoDir = (Resolve-Path -LiteralPath $RepoDir).Path.TrimEnd('\')
if (-not $Version) { $Version = (Get-Date -Format 'yyyy.MM.dd-HHmm') }

# 参与同步的目录（src = 仓库内来源，out = 清单里的 profile 相对路径前缀）。
# Eole 与 Lxbox 直接同名；视频模板放在 assets\webview-ui 里，清单路径仍按 profile\webview-ui 记录。
$targets = @(
    @{ src = 'Eole';               out = 'Eole' },
    @{ src = 'Lxbox';              out = 'Lxbox' },
    @{ src = 'assets\webview-ui';  out = 'webview-ui' }
)

# 不参与同步：本地缓存 / 设置 / 备份 / 编辑器备份 / 用户数据
$excludeDirNames = @('eole-img-cache', 'eole-settings', '_update_backup', '_update_tmp', '.git',
                     '.probe', 'playlists', 'nowplaying', 'data')
# 文档与废弃文件不进 profile：README.md、*.notused
$excludeExt = @('.md', '.notused')
function Test-Excluded([string]$rel) {
    $parts = $rel -split '/'
    foreach ($p in $parts) {
        if ($excludeDirNames -contains $p) { return $true }
    }
    $leaf = $parts[-1]
    if ($rel -match '\.bak') { return $true }
    if ($leaf -eq 'update_manifest.json') { return $true }
    if ($excludeExt -contains [System.IO.Path]::GetExtension($leaf).ToLower()) { return $true }
    return $false
}

# ---------- 文本文件与换行归一 ----------
# .gitattributes 是 * text=auto：仓库里存 LF，Windows 工作区是 CRLF，
# 于是 GitHub raw / jsDelivr 下发的是 LF 版，而本地磁盘是 CRLF 版。
# 清单的 md5 继续记录“本地磁盘字节”（面板与 need 判断直接比它），
# 另加 md5lf = CRLF→LF 归一后的 MD5，等于远端 blob 的 MD5，供更新器下载后校验。
$textExt = @('.js', '.css', '.html', '.htm', '.json', '.md', '.txt', '.ps1', '.xml', '.svg',
             '.fth', '.ini', '.cfg', '.vbs')

# 读文件 → 按字节做 CRLF→LF（保留 BOM 与编码）→ MD5，一步完成，避免数组在管道里被展开
function Get-LfMd5OfPath([string]$path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $buf = New-Object System.Collections.Generic.List[byte]
    for ($i = 0; $i -lt $bytes.Length; $i++) {
        if ($bytes[$i] -eq 13 -and ($i + 1) -lt $bytes.Length -and $bytes[$i + 1] -eq 10) { continue }
        $buf.Add($bytes[$i])
    }
    $arr = [byte[]]$buf.ToArray()
    $md5 = [System.Security.Cryptography.MD5]::Create()
    try {
        $h = $md5.ComputeHash($arr)
        return ([BitConverter]::ToString([byte[]]$h) -replace '-', '').ToLower()
    } finally { $md5.Dispose() }
}

$files = @()
$epoch = [datetime]::SpecifyKind([datetime]'1970-01-01', [System.DateTimeKind]::Utc)
foreach ($t in $targets) {
    $srcDir = Join-Path $RepoDir ($t.src -replace '\\', '\')
    if (-not (Test-Path -LiteralPath $srcDir)) { continue }
    Get-ChildItem -LiteralPath $srcDir -Recurse -File -Force | ForEach-Object {
        # 仓库内的相对路径（用于排除判断），以及清单里的 profile 相对路径（out 前缀 + 目录内相对部分）
        $relInSrc = $_.FullName.Substring($srcDir.Length).TrimStart('\', '/').Replace('\', '/')
        $rel = ($t.out.Replace('\', '/') + '/' + $relInSrc)
        if (Test-Excluded $relInSrc) { return }
        if ($t.out -eq 'Eole' -and $relInSrc -eq 'preview.png') { return }   # README 预览图，不进 profile
        $mtime = [int][Math]::Floor(($_.LastWriteTimeUtc - $epoch).TotalSeconds)
        $md5 = (Get-FileHash -LiteralPath $_.FullName -Algorithm MD5).Hash.ToLower()
        $ext = $_.Extension.ToLower()
        $md5lf = if ($textExt -contains $ext) { Get-LfMd5OfPath $_.FullName } else { $md5 }
        $files += [ordered]@{
            path  = $rel
            mtime = $mtime
            md5   = $md5
            md5lf = $md5lf
        }
    }
}

$manifestPath = Join-Path $RepoDir 'update_manifest.json'

# removed：显式维护的“远端已删除/移动走的旧文件”，默认空。
# 需要删除旧文件时在下面的 $removedExtra 里追加仓库相对路径（如 'Eole/js/old_script.js'）。
$removedExtra = @(
    'Eole/js/ts_update.ps1',   # 更新执行器已移到 Eole 根目录，旧位置要让客户端删掉
    'mpv/mpv.conf',           # 视频改由 WebView2 承担，旧的 mpv 配置让客户端清掉
    'mpv/input.conf',
    'Lxbox/online/bridge-launch.vbs'  # 桥接改由 WScript.Shell.Run 直接启动，旧脚本让客户端删掉
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
