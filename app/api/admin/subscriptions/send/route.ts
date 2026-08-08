import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-guard';
import { getServerConfig } from '@/lib/data/server-catalog';
import { sendEmail, isEmailConfigured } from '@/lib/email/resend';
import { buildBroadcastEmail } from '@/lib/email/broadcast';

const sendSchema = z.object({
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(10000),
  from: z.string().email().max(200).optional(),
  recipients: z.union([z.literal('all'), z.array(z.string().email()).min(1).max(2000)]),
});

export async function POST(request: NextRequest) {
  const check = await verifyAdminRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  if (!isEmailConfigured) {
    return NextResponse.json(
      { error: 'Email sending is not set up yet — RESEND_API_KEY / RESEND_FROM_EMAIL are not configured.' },
      { status: 400 }
    );
  }

  let body: z.infer<typeof sendSchema>;
  try {
    body = sendSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const db = getAdminDb();
  const snapshot = await db.collection('newsletterSubscribers').where('active', '==', true).get();
  const activeEmails = new Set(snapshot.docs.map(doc => (doc.data().email as string).toLowerCase()));

  // Only ever send to real, currently-active subscribers — a "selected"
  // list is intersected against that set rather than trusted as-is, so this
  // endpoint can't be used to mail arbitrary addresses.
  const recipients =
    body.recipients === 'all'
      ? Array.from(activeEmails)
      : body.recipients.map(e => e.toLowerCase()).filter(e => activeEmails.has(e));

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No matching active subscribers to send to' }, { status: 400 });
  }

  const store = await getServerConfig();
  const { html, text } = buildBroadcastEmail({
    subject: body.subject,
    message: body.message,
    storeName: store.storeName,
  });

  const results = await Promise.allSettled(
    recipients.map(to => sendEmail({ to, subject: body.subject, html, text, from: body.from }))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed, total: recipients.length });
}
