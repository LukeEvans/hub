import { NextResponse } from 'next/server';
import { db, ShoppingListItem, MealPlanEntry, Recipe } from '@/lib/db';

export async function GET() {
  try {
    const mealPlan = await db.getMealPlan();
    const recipes = await db.getRecipes();
    const existingList = await db.getShoppingList();

    // Get recipes for the upcoming week (today + 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const weeklyEntries = mealPlan.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= today && entryDate <= nextWeek;
    });

    const newList = [...existingList];
    const recipesMap = new Map(recipes.map(r => [r.id, r]));

    weeklyEntries.forEach(entry => {
      const recipe = recipesMap.get(entry.recipeId);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          const name = ing.item.toLowerCase().trim();
          const existing = newList.find(item => item.item.toLowerCase().trim() === name);
          
          if (!existing) {
            newList.push({
              id: Math.random().toString(36).substring(2, 9),
              item: ing.item,
              amount: ing.amount,
              unit: ing.unit,
              status: 'need',
              isManual: false
            });
          }
        });
      }
    });

    // Save if updated
    if (newList.length !== existingList.length) {
      await db.saveShoppingList(newList);
    }

    return NextResponse.json({ items: newList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existingList = await db.getShoppingList();
    
    if (body.action === 'toggle') {
      const item = existingList.find(i => i.id === body.id);
      if (item) {
        item.status = item.status === 'need' ? 'have' : 'need';
      }
    } else if (body.action === 'delete') {
      const index = existingList.findIndex(i => i.id === body.id);
      if (index >= 0) {
        existingList.splice(index, 1);
      }
    } else if (body.action === 'add') {
      existingList.push({
        id: Math.random().toString(36).substring(2, 9),
        item: body.item,
        amount: body.amount,
        unit: body.unit,
        status: 'need',
        isManual: true
      });
    } else if (body.action === 'clear_have') {
      const remaining = existingList.filter(i => i.status === 'need');
      await db.saveShoppingList(remaining);
      return NextResponse.json({ items: remaining });
    }

    await db.saveShoppingList(existingList);
    return NextResponse.json({ items: existingList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

