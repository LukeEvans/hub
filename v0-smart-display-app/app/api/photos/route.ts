import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import cache from '@/lib/cache';

export async function GET() {
  try {
    const cacheKey = 'photos-list';
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const photosDir = path.join(process.cwd(), 'photos');
    const googlePhotosDir = path.join(photosDir, 'google');
    
    let images: string[] = [];

    // 1. Get local photos from the base directory
    try {
      const baseFiles = await fs.readdir(photosDir);
      const localImages = baseFiles
        .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
        .map((f) => `/api/photos/serve/${f}`);
      images = [...images, ...localImages];
    } catch (err) {
      // Ignore if directory doesn't exist
    }

    // 2. Get cached Google photos
    try {
      const googleFiles = await fs.readdir(googlePhotosDir);
      const googleImages = googleFiles
        .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
        .map((f) => `/api/photos/serve/google/${f}`);
      images = [...images, ...googleImages];
    } catch (err) {
      // Ignore if directory doesn't exist
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
