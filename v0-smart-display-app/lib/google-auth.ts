import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const PORT = process.env.PORT || 3000;
const GOOGLE_TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || './data/google/token.json';

export const authClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/google/oauth/callback`
);

export async function getGoogleToken() {
  try {
    const data = await fs.readFile(GOOGLE_TOKEN_PATH, 'utf-8');
    const token = JSON.parse(data);
    console.log('Token loaded from:', GOOGLE_TOKEN_PATH);
    console.log('Token has refresh_token:', !!token.refresh_token);
    authClient.setCredentials(token);
    return token;
  } catch (err) {
    console.log('No token found at:', GOOGLE_TOKEN_PATH);
    return null;
  }
}

export async function saveGoogleToken(token: any) {
  console.log('Saving token to:', GOOGLE_TOKEN_PATH);
  await fs.mkdir(path.dirname(GOOGLE_TOKEN_PATH), { recursive: true });
  await fs.writeFile(GOOGLE_TOKEN_PATH, JSON.stringify(token));
}

