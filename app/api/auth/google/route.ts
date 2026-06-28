import { NextRequest } from 'next/server';
import { firebaseAuthService, FirebaseAuthError } from '@/lib/auth/firebase';
import { userService } from '@/lib/auth/user-service';
import { authSuccessResponse, authErrorResponse, generateSessionToken } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    // In production, the frontend will handle Google login through Firebase
    // This endpoint serves as a backup for server-side token verification
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return authErrorResponse('Missing ID token', 400);
    }

    // Get current Firebase user
    const firebaseUser = firebaseAuthService.getCurrentUser();
    if (!firebaseUser) {
      return authErrorResponse('No authenticated user', 401);
    }

    // Check if user exists in database
    let user = await userService.getUserByFirebaseUid(firebaseUser.uid);

    // Create user if doesn't exist
    if (!user) {
      user = await userService.createUserFromFirebase(
        firebaseUser.email || '',
        firebaseUser.uid,
        firebaseUser.displayName || 'User',
        undefined,
        firebaseUser.photoURL || undefined
      );
    }

    // Check if user is active
    if (!userService.isActive(user)) {
      return authErrorResponse('Account is not active', 403);
    }

    // Update login tracking
    await userService.updateLoginTracking(user.id, true);

    // Create session in database
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await userService.createSession(
      user.id,
      sessionToken,
      expiresAt,
      req.headers.get('x-forwarded-for') || undefined,
      req.headers.get('user-agent') || undefined
    );

    const response = authSuccessResponse({
      user: userService.toAuthUser(user),
      token: sessionToken,
    });

    // Set secure cookie
    response.cookies.set({
      name: 'auth-token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      return authErrorResponse(error.message, 400);
    }
    console.error('Google login error:', error);
    return authErrorResponse('Google login failed', 500);
  }
}
