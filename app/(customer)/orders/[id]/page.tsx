'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth/client';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

// Mock orders data
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2026-001',
    createdAt: new Date('2026-06-25'),
    total: 2450,
    status: 'DELIVERED',
    items: [
      { id: '1', product: { name: 'Arduino Uno R3' }, quantity: 1, price: 450 },
      { id: '2', product: { name: 'Raspberry Pi 4' }, quantity: 1, price: 4500 },
    ],
    subtotal: 2100,
    tax: 378,
    shipping: 0,
    paymentStatus: 'PAID',
  },
  {
    id: '2',
    orderNumber: 'ORD-2026-002',
    createdAt: new Date('2026-06-20'),
    total: 1980,
    status: 'SHIPPED',
    items: [
      { id: '1', product: { name: 'DHT22 Sensor' }, quantity: 2, price: 350 },
      { id: '2', product: { name: 'ESP8266 WiFi Module' }, quantity: 1, price: 950 },
    ],
    subtotal: 1650,
    tax: 297,
    shipping: 50,
    paymentStatus: 'PAID',
  },
];

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isAuthenticated } = useAuth();
  const order = mockOrders.find(o => o.id === params.id);

  if (!isAuthenticated) {
    return (
      <div className={cn(container, 'py-12 text-center')}>
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please login to view order</h1>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={cn(container, 'py-12 text-center')}>
        <p className="text-red-600 mb-4">Order not found</p>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(container, 'py-12')}>
      <Link href="/orders" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Orders
      </Link>

      <Card className="mt-6">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{order.orderNumber}</h1>
              <p className="text-neutral-600">
                {order.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">
                ₹{order.total.toLocaleString('en-IN')}
              </p>
              <span className={cn(
                'text-sm font-semibold',
                order.status === 'DELIVERED' ? 'text-green-600' : 'text-orange-600'
              )}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-neutral-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{item.product.name}</h3>
                    <p className="text-neutral-600 text-sm">
                      {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="font-semibold text-neutral-900">
                    ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-700">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Tax (18% GST)</span>
                <span>₹{order.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Shipping</span>
                <span>₹{order.shipping.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold text-neutral-900">
                <span>Total</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Order Status</h3>
            <p className="text-sm text-neutral-700">
              Payment Status: <span className="font-semibold">{order.paymentStatus}</span>
            </p>
            <p className="text-sm text-neutral-700 mt-1">
              Order Status: <span className="font-semibold">{order.status}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
