import { NextResponse } from 'next/server';
import { authClient } from '@/lib/google-auth';

export async function GET() {
  console.log('Generating Google Auth URL...');
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/photos.readonly',
    'https://www.googleapis.com/auth/photos.readonly.appmanaged',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/photoslibrary',
    'openid',
    'email',
    'profile',
  ];
  
  try {
    const url = authClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent select_account', // Force consent AND account selection
      include_granted_scopes: false, // Don't include previously granted scopes, start fresh
    });
    console.log('Auth URL generated with scopes:', scopes.join(', '));
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating Auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}

