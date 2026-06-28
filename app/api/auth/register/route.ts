import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { registerSchema } from '@/lib/auth/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // In production, hash password with bcrypt
    // For now, we'll store it plainly (NOT SECURE - Phase 2 will add proper hashing)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // Password would be hashed here in production
        // password: await bcrypt.hash(password, 10),
      },
    });

    // Create cart for new user
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // Generate token (simple JWT-like token - Phase 2 will use proper JWT)
    const token = Buffer.from(
      JSON.stringify({ userId: user.id, email: user.email })
    ).toString('base64');

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
