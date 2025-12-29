import { NextRequest, NextResponse } from 'next/server';
import { authClient, saveGoogleToken } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  try {
    const { tokens } = await authClient.getToken(code);
    await saveGoogleToken(tokens);
    return new NextResponse('Google auth completed. You can close this tab.');
  } catch (err) {
    console.error('OAuth callback error', err);
    return new NextResponse('Failed to complete Google auth', { status: 500 });
  }
}

