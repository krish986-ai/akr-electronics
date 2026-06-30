'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RadioGroup } from '@/components/ui/Radio';
import { products } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const cartItems = [
    { productId: '1', quantity: 1 },
    { productId: '4', quantity: 2 },
  ];

  const cartProducts = cartItems
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as any[];

  const subtotal = cartProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const shippingCost = shippingMethod === 'express' ? 100 : subtotal > 500 ? 0 : 50;
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + tax + shippingCost - discount;

  const handleApplyCoupon = () => {
    if (coupon === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      setCoupon('');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={cn(container, 'py-12')}>
      <h1 className="text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Indicator */}
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => s <= step && setStep(s)}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full font-semibold',
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Step 1: Shipping Address */}
          {step >= 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">1</span>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step > 1 ? (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{shippingAddress.name}</p>
                    <p className="text-neutral-600">{shippingAddress.address}</p>
                    <p className="text-neutral-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    <p className="text-neutral-600">{shippingAddress.phone}</p>
                    <Button variant="outline" size="sm" onClick={() => setStep(1)} className="mt-2">
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block text-neutral-900">Full Name</label>
                        <Input name="name" value={shippingAddress.name} onChange={handleAddressChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-neutral-900">Email</label>
                        <Input name="email" type="email" value={shippingAddress.email} onChange={handleAddressChange} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block text-neutral-900">Phone</label>
                      <Input name="phone" value={shippingAddress.phone} onChange={handleAddressChange} />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block text-neutral-900">Address</label>
                      <Input name="address" value={shippingAddress.address} onChange={handleAddressChange} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block text-neutral-900">City</label>
                        <Input name="city" value={shippingAddress.city} onChange={handleAddressChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-neutral-900">State</label>
                        <Input name="state" value={shippingAddress.state} onChange={handleAddressChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-neutral-900">Pincode</label>
                        <Input name="pincode" value={shippingAddress.pincode} onChange={handleAddressChange} />
                      </div>
                    </div>

                    <Button onClick={() => setStep(2)} fullWidth className="mt-4">
                      Continue to Shipping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping Method */}
          {step >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">2</span>
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step > 2 ? (
                  <div className="flex justify-between items-center">
                    <p className="text-sm">
                      {shippingMethod === 'express' ? 'Express (1-2 days)' : 'Standard (3-5 days)'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <RadioGroup
                      options={[
                        { value: 'standard', label: 'Standard Shipping (3-5 days) - FREE' },
                        { value: 'express', label: 'Express Shipping (1-2 days) - ₹100' },
                      ]}
                      value={shippingMethod}
                      onChange={setShippingMethod}
                    />

                    <Button onClick={() => setStep(3)} fullWidth className="mt-4">
                      Continue to Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {step >= 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">3</span>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  options={[
                    { value: 'card', label: 'Credit/Debit Card' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'wallet', label: 'Digital Wallet' },
                  ]}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />

                <Button size="lg" fullWidth className="mt-6">
                  Place Order - ₹{total.toLocaleString('en-IN')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2 pb-4 border-b">
                {cartProducts.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Costs */}
              <div className="space-y-2 pb-4 border-b text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Coupon */}
              {!appliedCoupon && (
                <div className="space-y-2 pb-4 border-b">
                  <p className="text-sm font-medium text-neutral-900">Have a coupon?</p>
                  <div className="flex gap-2">
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="SAVE10"
                    />
                    <Button size="sm" variant="outline" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
