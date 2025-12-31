import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import cache from '@/lib/cache';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'ha-config.json');

export async function GET() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ selectedEntities: [], entityNames: {} });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
    
    // Invalidate the curated states cache so the home page updates immediately
    cache.del('ha:states:curated');
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving Home Assistant config:', err);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

