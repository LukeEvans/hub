import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'photos');
    const files = await fs.readdir(dir);
    const images = files
      .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .map((f) => `/api/photos/serve/${f}`);
    return NextResponse.json({ images });
  } catch (err) {
    console.error('Photos error', err);
    return NextResponse.json({ images: [] });
  }
}

