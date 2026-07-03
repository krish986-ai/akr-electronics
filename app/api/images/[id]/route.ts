import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doc = await getAdminDb().collection('images').doc(decodeURIComponent(id)).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const { data, mimeType } = doc.data() as { data: string; mimeType?: string };
    return new NextResponse(Buffer.from(data, 'base64'), {
      headers: {
        'Content-Type': mimeType ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
