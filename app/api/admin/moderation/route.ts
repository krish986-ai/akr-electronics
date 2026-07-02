import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';

const moderationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('review-status'),
    id: z.string(),
    status: z.enum(['APPROVED', 'PENDING', 'REJECTED']),
  }),
  z.object({
    kind: z.literal('question-answer'),
    id: z.string(),
    answer: z.string().min(2).max(2000),
  }),
]);

export async function PATCH(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const action = moderationSchema.parse(await request.json());
    const db = getAdminDb();

    if (action.kind === 'review-status') {
      await db.collection('reviews').doc(action.id).update({ status: action.status });
    } else {
      await db.collection('questions').doc(action.id).update({ answer: action.answer });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid moderation request' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Moderation update failed' }, { status: 500 });
  }
}
