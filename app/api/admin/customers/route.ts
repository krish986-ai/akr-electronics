import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/firestore/repositories';

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await UserRepository.listCustomers(1000);

    return NextResponse.json({
      success: true,
      data: customers.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        phone: c.phone,
        status: c.status,
        emailVerified: c.emailVerified,
        loginCount: c.loginCount,
        lastLoginAt: c.lastLoginAt,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
