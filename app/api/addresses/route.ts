import { NextRequest, NextResponse } from 'next/server';
import { AddressService } from '@/lib/services/address-service';
import { createAddressSchema } from '@/lib/validation/address-validation';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const addresses = await AddressService.getAddresses(userId);
    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = createAddressSchema.parse(body);
    const address = await AddressService.createAddress(userId, validated);

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create address' }, { status: 400 });
  }
}
