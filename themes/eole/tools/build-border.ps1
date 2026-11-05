[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw '.NET Framework 4.x x64 C# compiler is required.' }
$source = Join-Path $PSScriptRoot 'EoleBorder.cs'
$target = Join-Path $PSScriptRoot 'EoleBorder.exe'
& $compiler /nologo /target:winexe /platform:x64 /optimize+ "/out:$target" $source
if ($LASTEXITCODE -ne 0) { throw 'C# build failed.' }
Write-Host "Built $target"
