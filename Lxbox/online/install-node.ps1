# install-node.ps1 — Lxbox 桥前置：检测/自动安装系统 Node，并把路径写回 install.json
# 用法：右键“使用 PowerShell 运行”，或 pwsh -File install-node.ps1
# 仅在找不到系统 Node 时安装（winget 优先，回退官方 MSI 静默安装），绝不装便携版。

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$installJson = Join-Path $here 'install.json'

function Say($m) { Write-Host "[install-node] $m" }

# ---------- 1. 检测（固定目录优先，PATH 只兜底，避免误认临时环境的 node） ----------
$candidates = @(
  "$env:ProgramFiles\nodejs\node.exe",
  "${env:ProgramFiles(x86)}\nodejs\node.exe",
  "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)
try {
  $w = (where.exe node 2>$null) | Where-Object { $_ -and (Test-Path $_) -and ($_ -notmatch 'sandbox_runtime|\\Temp\\') }
  if ($w) { $candidates += $w }
} catch { }
$found = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $found) {
  Say '未找到系统 Node，开始安装…'
  $installed = $false

  # ---------- 2a. winget ----------
  try {
    $wg = Get-Command winget -ErrorAction SilentlyContinue
    if ($wg) {
      Say 'winget 安装 OpenJS.NodeJS.LTS（静默）…'
      & winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Host
      $found = "$env:ProgramFiles\nodejs\node.exe"
      if (Test-Path $found) { $installed = $true } else { $found = $null }
    }
  } catch { Say "winget 失败：$($_.Exception.Message)" }

  # ---------- 2b. 官方 MSI 回退 ----------
  if (-not $installed) {
    Say 'winget 不可用，回退官方 MSI…'
    try {
      $idx = Invoke-RestMethod 'https://nodejs.org/dist/index.json' -TimeoutSec 30
      $lts = ($idx | Where-Object { $_.lts } | Select-Object -First 1)
      $ver = $lts.version
      $msi = "$env:TEMP\node-$ver-x64.msi"
      Say "下载 Node $ver LTS x64 MSI…"
      Invoke-WebRequest "https://nodejs.org/dist/$ver/node-$ver-x64.msi" -OutFile $msi -TimeoutSec 600
      Say '静默安装（msiexec /qn，默认装到 C:\Program Files\nodejs）…'
      Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait
      Remove-Item $msi -Force -ErrorAction SilentlyContinue
      $found = "$env:ProgramFiles\nodejs\node.exe"
      if (Test-Path $found) { $installed = $true } else { $found = $null }
    } catch { Say "MSI 安装失败：$($_.Exception.Message)" }
  }

  if (-not $installed) { Say '安装失败，请手动安装 Node LTS 后重跑本脚本。'; exit 1 }
} else {
  Say "检测到已有 Node，不重复安装。"
}

# ---------- 3. 校验 + 写回 install.json ----------
$ver = & $found --version 2>$null
if (-not $ver) { Say "node.exe 存在但无法执行：$found"; exit 1 }
Say "Node 就绪：$found（$ver）"

if (Test-Path $installJson) {
  try {
    $j = Get-Content $installJson -Raw | ConvertFrom-Json
    $j.node = $found
    $j | ConvertTo-Json -Depth 5 | Set-Content $installJson -Encoding utf8BOM
    Say "已写回 $installJson"
  } catch { Say "install.json 更新失败：$($_.Exception.Message)（不影响 Node 本体）" }
} else {
  Say "未找到 $installJson，跳过写回（面板会在下次启动时自行读取）。"
}
Say '完成。'
