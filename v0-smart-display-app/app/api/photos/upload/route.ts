import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import cache from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('--- Photo Upload Start ---');
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    console.log(`Received ${files.length} items from formData`);

    if (!files || files.length === 0) {
      console.warn('No files found in formData');
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const photosDir = path.join(process.cwd(), 'photos');
    console.log(`Target photos directory: ${photosDir}`);
    
    // Ensure directory exists
    await fs.mkdir(photosDir, { recursive: true });

    const savedFiles = [];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if it's a File object (has name and arrayBuffer)
      if (!file || typeof file === 'string' || !('name' in file)) {
        console.warn(`Item at index ${i} is not a file, skipping`);
        continue;
      }

      const originalName = file.name;
      const ext = path.extname(originalName).toLowerCase();
      
      console.log(`Processing file: ${originalName}, extension: ${ext}`);

      if (!allowedExtensions.includes(ext)) {
        console.warn(`Skipping file with unsupported extension: ${originalName}`);
        continue;
      }

      // Generate a unique filename: upload_[timestamp]_[index]_[sanitized_name]
      const sanitizedName = originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const filename = `upload_${Date.now()}_${i}_${sanitizedName}`;
      const filePath = path.join(photosDir, filename);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await fs.writeFile(filePath, buffer);
        savedFiles.push(filename);
        console.log(`Saved file: ${filename} (${buffer.length} bytes)`);
      } catch (fileErr) {
        console.error(`Failed to save file ${originalName}:`, fileErr);
      }
    }

    console.log(`Upload complete. Saved ${savedFiles.length} files.`);

    // Clear the photos cache so the UI updates
    cache.del('photos-list');

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${savedFiles.length} photo(s)`,
      count: savedFiles.length,
      savedFiles
    });
  } catch (error) {
    console.error('Critical error in photo upload route:', error);
    return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 });
  }
}

