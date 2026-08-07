import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { getAdminActionPassword } from '@/lib/auth/admin-password';

// Gate for the Payments section (QR payment verification / order approval).
// Any signed-in admin can reach /admin/payments, but the page stays locked
// client-side until this confirms the shared action password — the same one
// used for the QR change and order-delete actions. The creator bypasses this
// entirely client-side (never calls this route) since they already have
// unrestricted access.
export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.password || body.password !== (await getAdminActionPassword())) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
