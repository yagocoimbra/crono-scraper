#!/usr/bin/env bash
# Instala o Crono Scraper no Mac ou no Linux: garante o Go e compila o programa.
set -euo pipefail

cd "$(dirname "$0")"

GO_VERSION="1.27.3"
GO_HOME="$HOME/.crono-go"

if command -v go >/dev/null 2>&1; then
  GO_BIN="$(command -v go)"
elif [ -x "$GO_HOME/go/bin/go" ]; then
  GO_BIN="$GO_HOME/go/bin/go"
else
  case "$(uname -s)" in
    Darwin) OS=darwin ;;
    Linux) OS=linux ;;
    *) echo "Sistema não suportado: $(uname -s)"; exit 1 ;;
  esac
  case "$(uname -m)" in
    arm64|aarch64) ARCH=arm64 ;;
    x86_64|amd64) ARCH=amd64 ;;
    *) echo "Processador não suportado: $(uname -m)"; exit 1 ;;
  esac
  echo "Baixando o Go $GO_VERSION (só desta vez, fica em $GO_HOME)..."
  mkdir -p "$GO_HOME"
  curl -fsSL "https://go.dev/dl/go${GO_VERSION}.${OS}-${ARCH}.tar.gz" | tar -xz -C "$GO_HOME"
  GO_BIN="$GO_HOME/go/bin/go"
fi

echo "Compilando o Crono Scraper (leva 1 a 3 minutos na primeira vez)..."
"$GO_BIN" build -o crono-scraper .

echo "Pronto. Para abrir: bash abrir.sh"
