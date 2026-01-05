import { NextResponse } from 'next/server';
import { db, Ingredient } from '@/lib/db';

export async function GET() {
  try {
    const mealPlan = await db.getMealPlan();
    const recipes = await db.getRecipes();

    // Get recipes for the upcoming week (today + 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const weeklyEntries = mealPlan.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= today && entryDate <= nextWeek;
    });

    const ingredientsMap = new Map<string, Ingredient>();

    weeklyEntries.forEach(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          // Simple aggregation logic: key by normalized item name
          const key = ing.item.toLowerCase().trim();
          if (ingredientsMap.has(key)) {
            const existing = ingredientsMap.get(key)!;
            // Try to combine amounts if units match
            if (existing.unit === ing.unit && existing.amount && ing.amount) {
              const total = parseFloat(existing.amount) + parseFloat(ing.amount);
              if (!isNaN(total)) {
                existing.amount = total.toString();
              }
            } else if (existing.unit !== ing.unit) {
              // Different units, just append to notes for now
              existing.note = `${existing.note || ''} (Also: ${ing.amount} ${ing.unit})`.trim();
            }
          } else {
            ingredientsMap.set(key, { ...ing });
          }
        });
      }
    });

    return NextResponse.json({ 
      ingredients: Array.from(ingredientsMap.values()) 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

