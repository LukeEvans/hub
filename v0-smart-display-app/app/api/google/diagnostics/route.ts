import { NextResponse } from 'next/server';
import { getGoogleToken, authClient } from '@/lib/google-auth';

export async function GET() {
  const results: any = {
    token: {
      exists: false,
      scopes: [],
      expiry: null
    },
    calendar: {
      status: 'Not tested',
      error: null
    },
    photos: {
      status: 'Not tested',
      error: null
    }
  };

  try {
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'No token found. Please log in.' }, { status: 401 });
    }

    results.token.exists = true;
    results.token.scopes = token.scope?.split(' ') || [];
    results.token.expiry = token.expiry_date ? new Date(token.expiry_date).toISOString() : 'Unknown';

    const { token: accessToken } = await authClient.getAccessToken();

    // 1. Test Calendar API
    try {
      console.log('Testing Calendar API...');
      const calRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      results.calendar.status = calRes.status;
      if (!calRes.ok) {
        results.calendar.error = await calRes.json();
      } else {
        const data = await calRes.json();
        results.calendar.count = data.items?.length || 0;
      }
    } catch (err: any) {
      results.calendar.status = 'Error';
      results.calendar.error = err.message;
    }

    // 2. Test Photos API
    try {
      console.log('Testing Photos API...');
      const photoRes = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=1', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      results.photos.status = photoRes.status;
      results.photos.statusText = photoRes.statusText;
      const data = await photoRes.json();
      
      if (!photoRes.ok) {
        results.photos.error = data;
        // Check for specific "api not enabled" clues
        if (JSON.stringify(data).includes('not enabled') || JSON.stringify(data).includes('not used in project')) {
          results.photos.hint = "API is not enabled in Google Cloud Console. Click the link I provided to enable it.";
        }
      } else {
        results.photos.status = 'Success (200)';
        results.photos.albumCount = data.albums?.length || 0;
      }
    } catch (err: any) {
      results.photos.status = 'Error';
      results.photos.error = err.message;
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

