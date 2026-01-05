import { NextResponse } from 'next/server';
import { db, MealPlanEntry } from '@/lib/db';

export async function GET() {
  try {
    const mealPlan = await db.getMealPlan();
    const recipes = await db.getRecipes();

    // Attach recipe details to meal plan entries
    const meals = mealPlan.map(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId);
      return {
        ...entry,
        name: recipe?.name || 'Unknown Recipe',
        imageUrl: recipe?.imageUrl,
      };
    });

    return NextResponse.json({ meals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const entry: MealPlanEntry = await request.json();
    if (!entry.id) {
      entry.id = Math.random().toString(36).substring(2, 9);
    }
    await db.addToMealPlan(entry);
    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await db.removeFromMealPlan(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

