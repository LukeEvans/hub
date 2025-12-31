import { NextResponse } from 'next/server';
import { haClient } from '@/lib/homeassistant';
import cache from '@/lib/cache';

export async function GET() {
  try {
    if (!haClient.isConfigured()) {
      return NextResponse.json([]);
    }

    const cacheKey = 'ha:areas';
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const areas = await haClient.getAreas();
    
    // We cache areas for longer since they don't change often
    cache.set(cacheKey, areas, 3600);

    return NextResponse.json(areas);
  } catch (err: any) {
    console.error('Home Assistant areas error:', err.message);
    return NextResponse.json([], { status: 500 });
  }
}

