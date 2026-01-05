import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;

    if (!baseUrl || !token) {
      return new NextResponse('Not Configured', { status: 404 });
    }

    // Try to get the original image first
    const imageUrl = `${baseUrl}/api/media/recipes/${id}/images/original.webp`;
    
    const resp = await axios.get(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });

    return new NextResponse(resp.data, {
      headers: {
        'Content-Type': resp.headers['content-type'] || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (err: any) {
    // If original fails, maybe try minified or return a placeholder
    return new NextResponse('Not Found', { status: 404 });
  }
}

