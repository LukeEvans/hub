import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function PUT(request: NextRequest) {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { volume } = await request.json();
    if (typeof volume !== 'number' || volume < 0 || volume > 100) {
      return NextResponse.json({ error: 'Invalid volume' }, { status: 400 });
    }

    await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, null, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting Spotify volume:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to set volume' }, { status: 500 });
  }
}

