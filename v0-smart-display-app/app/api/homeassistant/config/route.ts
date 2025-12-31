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
    console.log('Saving HA config:', JSON.stringify(config));
    
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
    
    // Invalidate the curated states cache so the home page updates immediately
    console.log('Invalidating HA states cache...');
    cache.del('ha:states:curated');
    cache.del('ha:states:all'); // Also invalidate 'all' to be safe
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error saving Home Assistant config:', err.message);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

