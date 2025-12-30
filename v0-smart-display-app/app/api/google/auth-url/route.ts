import { NextResponse } from 'next/server';
import { authClient } from '@/lib/google-auth';

export async function GET() {
  console.log('Generating Google Auth URL...');
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'openid',
    'email',
    'profile',
  ];
  
  try {
    const url = authClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true, // Crucial for adding new scopes to existing tokens
    });
    console.log('Auth URL generated with scopes:', scopes.join(', '));
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating Auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}

