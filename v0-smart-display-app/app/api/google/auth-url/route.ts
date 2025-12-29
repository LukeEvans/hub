import { NextResponse } from 'next/server';
import { authClient } from '@/lib/google-auth';

export async function GET() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'openid',
    'email',
    'profile',
  ];
  
  const url = authClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return NextResponse.json({ url });
}

