import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function GET() {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const [playbackResponse, devicesResponse] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }),
      axios.get('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }),
    ]);

    // playbackResponse.status can be 204 if no track is currently playing or if no device is active
    const playback = playbackResponse.status === 204 ? null : playbackResponse.data;
    const devices = devicesResponse.data.devices || [];

    return NextResponse.json({ playback, devices });
  } catch (error: any) {
    console.error('Error fetching Spotify playback:', error.response?.data || error.message);
    // If we get a 401 here, the token might be invalid even after refresh attempt
    if (error.response?.status === 401) {
       return NextResponse.json({ error: 'Authentication expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch playback' }, { status: 500 });
  }
}

