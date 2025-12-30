import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function PUT(request: NextRequest) {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { deviceId, play } = await request.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
    }

    // Spotify's transfer playback endpoint
    await axios.put('https://api.spotify.com/v1/me/player', {
      device_ids: [deviceId],
      play: play ?? true,
    }, {
      headers: { 
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error transferring Spotify playback:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to transfer playback' }, { status: 500 });
  }
}

