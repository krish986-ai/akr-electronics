// Authentication Middleware
// Handles route protection and session validation

import { NextRequest, NextResponse } from 'next/server';
import { userService } from './user-service';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends NextRequest {
  userId?: string;
  user?: any;
}

// Verify session from token
export const verifySession = async (token: string | null | undefined) => {
  if (!token) return null;

  try {
    const session = await userService.getValidSession(token);
    if (!session || !session.isValid) return null;

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      await userService.invalidateSession(token);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
};

// Extract token from request
export const getTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookie = request.cookies.get('auth-token')?.value;
  return cookie || null;
};

// Require authentication middleware
export const requireAuth = async (request: NextRequest) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  const session = await verifySession(token);
  if (!session) {
    return {
      error: 'Invalid or expired session',
      status: 401,
    };
  }

  return {
    user: session.user,
    session,
  };
};

// Require admin middleware
export const requireAdmin = async (request: NextRequest) => {
  const auth = await requireAuth(request);

  if ('error' in auth) {
    return auth;
  }

  if (auth.user.role !== UserRole.ADMIN) {
    return {
      error: 'Forbidden - Admin access required',
      status: 403,
    };
  }

  return auth;
};

// Require customer middleware
export const requireCustomer = async (request: NextRequest) => {
  const auth = await requireAuth(request);

  if ('error' in auth) {
    return auth;
  }

  if (auth.user.role !== UserRole.CUSTOMER) {
    return {
      error: 'Forbidden - Customer access required',
      status: 403,
    };
  }

  return auth;
};

// Generate session token
export const generateSessionToken = (): string => {
  return Buffer.from(
    JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2),
    })
  ).toString('base64');
};

// Error response helper
export const authErrorResponse = (error: string, status: number = 401) => {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
};

// Success response helper
export const authSuccessResponse = (data: any, status: number = 200) => {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
};
