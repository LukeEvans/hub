import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const MEAL_PLAN_FILE = path.join(DATA_DIR, 'mealplan.json');
const SHOPPING_LIST_FILE = path.join(DATA_DIR, 'shopping-list.json');

export interface Ingredient {
  item: string;
  amount?: string;
  unit?: string;
  note?: string;
  stepIndices?: number[]; // Which steps this ingredient is used in
}

export interface ShoppingListItem extends Ingredient {
  id: string;
  status: 'need' | 'have';
  category?: string;
  isManual?: boolean;
}

export interface Instruction {
  text: string;
  stepNumber: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  totalTime?: string;
  yield?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUrl?: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface MealPlanEntry {
  id: string;
  date: string; // ISO date string
  recipeId: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  async getRecipes(): Promise<Recipe[]> {
    return readJson<Recipe[]>(RECIPES_FILE, []);
  },

  async saveRecipe(recipe: Recipe): Promise<void> {
    const recipes = await this.getRecipes();
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }
    await writeJson(RECIPES_FILE, recipes);
  },

  async deleteRecipe(id: string): Promise<void> {
    const recipes = await this.getRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    await writeJson(RECIPES_FILE, filtered);
  },

  async getMealPlan(): Promise<MealPlanEntry[]> {
    return readJson<MealPlanEntry[]>(MEAL_PLAN_FILE, []);
  },

  async saveMealPlan(entries: MealPlanEntry[]): Promise<void> {
    await writeJson(MEAL_PLAN_FILE, entries);
  },

  async addToMealPlan(entry: MealPlanEntry): Promise<void> {
    const plan = await this.getMealPlan();
    plan.push(entry);
    await writeJson(MEAL_PLAN_FILE, plan);
  },

  async updateMealPlanEntry(entry: MealPlanEntry): Promise<void> {
    const plan = await this.getMealPlan();
    const index = plan.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      plan[index] = entry;
      await writeJson(MEAL_PLAN_FILE, plan);
    }
  },

  async removeFromMealPlan(id: string): Promise<void> {
    const plan = await this.getMealPlan();
    const filtered = plan.filter(e => e.id !== id);
    await writeJson(MEAL_PLAN_FILE, filtered);
  },

  async getShoppingList(): Promise<ShoppingListItem[]> {
    return readJson<ShoppingListItem[]>(SHOPPING_LIST_FILE, []);
  },

  async saveShoppingList(items: ShoppingListItem[]): Promise<void> {
    await writeJson(SHOPPING_LIST_FILE, items);
  }
};

