import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import cache from '@/lib/cache';

export async function GET() {
  try {
    const cacheKey = 'photos-list';
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      });
    }

    const dir = path.join(process.cwd(), 'photos');
    const files = await fs.readdir(dir);
    const images = files
      .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .map((f) => `/api/photos/serve/${f}`);
    
    const payload = { images };
    cache.set(cacheKey, payload, 3600); // 1 hour

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (err) {
    console.error('Photos error', err);
    return NextResponse.json({ images: [] });
  }
}

