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
    authClient.setCredentials(token);
    return token;
  } catch {
    return null;
  }
}

export async function saveGoogleToken(token: any) {
  await fs.mkdir(path.dirname(GOOGLE_TOKEN_PATH), { recursive: true });
  await fs.writeFile(GOOGLE_TOKEN_PATH, JSON.stringify(token));
}

