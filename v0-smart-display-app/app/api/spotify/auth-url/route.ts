import { NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify-auth';

export async function GET() {
  try {
    const url = getSpotifyAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating Spotify Auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}

