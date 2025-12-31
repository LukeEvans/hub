import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function POST() {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await axios.post('https://api.spotify.com/v1/me/player/next', null, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error skipping to next Spotify track:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to skip to next' }, { status: 500 });
  }
}

