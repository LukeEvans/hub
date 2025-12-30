import { NextRequest, NextResponse } from 'next/server';
import { exchangeSpotifyCode } from '@/lib/spotify-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  try {
    await exchangeSpotifyCode(code);
    return new NextResponse('Spotify auth completed. You can close this tab.');
  } catch (err) {
    console.error('Spotify OAuth callback error', err);
    return new NextResponse('Failed to complete Spotify auth', { status: 500 });
  }
}

