import { NextRequest, NextResponse } from 'next/server';
import { verifyCreatorRequest } from '@/lib/auth/admin-guard';
import { getAdminDb } from '@/lib/firebase/admin';

interface PartnershipData {
  id?: string;
  name: string;
  logo: string;
  link: string;
  banner: string;
  description: string;
  enabled?: boolean;
}

export async function GET(request: NextRequest) {
  const check = await verifyCreatorRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const snapshot = await getAdminDb().collection('partnerships').orderBy('createdAt', 'desc').get();
    const partnerships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ partnerships });
  } catch {
    return NextResponse.json({ error: 'Failed to load partnerships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const check = await verifyCreatorRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: PartnershipData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.name || !body.logo || !body.link || !body.banner || !body.description) {
    return NextResponse.json({ error: 'All partnership fields are required' }, { status: 400 });
  }

  try {
    const docRef = await getAdminDb().collection('partnerships').add({
      name: body.name,
      logo: body.logo,
      link: body.link,
      banner: body.banner,
      description: body.description,
      enabled: true,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, id: docRef.id });
  } catch {
    return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const check = await verifyCreatorRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { id?: string; enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Partnership id is required' }, { status: 400 });
  }

  try {
    console.log('[Partnerships API PATCH] Updating partnership:', body.id, 'enabled:', body.enabled);
    await getAdminDb().collection('partnerships').doc(body.id).update({
      enabled: body.enabled ?? true,
    });
    console.log('[Partnerships API PATCH] Partnership updated successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Partnerships API PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update partnership' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const check = await verifyCreatorRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: PartnershipData & { id: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: 'Partnership id is required' }, { status: 400 });
  }

  if (!data.name || !data.logo || !data.link || !data.banner || !data.description) {
    return NextResponse.json({ error: 'All partnership fields are required' }, { status: 400 });
  }

  try {
    await getAdminDb().collection('partnerships').doc(id).update(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update partnership' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await verifyCreatorRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Partnership id is required' }, { status: 400 });
  }

  try {
    await getAdminDb().collection('partnerships').doc(body.id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete partnership' }, { status: 500 });
  }
}
