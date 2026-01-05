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
      console.warn('Mealie: MEALIE_BASE_URL or MEALIE_API_TOKEN not configured');
      return NextResponse.json(getEmptyMealPlan());
    }

    // Try to resolve hub.local issues inside Docker by using 'mealie' service name if on internal network
    let effectiveBaseUrl = baseUrl;
    if (baseUrl.includes('hub.local')) {
      console.log('Mealie: hub.local detected, attempting to use internal "mealie" hostname for server-side call');
      effectiveBaseUrl = baseUrl.replace('hub.local', 'mealie');
    }

    // Try both current and household endpoints as different versions of Mealie use different paths
    const endpoints = [
      `${effectiveBaseUrl}/api/households/meal-plans/current`,
      `${effectiveBaseUrl}/api/meal-plans/current`
    ];

    let resp;
    let lastError;

    for (const url of endpoints) {
      try {
        console.log(`Mealie: Fetching meal plan from ${url}`);
        resp = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data && !url.includes('html') && (Array.isArray(resp.data) || resp.data.days || Array.isArray(resp.data?.mealPlan?.meals))) {
          break; // Found it!
        }
      } catch (e: any) {
        lastError = e;
        console.warn(`Mealie: Failed to fetch from ${url}: ${e.response?.status || e.message}`);
      }
    }

    if (!resp) {
      console.error('Mealie: All meal plan endpoints failed', lastError?.response?.data || lastError?.message);
      return NextResponse.json(getEmptyMealPlan());
    }
    
    // Mealie returns either a list of days, or an object with a days property
    const data = resp.data;
    console.log('Mealie: Meal plan raw data sample:', JSON.stringify(data).substring(0, 500));
    const days = Array.isArray(data) ? data : (data.days || []);
    console.log(`Mealie: Found ${days.length} days in meal plan`);
    
    const flattenedMeals = days.flatMap((day: any) => {
      const meals = day.meals || [];
      if (meals.length === 0) return [];
      
      return meals.map((meal: any) => ({
        id: meal.id,
        date: day.date,
        name: meal.recipe?.name || meal.name || 'Unknown Meal',
        recipeId: meal.recipeId || meal.recipe?.id,
        recipeSlug: meal.recipe?.slug, // Include slug for external linking
        entryType: meal.entryType,
        mealType: meal.mealType
      }));
    });

    console.log(`Mealie: Flattened into ${flattenedMeals.length} meals`);
    const payload = { mealPlan: { meals: flattenedMeals } };
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

