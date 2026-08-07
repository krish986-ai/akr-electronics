import { Resend } from 'resend';

// Same on/off pattern as lib/firebase/config.ts's isFirebaseConfigured — until
// a real key is set in the environment (Vercel dashboard, per .env.example),
// email sends are skipped rather than throwing, so local dev and Phase 0
// environments without the key configured keep working.
const apiKey = process.env.RESEND_API_KEY ?? '';
const fromAddress = process.env.RESEND_FROM_EMAIL || 'A.K.R Electronics <orders@akrelectronics.com>';

export const isEmailConfigured = Boolean(apiKey);

const resend = isEmailConfigured ? new Resend(apiKey) : null;

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping email send:', input.subject);
    return;
  }
  const result = await resend.emails.send({
    from: fromAddress,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
}
