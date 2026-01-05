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

    if (action === 'quit' || action === 'reboot' || action === 'shutdown') {
      // Write the command to the file
      fs.writeFileSync(commandFilePath, action);
      
      // Also try to close the window as a fallback if possible
      return NextResponse.json({ 
        success: true, 
        message: `Command '${action}' sent to host system.` 
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('System API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

