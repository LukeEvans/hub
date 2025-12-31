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

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -Eq '^v2[0-9]'; then
  echo "Installing Node.js 20 (requires sudo)..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "Node.js 20+ already installed; skipping."
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Installing pnpm (requires sudo)..."
  sudo npm install -g pnpm
fi

if [[ ! -f .env && -f env.example ]]; then
  cp env.example .env
  echo "Created .env from env.example (edit with your secrets)."
fi

echo "Installing app dependencies..."
cd "$ROOT/v0-smart-display-app"
pnpm add googleapis axios node-cache dotenv
pnpm install --frozen-lockfile

cd "$ROOT"
echo "Building and starting containers..."
docker compose up -d --build

echo "Waiting for Mealie to be ready..."
until curl -s http://localhost:9000/api/app/about > /dev/null; do
  echo "Mealie is starting... (this may take a minute)"
  sleep 10
done

echo ""
echo "--------------------------------------------------------"
echo "MEALIE SETUP REQUIRED"
echo "--------------------------------------------------------"
echo "1. Open Mealie in your browser: http://localhost:9000"
echo "2. Create your admin account"
echo "3. Go to Settings -> API Tokens"
echo "4. Create a new token and copy it"
echo "5. Add it to your .env file: MEALIE_API_TOKEN=your_token_here"
echo "6. Restart the app: docker compose restart app"
echo "--------------------------------------------------------"
echo ""
read -p "Press Enter once you have Mealie open to continue with system setup..."

if command -v systemctl >/dev/null 2>&1; then
  echo "Installing kiosk systemd service (requires sudo)..."
  TMP_FILE="$(mktemp)"
  sed \
    -e "s|^User=.*|User=$(whoami)|" \
    -e "s|^WorkingDirectory=.*|WorkingDirectory=${ROOT}|" \
    -e "s|^ExecStart=.*|ExecStart=${ROOT}/scripts/start-kiosk.sh|" \
    "$ROOT/scripts/kiosk.service" > "$TMP_FILE"
  sudo mv "$TMP_FILE" /etc/systemd/system/kiosk.service
  sudo chmod +x "$ROOT/scripts/start-kiosk.sh"
  sudo systemctl daemon-reload
  sudo systemctl enable --now kiosk.service
  echo "kiosk.service installed and started."
else
  echo "systemd not found; skipping kiosk.service install."
fi

if command -v raspi-config >/dev/null 2>&1; then
  echo "Configuring boot to desktop autologin..."
  sudo raspi-config nonint do_boot_behaviour B4
  
  echo "Configuring system-wide audio to HDMI 1 (card 1)..."
  sudo tee /etc/asound.conf <<EOF
pcm.!default {
    type plug
    slave {
        pcm "hw:1,0"
    }
}

ctl.!default {
    type hw
    card 1
}
EOF
  
  echo "Unmuting audio and setting volume to 100%..."
  amixer -c 1 sset PCM 100% unmute || true
  sudo usermod -aG audio "$(whoami)"
fi

if [ -f /etc/profile.d/sshpw.sh ]; then
  echo "Removing default password warning..."
  sudo rm -f /etc/profile.d/sshpw.sh
fi

echo "Done. App on http://localhost:3000, Mealie on http://localhost:9000."

