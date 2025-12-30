import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SPOTIFY_TOKEN_PATH = process.env.SPOTIFY_TOKEN_PATH || './data/spotify/token.json';

export async function POST() {
  try {
    const absolutePath = path.resolve(process.cwd(), SPOTIFY_TOKEN_PATH);
    await fs.unlink(absolutePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true }); // Ignore error if file doesn't exist
  }
}

