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

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className={cn(container, 'py-12 text-center')}>
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please login to view orders</h1>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(container, 'py-12')}>
      <h1 className="text-4xl font-bold text-neutral-900 mb-8">My Orders</h1>

      {mockOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-4">You haven&apos;t placed any orders yet</p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} variant="default">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{order.orderNumber}</h3>
                    <p className="text-sm text-neutral-600">
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
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

                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-sm text-neutral-600 mb-2">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm text-neutral-600">
                        {item.product.name} × {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    View Details →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
