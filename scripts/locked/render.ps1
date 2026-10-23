param(
 [Parameter(Mandatory=$true)][string]$InputJson,
 [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference='Stop'
$bundledNode=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$bundledModules=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
if(Test-Path -LiteralPath $bundledNode){$renderNode=$bundledNode;$env:NODE_PATH=$bundledModules}else{$renderNode=(Get-Command node -ErrorAction Stop).Source}
& $renderNode (Join-Path $PSScriptRoot 'render.cjs') $InputJson $OutputDirectory
if($LASTEXITCODE -ne 0){throw 'Render failed. Do not edit templates to bypass the error. Read the error/report and fix data or split the input.'}
