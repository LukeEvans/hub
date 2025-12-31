import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getGoogleToken, authClient } from '@/lib/google-auth';

const PICKER_SESSION_PATH = path.join(process.cwd(), 'data', 'picker-session.json');

export async function POST() {
  try {
    const token = await getGoogleToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { token: accessToken } = await authClient.getAccessToken();

    // Create a new picker session
    const response = await fetch('https://photospicker.googleapis.com/v1/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create picker session:', errorData);
      return NextResponse.json({ error: errorData.error?.message || 'Failed to create session' }, { status: response.status });
    }

    const session = await response.json();
    console.log('Picker session created:', session.id);

    // Save the session ID for later polling
    await fs.mkdir(path.dirname(PICKER_SESSION_PATH), { recursive: true });
    await fs.writeFile(PICKER_SESSION_PATH, JSON.stringify({
      sessionId: session.id,
      pickerUri: session.pickerUri,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      sessionId: session.id,
      pickerUri: session.pickerUri,
    });
  } catch (err) {
    console.error('Error creating picker session:', err);
    return NextResponse.json({ error: 'Failed to create picker session' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await fs.readFile(PICKER_SESSION_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ sessionId: null });
  }
}

