import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { authSuccessResponse, authErrorResponse } from '@/lib/auth/middleware';

// Verify session and get current user
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);

  if ('error' in auth) {
    return authErrorResponse(auth.error as string, auth.status as number);
  }

  return authSuccessResponse({
    user: auth.user,
    authenticated: true,
  });
}
