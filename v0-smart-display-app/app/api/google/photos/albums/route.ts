import { NextResponse } from 'next/server';
import { getGoogleToken, authClient } from '@/lib/google-auth';

export async function GET() {
  try {
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Add a virtual "Smart Highlights" album option
    const albums = [
      { id: 'smart-highlights', title: 'Smart Highlights (Recent)' }
    ];

    try {
      // Refresh token if needed
      const { token: accessToken } = await authClient.getAccessToken();
      
      // Log current credentials to see what scopes we actually have
      const credentials = authClient.credentials;
      console.log('--- Google Photos Albums Fetch ---');
      console.log('Current token scopes:', credentials.scope);

      if (!accessToken) {
        console.error('No access token available after refresh attempt');
        return NextResponse.json({ albums }); // Return at least virtual albums
      }

      if (!credentials.scope?.includes('https://www.googleapis.com/auth/photoslibrary.readonly') && 
          !credentials.scope?.includes('https://www.googleapis.com/auth/photoslibrary')) {
        console.error('ERROR: Token does not have required photoslibrary scopes. Found:', credentials.scope);
        return NextResponse.json({ 
          albums, 
          error: 'Insufficient permissions. Please log in again and check the Google Photos box.' 
        });
      }

      console.log('Fetching owned albums from Google Photos API...');
      const response = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Google Photos Albums Raw Response:', JSON.stringify(data, null, 2));
        if (data.albums) {
          albums.push(...data.albums);
          console.log(`Successfully added ${data.albums.length} owned albums`);
        } else {
          console.log('No owned albums found in Google Photos');
        }
      } else {
        const errorData = await response.json();
        console.error('Google Photos API error (owned):', JSON.stringify(errorData, null, 2));
      }

      // Also try to fetch shared albums
      console.log('Fetching shared albums...');
      const sharedResponse = await fetch('https://photoslibrary.googleapis.com/v1/sharedAlbums?pageSize=50', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (sharedResponse.ok) {
        const sharedData = await sharedResponse.json();
        if (sharedData.sharedAlbums) {
          // Add a tag to distinguish shared albums
          const taggedShared = sharedData.sharedAlbums.map((a: any) => ({
            ...a,
            title: `${a.title} (Shared)`
          }));
          albums.push(...taggedShared);
          console.log(`Successfully added ${taggedShared.length} shared albums`);
        } else {
          console.log('No shared albums found in Google Photos');
        }
      } else {
        const errorData = await sharedResponse.json();
        console.error('Google Photos API error (shared):', JSON.stringify(errorData, null, 2));
      }
    } catch (apiErr) {
      console.error('Error during Google Photos API calls:', apiErr);
      // Fall through to return whatever we have (at least smart-highlights)
    }

    return NextResponse.json({ albums });
  } catch (err) {
    console.error('Error fetching Google Photos albums:', err);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}

