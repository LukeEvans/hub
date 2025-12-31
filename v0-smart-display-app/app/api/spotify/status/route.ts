import { NextResponse } from 'next/server';
import { getSpotifyToken } from '@/lib/spotify-auth';
import axios from 'axios';

export async function GET() {
  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json({ connected: false });
  }

  try {
    // Optionally fetch user profile to get name
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    return NextResponse.json({ 
      connected: true, 
      display_name: response.data.display_name,
      email: response.data.email,
      product: response.data.product
    });
  } catch (error) {
    // If we can't fetch profile, maybe token is invalid but we still have it
    return NextResponse.json({ connected: true, error: 'Token might be invalid' });
  }
}

