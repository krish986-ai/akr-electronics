import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';

const subscribeSchema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: NextRequest) {
  let email: string;
  try {
    ({ email } = subscribeSchema.parse(await request.json()));
  } catch {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  try {
    const docRef = getAdminDb().collection('newsletterSubscribers').doc(normalized);
    const existing = await docRef.get();
    if (existing.exists) {
      // Re-subscribing (e.g. after an admin removed them) should reactivate,
      // not error — the customer just sees success either way.
      await docRef.update({ active: true });
    } else {
      await docRef.set({
        email: normalized,
        active: true,
        subscribedAt: new Date(),
      });
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[Newsletter Subscribe] Error:', error);
    return NextResponse.json({ error: 'Could not subscribe right now — please try again' }, { status: 500 });
  }
}
