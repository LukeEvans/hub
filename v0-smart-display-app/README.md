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
