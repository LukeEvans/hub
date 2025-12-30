import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = params;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching Spotify playlist tracks for ${id}:`, error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch playlist tracks' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = params;

  try {
    await axios.put('https://api.spotify.com/v1/me/player/play', {
      context_uri: `spotify:playlist:${id}`
    }, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error playing Spotify playlist ${id}:`, error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to play playlist' }, { status: 500 });
  }
}

