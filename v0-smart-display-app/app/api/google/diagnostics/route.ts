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
    results.token.storedScopes = token.scope?.split(' ') || [];
    results.token.expiry = token.expiry_date ? new Date(token.expiry_date).toISOString() : 'Unknown';
    results.token.hasRefreshToken = !!token.refresh_token;

    const { token: accessToken } = await authClient.getAccessToken();

    // Verify actual access token scopes via Google's tokeninfo endpoint
    try {
      const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
      if (tokenInfoRes.ok) {
        const tokenInfo = await tokenInfoRes.json();
        results.token.actualScopes = tokenInfo.scope?.split(' ') || [];
        results.token.email = tokenInfo.email;
        results.token.expiresIn = tokenInfo.expires_in;
      } else {
        const errData = await tokenInfoRes.json();
        results.token.tokenInfoError = errData;
      }
    } catch (err: any) {
      results.token.tokenInfoError = err.message;
    }

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

    // 2. Test Photos Picker API (create a session to verify access)
    try {
      console.log('Testing Photos Picker API...');
      const photoRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      results.photos.status = photoRes.status;
      results.photos.statusText = photoRes.statusText;
      const data = await photoRes.json();
      
      if (!photoRes.ok) {
        results.photos.error = data;
        if (JSON.stringify(data).includes('not enabled') || JSON.stringify(data).includes('not used in project')) {
          results.photos.hint = "Photos Picker API is not enabled. Enable it in Google Cloud Console.";
        }
      } else {
        results.photos.status = 'Success (200)';
        results.photos.sessionId = data.id;
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

