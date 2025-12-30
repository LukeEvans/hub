import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getGoogleToken, authClient } from '@/lib/google-auth';
import cache from '@/lib/cache';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'google-photos-config.json');
const PICKER_MEDIA_PATH = path.join(process.cwd(), 'data', 'picker-media.json');
const PHOTOS_DIR = path.join(process.cwd(), 'photos', 'google');

async function downloadImage(url: string, destPath: string, accessToken?: string | null) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(destPath, new Uint8Array(arrayBuffer));
}

export async function POST() {
  try {
    // 1. Get token
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { token: accessToken } = await authClient.getAccessToken();

    // 2. Load picker media items
    let pickerData;
    try {
      const data = await fs.readFile(PICKER_MEDIA_PATH, 'utf-8');
      pickerData = JSON.parse(data);
    } catch {
      return NextResponse.json({ error: 'No photos selected. Use the Pick Photos button first.' }, { status: 400 });
    }

    const items = pickerData.items || [];
    console.log('--- Google Photos Sync Start ---');
    console.log(`Syncing ${items.length} picker-selected items`);
    if (items.length > 0) {
      console.log('First item structure:', JSON.stringify(items[0], null, 2));
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'No photos in selection. Pick some photos first.' }, { status: 400 });
    }

    // 4. Prepare directory
    await fs.mkdir(PHOTOS_DIR, { recursive: true });

    // 5. Download items
    const downloadedFiles = [];
    for (const item of items) {
      // Picker API may have mediaFile nested, or fields at top level
      const mediaFile = item.mediaFile || item;
      const mimeType = mediaFile.mimeType || item.mimeType;
      const baseUrl = mediaFile.baseUrl || item.baseUrl;
      const itemId = item.id || item.mediaItemId;

      // Skip only if we KNOW it's a video
      if (mimeType?.startsWith('video/')) {
        console.log(`Skipping video item ${itemId}`);
        continue;
      }

      if (!baseUrl) {
        console.log(`Skipping item ${itemId} - no baseUrl`);
        continue;
      }

      const filename = `${itemId}.jpg`;
      const destPath = path.join(PHOTOS_DIR, filename);
      
      // Check if already exists to skip download
      try {
        await fs.access(destPath);
        downloadedFiles.push(filename);
      } catch {
        // Download with size parameter (optimized for display)
        const downloadUrl = `${baseUrl}=w2048-h1536`;
        try {
          await downloadImage(downloadUrl, destPath, accessToken);
          downloadedFiles.push(filename);
          console.log(`Downloaded ${filename}`);
        } catch (err) {
          console.error(`Failed to download ${itemId}:`, err);
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
    let config: any = {};
    try {
      config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));
    } catch {
      // Config doesn't exist yet, create it
    }
    config.lastSyncTime = new Date().toISOString();
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
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

