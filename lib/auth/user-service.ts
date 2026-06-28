// User Management Service
// Handles all user-related database operations

import { prisma } from '@/lib/db/prisma';
import { User, UserRole, UserStatus } from '@prisma/client';
import { AuthUser, UserProfile } from './types';
import crypto from 'crypto';

export const userService = {
  // Get user by email
  getUserByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  // Get user by Firebase UID
  getUserByFirebaseUid: async (firebaseUid: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { firebaseUid },
    });
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Create user from Firebase auth
  createUserFromFirebase: async (
    email: string,
    firebaseUid: string,
    name: string,
    phone?: string,
    image?: string
  ): Promise<User> => {
    return prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firebaseUid,
        name,
        phone,
        image,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: false,
      },
    });
  },

  // Update user profile
  updateUserProfile: async (
    userId: string,
    data: {
      name?: string;
      phone?: string;
      image?: string;
    }
  ): Promise<User> => {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  // Verify email
  verifyEmail: async (userId: string): Promise<User> => {
    return prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verifiedAt: new Date(),
      },
    });
  },

  // Create session
  createSession: async (
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ) => {
    return prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
        isValid: true,
      },
    });
  },

  // Get valid session
  getValidSession: async (token: string) => {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  // Invalidate session
  invalidateSession: async (token: string) => {
    return prisma.session.update({
      where: { token },
      data: { isValid: false },
    });
  },

  // Create password reset token
  createPasswordReset: async (userId: string, expiresIn: number = 3600000) => {
    const token = crypto.randomBytes(32).toString('hex');
    return prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + expiresIn),
      },
    });
  },

  // Get password reset token
  getPasswordReset: async (token: string) => {
    return prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  // Mark password reset as used
  usePasswordReset: async (token: string) => {
    return prisma.passwordReset.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  },

  // Update login tracking
  updateLoginTracking: async (userId: string, success: boolean) => {
    if (success) {
      return prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
        },
      });
    } else {
      return prisma.user.update({
        where: { id: userId },
        data: {
          lastFailedLoginAt: new Date(),
        },
      });
    }
  },

  // Convert to AuthUser (excludes sensitive data)
  toAuthUser: (user: User): AuthUser => {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      image: user.image || undefined,
      phone: user.phone || undefined,
    };
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      image: user.image || undefined,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  },

  // Check if user is admin
  isAdmin: (user: User | AuthUser): boolean => {
    return user.role === UserRole.ADMIN;
  },

  // Check if user is active
  isActive: (user: User): boolean => {
    return user.status === UserStatus.ACTIVE;
  },
};
