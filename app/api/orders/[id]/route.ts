import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/lib/firestore/repositories';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await OrderRepository.getById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== userId && req.headers.get('x-user-role') !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const timeline = await OrderRepository.getTimeline(id);

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        basePrice: order.basePrice.toString(),
        salePrice: order.salePrice?.toString(),
        subtotal: order.subtotal.toString(),
        tax: order.tax.toString(),
        shippingCost: order.shippingCost.toString(),
        total: order.total.toString(),
        timeline,
      },
    });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { orderStatus, paymentStatus, shippingStatus, trackingNumber } = body;

    if (orderStatus) {
      await OrderRepository.updateStatus(id, orderStatus);
    }

    if (paymentStatus) {
      await OrderRepository.updatePaymentStatus(id, paymentStatus);
    }

    if (shippingStatus) {
      await OrderRepository.updateShippingStatus(id, shippingStatus, trackingNumber);
    }

    const order = await OrderRepository.getById(id);

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        basePrice: order?.basePrice.toString(),
        subtotal: order?.subtotal.toString(),
        tax: order?.tax.toString(),
        shippingCost: order?.shippingCost.toString(),
        total: order?.total.toString(),
      },
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
