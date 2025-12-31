import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify-auth';
import cache from '@/lib/cache';

export async function GET() {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const cacheKey = 'spotify:playlists';
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    const playlists = response.data.items;
    cache.set(cacheKey, playlists, 300); // 5 min cache
    return NextResponse.json(playlists);
  } catch (error: any) {
    console.error('Error fetching Spotify playlists:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

