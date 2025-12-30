import { NextRequest, NextResponse } from 'next/server';
import { authClient, saveGoogleToken } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  try {
    console.log('Exchanging code for tokens...');
    const { tokens } = await authClient.getToken(code);
    console.log('Tokens received:', Object.keys(tokens));
    if (!tokens.refresh_token) {
      console.warn('No refresh token received. User might need to re-consent.');
    }
    await saveGoogleToken(tokens);
    console.log('Tokens saved successfully');
    return new NextResponse('Google auth completed. You can close this tab.');
  } catch (err) {
    console.error('OAuth callback error', err);
    return new NextResponse('Failed to complete Google auth', { status: 500 });
  }
}

