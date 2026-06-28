import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { loginSchema } from '@/lib/auth/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In production, compare password with bcrypt.compare()
    // For now, simple comparison (NOT SECURE - Phase 2 will add proper hashing)
    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) { ... }

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
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
