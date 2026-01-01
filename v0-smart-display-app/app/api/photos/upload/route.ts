import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import cache from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const photosDir = path.join(process.cwd(), 'photos');
    
    // Ensure directory exists
    await fs.mkdir(photosDir, { recursive: true });

    const savedFiles = [];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        console.warn(`Skipping file with unsupported extension: ${file.name}`);
        continue;
      }

      // Generate a unique filename: upload_[timestamp]_[sanitized_name]
      const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const filename = `upload_${Date.now()}_${sanitizedName}`;
      const filePath = path.join(photosDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      await fs.writeFile(filePath, buffer);
      savedFiles.push(filename);
    }

    // Clear the photos cache so the UI updates
    cache.del('photos-list');

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${savedFiles.length} photo(s)`,
      count: savedFiles.length,
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 });
  }
}

