#!/usr/bin/env bash
# Abre o Crono Scraper no navegador. Sobe o servidor em segundo plano se ainda não estiver rodando.
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-8080}"
URL="http://localhost:$PORT"

if [ ! -x ./crono-scraper ]; then
  echo "O programa ainda não foi compilado. Rode antes: bash instalar.sh"
  exit 1
fi

mkdir -p webdata

if ! curl -fs -o /dev/null "$URL"; then
  nohup ./crono-scraper -web -addr ":$PORT" -data-folder ./webdata >webdata/servidor.log 2>&1 &
  echo $! >webdata/servidor.pid
  for _ in $(seq 1 30); do
    curl -fs -o /dev/null "$URL" && break
    sleep 0.5
  done
fi

if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
fi

echo "Crono Scraper aberto em $URL"
echo "Para desligar: kill \$(cat webdata/servidor.pid)"
