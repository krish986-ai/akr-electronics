import { NextRequest } from 'next/server';
import { firebaseAuthService, FirebaseAuthError } from '@/lib/auth/firebase';
import { registerSchema } from '@/lib/auth/validation';
import { userService } from '@/lib/auth/user-service';
import { authSuccessResponse, authErrorResponse, generateSessionToken } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return authErrorResponse('Invalid input data', 400);
    }

    const { email, password, name, phone } = parsed.data;

    // Check if user already exists in database
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return authErrorResponse('Email already registered', 409);
    }

    // Create Firebase user
    const firebaseUser = await firebaseAuthService.registerWithEmail(email, password);

    // Create user in database
    const user = await userService.createUserFromFirebase(
      email,
      firebaseUser.uid,
      name,
      phone
    );

    // Get ID token for session
    const idToken = await firebaseAuthService.getIdToken();
    if (!idToken) {
      return authErrorResponse('Failed to create session', 500);
    }

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

    const response = authSuccessResponse(
      {
        user: userService.toAuthUser(user),
        token: sessionToken,
      },
      201
    );

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
    console.error('Registration error:', error);
    return authErrorResponse('Registration failed', 500);
  }
}
