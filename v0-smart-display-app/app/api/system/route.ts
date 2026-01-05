import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // Path to the shared data directory (mounted in Docker)
    const commandFilePath = path.join(process.cwd(), 'data', 'system_command');
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the command to the file
    fs.writeFileSync(commandFilePath, action);
    // Ensure the file is readable/writable by the host user (pi)
    try {
      fs.chmodSync(commandFilePath, 0o666);
    } catch (e) {
      console.warn('Could not set permissions on command file:', e);
    }
    
    console.log(`System action '${action}' written to ${commandFilePath}`);

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('System API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

