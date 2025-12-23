#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker (requires sudo)..."
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$(whoami)" || true
  echo "Docker installed. You may need to log out/in for group changes to apply."
else
  echo "Docker already installed; skipping."
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js/npm (requires sudo)..."
  sudo apt-get update
  sudo apt-get install -y nodejs npm
else
  echo "Node.js/npm already installed; skipping."
fi

if [[ ! -f .env && -f env.example ]]; then
  cp env.example .env
  echo "Created .env from env.example (edit with your secrets)."
fi

echo "Installing app dependencies..."
cd "$ROOT/app"
npm install

cd "$ROOT"
echo "Building and starting containers..."
docker compose up -d --build

if command -v systemctl >/dev/null 2>&1; then
  echo "Installing kiosk systemd service (requires sudo)..."
  TMP_FILE="$(mktemp)"
  sed \
    -e "s|^User=.*|User=$(whoami)|" \
    -e "s|^WorkingDirectory=.*|WorkingDirectory=${ROOT}|" \
    "$ROOT/scripts/kiosk.service" > "$TMP_FILE"
  sudo mv "$TMP_FILE" /etc/systemd/system/kiosk.service
  sudo systemctl daemon-reload
  sudo systemctl enable --now kiosk.service
  echo "kiosk.service installed and started."
else
  echo "systemd not found; skipping kiosk.service install."
fi

echo "Done. App on http://localhost:3000, Mealie on http://localhost:9000."

