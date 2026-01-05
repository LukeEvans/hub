import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import cache from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '20';
    const search = searchParams.get('search') || '';

    const cacheKey = `mealie-recipes-${page}-${perPage}-${search}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      });
    }

    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json({ items: [], total: 0, page: 1, perPage: 20 });
    }

    console.log(`Mealie: Fetching recipes from ${baseUrl}/api/recipes`);
    const resp = await axios.get(`${baseUrl}/api/recipes`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page,
        perPage,
        orderBy: 'name',
        orderDirection: 'asc',
        search
      }
    });
    
    const payload = resp.data;
    cache.set(cacheKey, payload, 300); // 5 min

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (err: any) {
    console.error('Mealie recipes error', err.response?.data || err.message);
    return NextResponse.json({ items: [], total: 0, page: 1, perPage: 20 });
  }
}

