# Instala o Crono Scraper no Windows: garante o Go e compila o programa.
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$GoVersion = '1.27.3'
$GoHome = Join-Path $env:USERPROFILE '.crono-go'
$GoBin = $null

$found = Get-Command go -ErrorAction SilentlyContinue
if ($found) {
    $GoBin = $found.Source
} elseif (Test-Path (Join-Path $GoHome 'go\bin\go.exe')) {
    $GoBin = Join-Path $GoHome 'go\bin\go.exe'
} else {
    $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'amd64' }
    Write-Host "Baixando o Go $GoVersion (so desta vez, fica em $GoHome)..."
    New-Item -ItemType Directory -Force -Path $GoHome | Out-Null
    $zip = Join-Path $env:TEMP "go$GoVersion.zip"
    Invoke-WebRequest -Uri "https://go.dev/dl/go$GoVersion.windows-$arch.zip" -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $GoHome -Force
    Remove-Item $zip
    $GoBin = Join-Path $GoHome 'go\bin\go.exe'
}

Write-Host 'Compilando o Crono Scraper (leva 1 a 3 minutos na primeira vez)...'
& $GoBin build -o crono-scraper.exe .
if ($LASTEXITCODE -ne 0) { throw 'A compilacao falhou.' }

Write-Host 'Pronto. Abrindo...'
Start-Process -FilePath (Join-Path $PSScriptRoot 'Abrir Crono Scraper.cmd')
