import { NextRequest, NextResponse } from 'next/server';
import { DeviceTokenRepository } from '@/lib/firestore/repositories';
import { verifyUserRequest } from '@/lib/auth/user-guard';

export async function POST(req: NextRequest) {
  const check = await verifyUserRequest(req);
  if (!check.ok || !check.uid) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = await req.json();
    const { token, platform } = body;
    if (!token || !platform) {
      return NextResponse.json({ error: 'token and platform are required' }, { status: 400 });
    }

    await DeviceTokenRepository.register(check.uid, token, platform);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register device token' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const check = await verifyUserRequest(req);
  if (!check.ok || !check.uid) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = await req.json();
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 });

    await DeviceTokenRepository.unregister(check.uid, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unregister device token' }, { status: 400 });
  }
}
