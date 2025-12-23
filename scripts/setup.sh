#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"

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

