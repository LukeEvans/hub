import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getGoogleToken, authClient } from '@/lib/google-auth';

const PICKER_SESSION_PATH = path.join(process.cwd(), 'data', 'picker-session.json');
const PICKER_MEDIA_PATH = path.join(process.cwd(), 'data', 'picker-media.json');

export async function GET() {
  try {
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Load session
    let sessionData;
    try {
      const data = await fs.readFile(PICKER_SESSION_PATH, 'utf-8');
      sessionData = JSON.parse(data);
    } catch {
      return NextResponse.json({ error: 'No active picker session' }, { status: 400 });
    }

    const { token: accessToken } = await authClient.getAccessToken();

    // Poll the session status
    const response = await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionData.sessionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to poll session:', errorData);
      return NextResponse.json({ error: errorData.error?.message || 'Failed to poll session' }, { status: response.status });
    }

    const session = await response.json();
    console.log('Session status:', { id: session.id, mediaItemsSet: session.mediaItemsSet });

    // If user has finished selecting, fetch the media items
    if (session.mediaItemsSet) {
      const mediaItems = await fetchAllMediaItems(sessionData.sessionId, accessToken);
      
      // Save media items for sync
      await fs.writeFile(PICKER_MEDIA_PATH, JSON.stringify({
        items: mediaItems,
        fetchedAt: new Date().toISOString(),
      }));

      return NextResponse.json({
        status: 'complete',
        mediaItemsSet: true,
        count: mediaItems.length,
      });
    }

    return NextResponse.json({
      status: 'pending',
      mediaItemsSet: false,
    });
  } catch (err) {
    console.error('Error polling picker session:', err);
    return NextResponse.json({ error: 'Failed to poll session' }, { status: 500 });
  }
}

async function fetchAllMediaItems(sessionId: string, accessToken: string | null | undefined): Promise<any[]> {
  const allItems: any[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`https://photospicker.googleapis.com/v1/mediaItems`);
    url.searchParams.set('sessionId', sessionId);
    url.searchParams.set('pageSize', '100');
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch media items:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch media items');
    }

    const data = await response.json();
    if (data.mediaItems) {
      allItems.push(...data.mediaItems);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  console.log(`Fetched ${allItems.length} media items from picker`);
  return allItems;
}

