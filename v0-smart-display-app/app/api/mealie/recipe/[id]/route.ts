import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import cache from '@/lib/cache';

function getEmptyRecipe() {
  return { name: 'Recipe unavailable', description: '', steps: [] };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `mealie-recipe-${id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      });
    }

    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json(getEmptyRecipe());
    }

    const resp = await axios.get(`${baseUrl}/api/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const payload = resp.data;
    cache.set(cacheKey, payload, 3600); // 1 hour

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (err: any) {
    console.error('Mealie recipe error', err.response?.data || err.message);
    return NextResponse.json(getEmptyRecipe());
  }
}

