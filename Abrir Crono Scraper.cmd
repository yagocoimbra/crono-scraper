@echo off
cd /d "%~dp0"
if not exist crono-scraper.exe (
  echo O programa ainda nao foi compilado. Rode o instalar.ps1 antes.
  pause
  exit /b 1
)
if not exist webdata mkdir webdata
start "Crono Scraper" /min crono-scraper.exe -web -addr :8080 -data-folder webdata
timeout /t 3 /nobreak >nul
start "" http://localhost:8080
