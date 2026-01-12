import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'system_config.json');

const DEFAULT_CONFIG = {
  sleepScheduleEnabled: false,
  sleepStartTime: '22:00',
  sleepEndTime: '07:00',
  orientation: 'landscape',
};

export async function GET() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    
    // Read current config to merge
    let currentConfig = {};
    try {
      const data = await fs.readFile(CONFIG_PATH, 'utf-8');
      currentConfig = JSON.parse(data);
    } catch {
      currentConfig = DEFAULT_CONFIG;
    }

    const newConfig = { ...currentConfig, ...config };
    await fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    
    return NextResponse.json({ success: true, config: newConfig });
  } catch (err) {
    console.error('Error saving system config:', err);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

