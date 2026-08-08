export interface BroadcastInput {
  subject: string;
  message: string;
  storeName: string;
}

// Plain text with blank-line paragraphs turns into <p> tags; anything the
// admin types is escaped first so it can't inject markup into the email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildBroadcastEmail(input: BroadcastInput): { html: string; text: string } {
  const paragraphs = input.message
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  const htmlParagraphs = paragraphs
    .map(p => `<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <h1 style="font-size:18px;margin:0 0 20px;">${escapeHtml(input.storeName)}</h1>
      ${htmlParagraphs}
      <p style="margin:24px 0 0;font-size:12px;color:#888;">
        You're receiving this because you subscribed to ${escapeHtml(input.storeName)}'s newsletter.
      </p>
    </div>
  `;

  const text = `${paragraphs.join('\n\n')}\n\n—\nYou're receiving this because you subscribed to ${input.storeName}'s newsletter.`;

  return { html, text };
}
