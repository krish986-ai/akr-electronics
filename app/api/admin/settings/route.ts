import { NextRequest, NextResponse } from 'next/server';
import { WebsiteConfigService } from '@/lib/services/website-config-service';

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await WebsiteConfigService.getConfig();

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        taxRate: config.taxRate.toString(),
        shippingBaseCost: config.shippingBaseCost.toString(),
        freeShippingThreshold: config.freeShippingThreshold?.toString(),
      },
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const config = await WebsiteConfigService.updateConfig(body);

    if (!config) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        taxRate: config.taxRate.toString(),
        shippingBaseCost: config.shippingBaseCost.toString(),
        freeShippingThreshold: config.freeShippingThreshold?.toString(),
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
