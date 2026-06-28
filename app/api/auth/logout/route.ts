import { NextRequest } from 'next/server';
import { getTokenFromRequest, authSuccessResponse, authErrorResponse } from '@/lib/auth/middleware';
import { userService } from '@/lib/auth/user-service';
import { firebaseAuthService } from '@/lib/auth/firebase';

export async function POST(req: NextRequest) {
  try {
    // Get token
    const token = getTokenFromRequest(req);

    // Invalidate session in database if token exists
    if (token) {
      await userService.invalidateSession(token);
    }

    // Firebase logout
    await firebaseAuthService.logout();

    const response = authSuccessResponse({
      message: 'Logged out successfully',
    });

    // Clear auth cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = authErrorResponse('Logout failed', 500);
    response.cookies.delete('auth-token');
    return response;
  }
}
