'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Price } from '@/components/ui/Price';
import { products } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function CartPage() {
  const [cartItems] = useState([
    { productId: '1', quantity: 1 },
    { productId: '4', quantity: 2 }
  ]);

  const cartProducts = cartItems
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as any[];

  const subtotal = cartProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <div className={cn(container, 'py-8')}>
      <h1 className='text-4xl font-bold text-neutral-900 mb-8'>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-xl text-neutral-600 mb-4'>Your cart is empty</p>
          <Button>Continue Shopping</Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-4'>
            {cartProducts.map(item => (
              <Card key={item.product.id} variant='default'>
                <CardContent className='p-4 flex gap-4'>
                  <img src={item.product.image} alt={item.product.name} className='w-24 h-24 object-cover rounded' />
                  <div className='flex-1'>
                    <h3 className='font-semibold text-neutral-900'>{item.product.name}</h3>
                    <Price amount={item.product.price} size='sm' />
                  </div>
                  <div className='text-right'>
                    <Price amount={item.product.price * item.quantity} highlight size='lg' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className='lg:col-span-1'>
            <Card variant='elevated'>
              <CardContent className='p-6'>
                <h3 className='font-semibold text-neutral-900 mb-4'>Order Summary</h3>
                <div className='space-y-2 mb-4 pb-4 border-b'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-neutral-600'>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-neutral-600'>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-neutral-600'>Tax (18%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className='flex justify-between mb-6 pb-6 border-b'>
                  <span className='font-semibold text-neutral-900'>Total</span>
                  <span className='text-2xl font-bold text-primary-600'>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <a href="/checkout" className="block">
                  <Button fullWidth size='lg'>
                    Proceed to Checkout
                  </Button>
                </a>
                <a href="/products" className="block mt-3">
                  <Button fullWidth variant='outline'>
                    Continue Shopping
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
