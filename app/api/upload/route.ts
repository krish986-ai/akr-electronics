import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage/storage-service';
import { validateImageFile } from '@/lib/validation/image-validation';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

export async function POST(req: NextRequest) {
  const check = await verifyAdminRequest(req);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file || !category) {
      return NextResponse.json(
        { error: 'File and category are required' },
        { status: 400 }
      );
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storageService.uploadImage(buffer, category as any, {
      name: file.name,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
