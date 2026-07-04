import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';

const bulkEnquirySchema = z.object({
  contactName: z.string().min(2).max(100),
  organisation: z.string().min(2).max(150),
  email: z.string().email().max(150),
  phone: z.string().min(6).max(20),
  gstin: z.string().max(20).optional(),
  requirements: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const enquiry = bulkEnquirySchema.parse(await request.json());
    const ref = getAdminDb().collection('bulkEnquiries').doc();
    await ref.set({
      id: ref.id,
      ...enquiry,
      status: 'NEW',
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}
