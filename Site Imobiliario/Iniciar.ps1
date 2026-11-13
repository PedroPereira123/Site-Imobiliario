$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path -LiteralPath $nodeExecutable)) { throw 'Instale Node.js 24 ou superior para iniciar o site.' }
Set-Location -LiteralPath $PSScriptRoot
& $nodeExecutable (Join-Path $PSScriptRoot 'server.mjs') @args
