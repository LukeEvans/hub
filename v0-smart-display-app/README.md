# Smart display app

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/luke-evans-projects/v0-smart-display-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/fUIeA4lEOeb)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/luke-evans-projects/v0-smart-display-app](https://vercel.com/luke-evans-projects/v0-smart-display-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/fUIeA4lEOeb](https://v0.app/chat/fUIeA4lEOeb)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Google Calendar Integration

To connect your Google Family Calendar, follow these steps:

### 1. Create Google Cloud Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Smart Hub Display").
3. Go to **APIs & Services > Library**, search for **Google Calendar API**, and click **Enable**.
4. Go to **APIs & Services > OAuth consent screen**:
   - Choose **External** user type.
   - Fill in the required app information (App name, support email).
   - **Crucial:** Under "Test users", add the Google account email that owns the family calendar.
5. Go to **APIs & Services > Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Select **Web application**.
   - Add an **Authorized redirect URI**: `http://localhost:3000/api/google/oauth/callback` (or your Pi's IP/hostname).
   - Save and copy your **Client ID** and **Client Secret**.

### 2. Get your Family Calendar ID
1. Open [Google Calendar](https://calendar.google.com/).
2. Find your **Family** calendar in the left sidebar.
3. Click the three dots (options) > **Settings and sharing**.
4. Scroll down to the **Integrate calendar** section and copy the **Calendar ID**.

### 3. Configure Environment Variables
Update your `.env` file in the root directory:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_IDS=your_family_calendar_id
```

### 4. Authorize the App
1. Start the application.
2. Navigate to `http://localhost:3000/api/google/auth-url` (or your Pi's address).
3. Click the link provided to log in with your Google account.
4. Once completed, you'll see a success message and your tokens will be saved to `./data/google/token.json`.

## Spotify Integration

Spotify has temporarily paused new developer app registrations. As a workaround, this app uses **Spotify Embed Iframes**.

### 1. Configure Playlists
1. Open [Spotify](https://open.spotify.com) in your browser.
2. Find a playlist you want to display (e.g., your "Family Favorites").
3. Copy the URL from the address bar (e.g., `https://open.spotify.com/playlist/...`).
4. In the **Settings** tab of this app, paste the URL into the **Primary Playlist URL** field.
5. You can add more playlists in the **Secondary Playlists** field (one per line).

### 2. Control Your Alexa
Since iframes cannot directly control external devices, use the **Launch Web Player** button on the Music page.
1. Click the button to open the full Spotify Web Player in a new tab.
2. Log in to your account if prompted.
3. Click the "Connect to a device" icon in the bottom right corner.
4. Select your **Alexa** speaker.
5. You can now use the Hub's Music tab to play/pause/skip within the active playlist, and the audio will continue playing on your Alexa.

### 3. Full Track Playback
To ensure the iframe plays full tracks instead of 30-second previews:
1. Open the Hub's browser.
2. Navigate to [spotify.com](https://spotify.com) and log in.
3. The iframe will now recognize your session and play full tracks.

## Raspberry Pi Deployment

To speed up development on the Raspberry Pi, this project is configured to build on a faster machine (like your Mac) and push to the GitHub Container Registry (GHCR).

### 1. Initial Setup

1. **GitHub Token:** Create a [Personal Access Token (classic)](https://github.com/settings/tokens/new) with `write:packages`, `read:packages`, and `delete:packages` scopes.
2. **Login on Mac:**
   ```bash
   echo "YOUR_TOKEN" | docker login ghcr.io -u LukeEvans --password-stdin
   ```
3. **Login on Pi:**
   ```bash
   echo "YOUR_TOKEN" | docker login ghcr.io -u LukeEvans --password-stdin
   ```

### 2. Update Pi Alias

On your Raspberry Pi, update your `bounce` alias in `~/.zshrc` or `~/.bashrc`:

```bash
alias bounce='docker compose pull app && docker compose up -d app && sudo systemctl restart kiosk.service'
```

### 3. Deploy from Mac

Simply run the deploy script from the root of the repository on your Mac:

```bash
./scripts/deploy
```

This script will:
1. Build the ARM64 image on your Mac.
2. Push the image to GHCR.
3. SSH into the Pi to pull the new image and restart the services.

### Fallback: Building on Pi

If you need to build directly on the Pi (slower), you can still run:
```bash
docker compose up -d --build app
```

## Home Assistant Integration

Connect your Home Assistant instance to control lights, climate, locks, and more directly from the Smart Home tab.

### 1. Create a Long-Lived Access Token
1. Log in to your **Home Assistant** instance.
2. Click on your **profile name** in the bottom left sidebar.
3. Scroll to the bottom and find the **Long-Lived Access Tokens** section.
4. Click **Create Token** and give it a name (e.g., "Smart Hub").
5. Copy the generated token.

### 2. Configure Environment Variables
Update your `.env` file in the root directory:
```env
HOME_ASSISTANT_URL=http://your-ha-ip:8123
HOME_ASSISTANT_TOKEN=your_long_lived_access_token
HOME_ASSISTANT_CACHE_TTL=5
```

### 3. Features
- **Lights:** Control all `light.*` entities.
- **Climate:** Control thermostats including temperature and HVAC mode.
- **Security:** Monitor and control `lock.*` and `camera.*` entities.
- **Rooms:** Automatically organized based on your Home Assistant Areas.
- **Quick Actions:** Execute common services like "All Lights Off".

### 4. Customizing Controls
The dashboard automatically detects supported entities. To refine which devices appear, ensure they are correctly categorized in Home Assistant and assigned to Areas.
