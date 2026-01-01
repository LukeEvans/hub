import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import cache from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('--- GET /api/photos ---');
  try {
    const cacheKey = 'photos-list';
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached photos-list');
      return NextResponse.json(cached);
    }

    const photosDir = path.join(process.cwd(), 'photos');
    console.log(`Searching for photos in: ${photosDir}`);
    const googlePhotosDir = path.join(photosDir, 'google');
    
    let images: string[] = [];

    // 1. Get local photos from the base directory
    try {
      const baseFiles = await fs.readdir(photosDir);
      console.log(`Found ${baseFiles.length} total items in base photos directory`);
      
      const fileStats = await Promise.all(
        baseFiles
          .filter((f) => /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(f))
          .map(async (f) => {
            const stat = await fs.stat(path.join(photosDir, f));
            return {
              url: `/api/photos/serve/${f}`,
              mtime: stat.mtimeMs,
            };
          })
      );

      // Sort local images by modification time descending (newest first)
      const localImages = fileStats
        .sort((a, b) => b.mtime - a.mtime)
        .map((f) => f.url);

      console.log(`Matched ${localImages.length} local images`);
      images = [...images, ...localImages];
    } catch (err) {
      console.warn(`Could not read base photos directory: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 2. Get cached Google photos
    try {
      const googleFiles = await fs.readdir(googlePhotosDir);
      console.log(`Found ${googleFiles.length} items in google photos directory`);
      
      const fileStats = await Promise.all(
        googleFiles
          .filter((f) => /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(f))
          .map(async (f) => {
            const stat = await fs.stat(path.join(googlePhotosDir, f));
            return {
              url: `/api/photos/serve/google/${f}`,
              mtime: stat.mtimeMs,
            };
          })
      );

      // Sort google images by modification time descending
      const googleImages = fileStats
        .sort((a, b) => b.mtime - a.mtime)
        .map((f) => f.url);

      console.log(`Matched ${googleImages.length} google images`);
      images = [...images, ...googleImages];
    } catch (err) {
      console.warn(`Could not read google photos directory: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    // Sort or shuffle? For now just return
    const payload = { images };
    cache.set(cacheKey, payload, 300); // 5 minutes cache for responsiveness

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (err) {
    console.error('Photos error', err);
    return NextResponse.json({ images: [] });
  }
}
