import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  // In a real app, invalidate the session/token
  // For now, just return success - client will remove token from localStorage

  return NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );
}
