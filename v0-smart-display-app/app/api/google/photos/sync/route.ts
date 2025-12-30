import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getGoogleToken } from '@/lib/google-auth';
import cache from '@/lib/cache';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'google-photos-config.json');
const PICKER_MEDIA_PATH = path.join(process.cwd(), 'data', 'picker-media.json');
const PHOTOS_DIR = path.join(process.cwd(), 'photos', 'google');

async function downloadImage(url: string, destPath: string) {
  const response = await fetch(url);
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

    if (items.length === 0) {
      return NextResponse.json({ error: 'No photos in selection. Pick some photos first.' }, { status: 400 });
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

