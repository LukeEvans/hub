import { NextResponse } from 'next/server';
import { db, Recipe } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const recipes = await db.getRecipes();
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }
      return NextResponse.json(recipe);
    }

    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '12');

    let recipes = await db.getRecipes();

    if (searchQuery) {
      recipes = recipes.filter(r => 
        r.name.toLowerCase().includes(searchQuery) || 
        r.description?.toLowerCase().includes(searchQuery) ||
        r.ingredients.some(i => i.item.toLowerCase().includes(searchQuery))
      );
    }

    // Sort by newest first
    recipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = recipes.length;
    const items = recipes.slice((page - 1) * perPage, page * perPage);

    return NextResponse.json({
      items,
      total,
      page,
      perPage
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const recipe: Recipe = await request.json();
    await db.saveRecipe(recipe);
    return NextResponse.json({ success: true, recipe });
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
    await db.deleteRecipe(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

