import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function GET() {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/queue', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching Spotify queue:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { uri } = await request.json();
    if (!uri) {
      return NextResponse.json({ error: 'Missing URI' }, { status: 400 });
    }

    await axios.post(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, null, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding to Spotify queue:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 });
  }
}

