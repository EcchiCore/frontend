
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ message: 'File uploaded successfully', url: fileUrl }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'An error occurred during upload.' }, { status: 500 });
  }
}
