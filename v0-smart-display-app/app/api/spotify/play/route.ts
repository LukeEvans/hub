import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function POST(request: NextRequest) {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { uris, context_uri, offset, position_ms } = body;

    const payload: any = {};
    if (uris) payload.uris = uris;
    if (context_uri) payload.context_uri = context_uri;
    if (offset) payload.offset = offset;
    if (position_ms) payload.position_ms = position_ms;

    await axios.put('https://api.spotify.com/v1/me/player/play', 
      Object.keys(payload).length > 0 ? payload : undefined, 
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error starting Spotify playback:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to start playback' }, { status: 500 });
  }
}

