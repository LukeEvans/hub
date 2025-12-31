import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const PORT = process.env.PORT || 3000;
const SPOTIFY_TOKEN_PATH = process.env.SPOTIFY_TOKEN_PATH || './data/spotify/token.json';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const isConfigured = SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_ID !== 'your-spotify-client-id';

export interface SpotifyToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at: number; // custom field
}

export async function saveSpotifyToken(token: any) {
  // Add expires_at if not present
  if (!token.expires_at && token.expires_in) {
    token.expires_at = Date.now() + token.expires_in * 1000;
  }
  
  // Ensure the directory exists. We use resolve to handle relative paths from the root
  const absolutePath = path.resolve(process.cwd(), SPOTIFY_TOKEN_PATH);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, JSON.stringify(token, null, 2));
}

export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyToken> {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const newToken = response.data;
  // Spotify might not return a new refresh token, so keep the old one
  if (!newToken.refresh_token) {
    newToken.refresh_token = refreshToken;
  }
  
  await saveSpotifyToken(newToken);
  return newToken as SpotifyToken;
}

export async function getSpotifyToken(): Promise<SpotifyToken | null> {
  if (!isConfigured) return null;
  try {
    const absolutePath = path.resolve(process.cwd(), SPOTIFY_TOKEN_PATH);
    const data = await fs.readFile(absolutePath, 'utf-8');
    let token: SpotifyToken = JSON.parse(data);

    // Check if token is expired or about to expire (within 1 minute)
    if (Date.now() > token.expires_at - 60000) {
      if (token.refresh_token) {
        token = await refreshSpotifyToken(token.refresh_token);
      } else {
        return null;
      }
    }

    return token;
  } catch (err) {
    return null;
  }
}

export async function exchangeSpotifyCode(code: string): Promise<SpotifyToken> {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', SPOTIFY_REDIRECT_URI!);

  const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const token = response.data;
  await saveSpotifyToken(token);
  return token as SpotifyToken;
}

export function getSpotifyAuthUrl() {
  const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID!,
    scope: scopes.join(' '),
    redirect_uri: SPOTIFY_REDIRECT_URI!,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

