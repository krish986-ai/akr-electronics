import { NextRequest } from 'next/server';
import { passwordResetRequestSchema } from '@/lib/auth/validation';
import { userService } from '@/lib/auth/user-service';
import { firebaseAuthService } from '@/lib/auth/firebase';
import { authSuccessResponse, authErrorResponse } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = passwordResetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return authErrorResponse('Invalid email', 400);
    }

    const { email } = parsed.data;

    // Check if user exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal whether email exists for security
      return authSuccessResponse({
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // Send Firebase password reset email
    await firebaseAuthService.sendPasswordReset(email);

    // Create password reset token in database for additional tracking
    await userService.createPasswordReset(user.id);

    return authSuccessResponse({
      message: 'Password reset email sent. Check your inbox.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    // Don't reveal specific errors for security
    return authSuccessResponse({
      message: 'If the email exists, a password reset link has been sent',
    });
  }
}
