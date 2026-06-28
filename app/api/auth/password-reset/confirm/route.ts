import { NextRequest } from 'next/server';
import { passwordResetConfirmSchema } from '@/lib/auth/validation';
import { userService } from '@/lib/auth/user-service';
import { firebaseAuthService, FirebaseAuthError } from '@/lib/auth/firebase';
import { authSuccessResponse, authErrorResponse } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = passwordResetConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return authErrorResponse('Invalid input', 400);
    }

    const { code, newPassword } = parsed.data;

    // Confirm password reset with Firebase
    await firebaseAuthService.confirmPasswordReset(code, newPassword);

    // Mark reset token as used in database
    const resetRecord = await userService.getPasswordReset(code);
    if (resetRecord && !resetRecord.usedAt) {
      await userService.usePasswordReset(code);
    }

    return authSuccessResponse({
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      return authErrorResponse(error.message, 400);
    }
    console.error('Password reset confirm error:', error);
    return authErrorResponse('Password reset failed', 500);
  }
}
