import { NextResponse } from 'next/server';
import axios from 'axios';
import cache from '@/lib/cache';

function getEmptyMealPlan() {
  return { mealPlan: { meals: [] } };
}

export async function GET() {
  try {
    const cacheKey = 'mealie-mealplan';
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      });
    }

    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json(getEmptyMealPlan());
    }

    const resp = await axios.get(`${baseUrl}/api/meal-plans/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const payload = resp.data;
    cache.set(cacheKey, payload, 1800); // 30 min

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    });
  } catch (err: any) {
    console.error('Mealie meal plan error', err.response?.data || err.message);
    return NextResponse.json(getEmptyMealPlan());
  }
}

