import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { authClient, getGoogleToken } from '@/lib/google-auth';

export async function POST() {
  try {
    const token = await getGoogleToken();
    
    // 1. Try to revoke the token on Google's side if we have it
    if (token && token.access_token) {
      try {
        await authClient.revokeToken(token.access_token);
        console.log('Google token revoked successfully');
      } catch (revokeErr) {
        console.warn('Failed to revoke token on Google side (it might already be expired):', revokeErr);
      }
    }

    // 2. Delete the local token file
    const GOOGLE_TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || './data/google/token.json';
    try {
      await fs.unlink(GOOGLE_TOKEN_PATH);
      console.log('Local token file deleted');
    } catch (err) {
      console.warn('Local token file already gone or could not be deleted');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error during logout:', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

