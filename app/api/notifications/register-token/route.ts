import { NextRequest, NextResponse } from 'next/server';
import { DeviceTokenRepository } from '@/lib/firestore/repositories';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { token, platform } = body;
    if (!token || !platform) {
      return NextResponse.json({ error: 'token and platform are required' }, { status: 400 });
    }

    await DeviceTokenRepository.register(userId, token, platform);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register device token' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 });

    await DeviceTokenRepository.unregister(userId, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unregister device token' }, { status: 400 });
  }
}
