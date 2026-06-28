import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { userService } from '@/lib/auth/user-service';
import { profileUpdateSchema } from '@/lib/auth/validation';
import { authSuccessResponse, authErrorResponse } from '@/lib/auth/middleware';

// Get user profile
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);

  if ('error' in auth) {
    return authErrorResponse(auth.error as string, auth.status as number);
  }

  try {
    const profile = await userService.getUserProfile(auth.user.id);
    if (!profile) {
      return authErrorResponse('User not found', 404);
    }

    return authSuccessResponse({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return authErrorResponse('Failed to get profile', 500);
  }
}

// Update user profile
export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);

  if ('error' in auth) {
    return authErrorResponse(auth.error as string, auth.status as number);
  }

  try {
    const body = await req.json();

    // Validate input
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return authErrorResponse('Invalid input', 400);
    }

    // Update user
    const updatedUser = await userService.updateUserProfile(auth.user.id, parsed.data);

    return authSuccessResponse({
      user: userService.toAuthUser(updatedUser),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return authErrorResponse('Failed to update profile', 500);
  }
}
