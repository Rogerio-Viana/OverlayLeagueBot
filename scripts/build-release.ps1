$ErrorActionPreference = "Stop"

$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $pkg.version
$stageRoot = "release\stage"
$stage = "$stageRoot\OverlayLeagueBot"
$zipPath = "release\OverlayLeagueBot-v$version-win.zip"

if (Test-Path $stageRoot) {
  Remove-Item -Recurse -Force $stageRoot
}
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Write-Host "[1/4] Compilando TypeScript..."
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[2/4] Copiando arquivos do OverlayLeagueBot..."
Copy-Item -Recurse -Force "dist" "$stage\dist"
Copy-Item -Recurse -Force "public" "$stage\public"
Copy-Item -Force "package.json", "package-lock.json", "Iniciar-OverlayLeagueBot.bat", "README.md" "$stage\"

Write-Host "[3/4] Instalando apenas dependencias de producao no pacote..."
Push-Location $stage
cmd /c "npm ci --omit=dev"
$npmExit = $LASTEXITCODE
Pop-Location
if ($npmExit -ne 0) { exit $npmExit }

Write-Host "[4/4] Gerando arquivo ZIP..."
if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}
Compress-Archive -Path "$stage\*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $stageRoot

Write-Host ""
Write-Host "Pacote criado com sucesso: $zipPath" -ForegroundColor Green
