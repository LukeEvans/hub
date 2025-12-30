import { NextResponse } from 'next/server';
import { getGoogleToken, authClient } from '@/lib/google-auth';

export async function GET() {
  try {
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Refresh token if needed
    const { token: accessToken } = await authClient.getAccessToken();

    const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch albums');
    }

    const data = await response.json();
    
    // Add a virtual "Smart Highlights" album option
    const albums = [
      { id: 'smart-highlights', title: 'Smart Highlights (Recent)' },
      ...(data.albums || [])
    ];

    return NextResponse.json({ albums });
  } catch (err) {
    console.error('Error fetching Google Photos albums:', err);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}

