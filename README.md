# Skylight-style Pi Display

Raspberry Pi kiosk that boots into a Skylight-like calendar with Google Calendar, Apple Photos (shared album via icloudpd), weather, and meal planning. Frontend and backend run locally in one container; icloudpd runs alongside via Docker Compose.

## Stack
- Next.js 15+ (App Router)
- Google Calendar via `googleapis`
- Weather via OpenWeather OneCall
- Apple Photos via `icloudpd` (shared album sync to local volume)
- Chromium kiosk on Pi

## Setup
1) Copy `env.example` to `.env` (or edit `env.example`) and fill values:
   - Google: client id/secret, redirect `http://localhost:3000/api/google/oauth/callback`
   - Weather: OpenWeather key and lat/lon
   - Apple Photos: Apple ID + app password, shared album name, sync interval
2) Install Docker + Docker Compose on the Pi.
3) `chmod +x scripts/setup.sh && scripts/setup.sh`
   - Or manually: `docker compose up --build -d`
   - App on `http://localhost`
   - Photos synced into `./data/photos`

## Google Calendar auth
1) With the stack running, open `http://<pi-ip>`.
2) Fetch auth URL: `curl http://<pi-ip>/api/google/auth-url`.
3) Open the URL, complete consent, and on callback you'll see “Google auth completed.” Tokens persist at `./data/google/token.json`.

## Kiosk
- Enable auto-login on the Pi.
- Copy `scripts/kiosk.service` to `/etc/systemd/system/kiosk.service` and adjust `User`/`WorkingDirectory` if needed.
- `sudo systemctl enable --now kiosk`
- Alternatively, run `scripts/start-kiosk.sh` manually.

## Screensaver/slideshow
- Photos synced to `./data/photos` feed both the Photos view and the inactivity slideshow (default 5 minutes). Adjust `SCREENSAVER_IDLE_MS` in `env.example`.

## Notes
- Keep secrets in a real `.env` (not committed).
- If icloudpd needs 2FA, follow container logs once to trust the device.