'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RadioGroup } from '@/components/ui/Radio';
import { useCartStore, cartSubtotal, cartShipping } from '@/lib/stores/cart';
import { coupons, Coupon } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  const subtotal = cartSubtotal(items);
  const shippingCost = shippingMethod === 'express' ? 100 : cartShipping(subtotal);
  const discount = appliedCoupon
    ? appliedCoupon.type === 'PERCENT'
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  const handleApplyCoupon = () => {
    const found = coupons.find(c => c.code === coupon.trim().toUpperCase() && c.active);
    if (!found) {
      setCouponError('Invalid or expired coupon code');
      return;
    }
    if (subtotal < found.minOrder) {
      setCouponError(`This coupon needs a minimum order of ₹${found.minOrder}`);
      return;
    }
    setAppliedCoupon(found);
    setCouponError('');
    setCoupon('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const addressComplete =
    shippingAddress.name.trim() !== '' &&
    /.+@.+\..+/.test(shippingAddress.email) &&
    shippingAddress.phone.trim().length >= 10 &&
    shippingAddress.address.trim() !== '' &&
    shippingAddress.city.trim() !== '' &&
    /^[1-9][0-9]{5}$/.test(shippingAddress.pincode);

  const placeOrder = () => {
    const orderId = `AKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPlacedOrderId(orderId);
    clearCart();
  };

  if (!mounted) return null;

  if (placedOrderId) {
    return (
      <div className={cn(container, 'py-20 max-w-xl text-center')}>
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Order Placed!</h1>
        <p className="text-neutral-600 mb-1">
          Your order number is <span className="font-mono font-bold">{placedOrderId}</span>
        </p>
        <p className="text-sm text-neutral-500 mb-8">
          A confirmation will be sent to {shippingAddress.email}. Payment: {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/track-order"
            className="h-11 px-6 leading-[44px] rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
          >
            Track Order
          </Link>
          <Link
            href="/products"
            className="h-11 px-6 leading-[44px] rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn(container, 'py-20 text-center')}>
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-neutral-500 mb-6">Add products to your cart before checking out.</p>
        <Link
          href="/products"
          className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

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

                    <Button onClick={() => setStep(2)} fullWidth className="mt-4" disabled={!addressComplete}>
                      {addressComplete ? 'Continue to Shipping' : 'Fill all address fields to continue'}
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
                    { value: 'cod', label: '💵 Cash on Delivery' },
                    { value: 'upi', label: 'UPI (available after payment integration)' },
                    { value: 'card', label: 'Credit/Debit Card (available after payment integration)' },
                  ]}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
                {paymentMethod !== 'cod' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                    Online payments arrive with Razorpay integration (Phase 18). Use Cash on Delivery for now.
                  </p>
                )}

                <Button size="lg" fullWidth className="mt-6" disabled={paymentMethod !== 'cod'} onClick={placeOrder}>
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
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Costs */}
              <div className="space-y-2 pb-4 border-b text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal (incl. GST)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
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
                  {couponError && <p className="text-xs text-red-600">{couponError}</p>}
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
