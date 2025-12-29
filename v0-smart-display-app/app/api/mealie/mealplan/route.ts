import { NextResponse } from 'next/server';
import axios from 'axios';

function getEmptyMealPlan() {
  return { mealPlan: { meals: [] } };
}

export async function GET() {
  try {
    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json(getEmptyMealPlan());
    }

    const resp = await axios.get(`${baseUrl}/api/meal-plans/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return NextResponse.json(resp.data);
  } catch (err: any) {
    console.error('Mealie meal plan error', err.response?.data || err.message);
    return NextResponse.json(getEmptyMealPlan());
  }
}

