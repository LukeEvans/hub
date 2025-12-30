import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getGoogleToken, authClient } from '@/lib/google-auth';
import cache from '@/lib/cache';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'google-photos-config.json');
const PHOTOS_DIR = path.join(process.cwd(), 'photos', 'google');

async function downloadImage(url: string, destPath: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destPath, buffer);
}

export async function POST() {
  try {
    // 1. Get config
    let selectedAlbumId = null;
    try {
      const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
      selectedAlbumId = JSON.parse(configData).selectedAlbumId;
    } catch (err) {
      return NextResponse.json({ error: 'No album selected' }, { status: 400 });
    }

    // 2. Get token
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { token: accessToken } = await authClient.getAccessToken();

    // 3. Fetch media items
    let items = [];
    console.log('Syncing for album:', selectedAlbumId);
    if (selectedAlbumId === 'smart-highlights') {
      // Fetch from library (recent)
      const res = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      items = data.mediaItems || [];
      console.log(`Fetched ${items.length} items from library`);
    } else {
      // Fetch from specific album
      const res = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ albumId: selectedAlbumId, pageSize: 50 }),
      });
      const data = await res.json();
      items = data.mediaItems || [];
      console.log(`Fetched ${items.length} items from album ${selectedAlbumId}`);
    }

    // 4. Prepare directory
    await fs.mkdir(PHOTOS_DIR, { recursive: true });

    // 5. Download items
    const downloadedFiles = [];
    for (const item of items) {
      // Some items might not have mimeType in the list view, or might be videos
      const isImage = item.mimeType?.startsWith('image/') || item.mediaMetadata?.photo;
      if (!isImage) {
        console.log(`Skipping non-image item ${item.id} (mime: ${item.mimeType})`);
        continue;
      }

      const filename = `${item.id}.jpg`;
      const destPath = path.join(PHOTOS_DIR, filename);
      
      // Check if already exists to skip download
      try {
        await fs.access(destPath);
        downloadedFiles.push(filename);
      } catch {
        // Download with size parameter (optimized for display)
        const downloadUrl = `${item.baseUrl}=w2048-h1536`;
        try {
          await downloadImage(downloadUrl, destPath);
          downloadedFiles.push(filename);
          console.log(`Downloaded ${filename}`);
        } catch (err) {
          console.error(`Failed to download ${item.id}:`, err);
        }
      }
    }

    // 6. Cleanup old files
    const existingFiles = await fs.readdir(PHOTOS_DIR);
    let deletedCount = 0;
    for (const file of existingFiles) {
      if (!downloadedFiles.includes(file)) {
        await fs.unlink(path.join(PHOTOS_DIR, file));
        deletedCount++;
      }
    }
    console.log(`Sync complete. Downloaded: ${downloadedFiles.length}, Deleted: ${deletedCount}`);

    // 7. Clear the photos cache so the UI updates immediately
    cache.del('photos-list');

    // 8. Update config with last sync time
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));
    config.lastSyncTime = new Date().toISOString();
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));

    return NextResponse.json({ 
      success: true, 
      count: downloadedFiles.length,
      lastSyncTime: config.lastSyncTime
    });
  } catch (err) {
    console.error('Error syncing Google Photos:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

