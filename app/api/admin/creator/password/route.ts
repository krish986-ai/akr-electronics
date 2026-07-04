import { NextRequest, NextResponse } from 'next/server';
import { verifyCreatorRequest } from '@/lib/auth/admin-guard';
import { ADMIN_ACTION_PASSWORD } from '@/lib/auth/admin-password';

export async function PUT(request: NextRequest) {
  const check = await verifyCreatorRequest(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword) {
    return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
  }
  if (!newPassword) {
    return NextResponse.json({ error: 'New password is required' }, { status: 400 });
  }
  if (currentPassword !== ADMIN_ACTION_PASSWORD) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
  }

  try {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');

    const filePath = path.join(process.cwd(), 'lib', 'auth', 'admin-password.ts');
    const content = `// Extra password (beyond admin login) for high-risk admin actions:\n// changing the payment QR and performing other sensitive operations.\nexport const ADMIN_ACTION_PASSWORD = '${newPassword}';\n`;

    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ ok: true, message: 'Password changed successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
