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
    console.log('Tokens received for scopes:', tokens.scope);
    
    if (!tokens.scope?.includes('photoslibrary.readonly')) {
      console.error('CRITICAL: Photos scope was NOT granted by the user!');
    }

    if (!tokens.refresh_token) {
      console.warn('No refresh token received. User might need to re-consent.');
    }
    await saveGoogleToken(tokens);
    console.log('Tokens saved successfully');
    
    // Return a more helpful message if scope is missing
    if (!tokens.scope?.includes('photoslibrary.readonly')) {
      return new NextResponse('Auth completed, but PHOTOS ACCESS WAS DENIED. Please log in again and make sure to CHECK THE BOX for Google Photos access.');
    }

    return new NextResponse('Google auth completed. You can close this tab.');
  } catch (err) {
    console.error('OAuth callback error', err);
    return new NextResponse('Failed to complete Google auth', { status: 500 });
  }
}

