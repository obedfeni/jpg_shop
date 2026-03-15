import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const filename = (form.get('filename') as string) || 'upload';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;
    const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');

    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: `jersey-plug/${cleanName}_${Date.now()}`,
      overwrite: true, quality: 'auto', fetch_format: 'auto',
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    });

    return NextResponse.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  } catch (err) {
    console.error('POST /upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
