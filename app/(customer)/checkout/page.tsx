'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils/cn';
import { safeImageSrc } from '@/lib/utils/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RadioGroup } from '@/components/ui/Radio';
import { useCartStore, cartSubtotal } from '@/lib/stores/cart';
import { useBuyNowStore } from '@/lib/stores/buy-now';
import { nextOrderNumber, PlacedOrder } from '@/lib/stores/orders';
import { coupons, Coupon } from '@/lib/mock/products';
import { useAuth } from '@/lib/auth/client';
import { fetchUserProfile } from '@/lib/auth/profile';
import { submitOrder } from '@/lib/orders/service';
import { fetchOrderSettings } from '@/lib/orders/settings-client';
import { OrderSettings, defaultOrderSettings } from '@/lib/orders/settings';
import { fetchPaymentSettings } from '@/lib/payments/settings-client';
import { PaymentSettings, defaultPaymentSettings, QR_PAYMENT_NOTE } from '@/lib/payments/settings';
import { auth } from '@/lib/firebase/config';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

interface PaymentExtras {
  status: 'CONFIRMED' | 'PENDING';
  paymentMethod: string;
  qrPayerName?: string;
  qrTransactionId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items: cartItems, clearCart } = useCartStore();
  const buyNowItem = useBuyNowStore(state => state.item);
  const clearBuyNow = useBuyNowStore(state => state.clearBuyNow);
  const items = buyNowItem ? [buyNowItem] : cartItems;
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

  const { user, isLoading: authLoading } = useAuth();
  useEffect(() => {
    if (!user) return;
    (async () => {
      const profile = await fetchUserProfile(user.id);
      setShippingAddress(prev => ({
        ...prev,
        name: prev.name || profile?.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || profile?.phone || '',
        address: prev.address || profile?.college || '',
      }));
    })();
  }, [user]);

  const [settings, setSettings] = useState<OrderSettings>(defaultOrderSettings);
  const [paySettings, setPaySettings] = useState<PaymentSettings>(defaultPaymentSettings);

  useEffect(() => {
    fetchOrderSettings().then(setSettings);
    fetchPaymentSettings().then(setPaySettings);
  }, []);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [placedPendingQr, setPlacedPendingQr] = useState(false);
  const [qrPayerName, setQrPayerName] = useState('');
  const [qrTransactionId, setQrTransactionId] = useState('');

  const availableMethods = [
    ...(settings.codEnabled ? ['cod'] : []),
    ...(paySettings.razorpayEnabled ? ['razorpay'] : []),
    ...(paySettings.qrEnabled && paySettings.qrImage ? ['qr'] : []),
  ];

  useEffect(() => {
    if (availableMethods.length > 0 && !availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.codEnabled, paySettings.razorpayEnabled, paySettings.qrEnabled]);

  const subtotal = cartSubtotal(items);
  const shippingCost = shippingMethod === 'express' ? settings.fastDeliveryCharge : 0;
  const lowOrderCharge = subtotal < settings.minOrderAmount ? settings.lowOrderCharge : 0;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'PERCENT'
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;
  const total = Math.max(0, subtotal + shippingCost + lowOrderCharge - discount);

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

  const placeOrder = async (extras: PaymentExtras) => {
    if (!user) return;
    const orderNumber = nextOrderNumber();
    setIsPlacing(true);
    setPlaceError('');
    try {
      const order: PlacedOrder & PaymentExtras = {
        orderNumber,
        placedAt: new Date().toISOString(),
        shippingMethod: shippingMethod === 'express' ? 'express' : 'standard',
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping: shippingCost,
        lowOrderCharge,
        discount,
        total,
        address: shippingAddress,
        ...extras,
      };
      await submitOrder(user.id, order);
      setPlacedOrderId(orderNumber);
      setPlacedPendingQr(extras.status === 'PENDING');
      if (buyNowItem) {
        clearBuyNow();
      } else {
        clearCart();
      }
    } catch (err) {
      setPlaceError(
        err instanceof Error && err.message
          ? err.message
          : 'Could not place your order. Please check your connection and try again.'
      );
    } finally {
      setIsPlacing(false);
    }
  };

  const payWithRazorpay = async () => {
    if (!user || !auth?.currentUser) return;
    setIsPlacing(true);
    setPlaceError('');
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: total, receipt: `rcpt-${Date.now()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not start the payment');

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load the payment window. Check your connection.');

      const Razorpay = (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } })
        .Razorpay;
      new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'A.K.R Electronics',
        description: 'IoT Components & Kits',
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI',
                instruments: [{ method: 'upi' }],
              },
              other: {
                name: 'Cards, NetBanking & Wallets',
                instruments: [{ method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: '#0066ff' },
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          placeOrder({
            status: 'CONFIRMED',
            paymentMethod: 'Razorpay (Online)',
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: { ondismiss: () => setIsPlacing(false) },
      }).open();
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : 'Could not start the payment');
      setIsPlacing(false);
    }
  };

  const downloadQr = async () => {
    // Android WebViews don't run an anchor-click "download" the way a real
    // browser tab does (no download manager, no new-tab fallback) — save via
    // the native Share sheet instead so the user can pick Photos/Files/etc.
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await fetch(paySettings.qrImage);
        const blob = await res.blob();
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const [{ Filesystem, Directory }, { Share }] = await Promise.all([
          import('@capacitor/filesystem'),
          import('@capacitor/share'),
        ]);

        const path = 'akr-payment-qr.png';
        await Filesystem.writeFile({ path, data: base64Data, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
        await Share.share({ title: 'A.K.R Electronics Payment QR', url: uri });
      } catch {
        // Share sheet was dismissed or the native save failed — nothing more we can do here.
      }
      return;
    }

    try {
      const res = await fetch(paySettings.qrImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'akr-payment-qr.png';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(paySettings.qrImage, '_blank');
    }
  };

  const qrDetailsValid = qrPayerName.trim().length >= 2 && /^\d{12}$/.test(qrTransactionId.trim());

  if (!mounted || authLoading) return null;

  if (!user && !placedOrderId) {
    return (
      <div className={cn(container, 'py-20 max-w-md text-center')}>
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to place your order</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Orders are linked to your student account so you can track them anytime. Your cart is
          saved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/login"
            className="h-11 px-6 leading-[44px] rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="h-11 px-6 leading-[44px] rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (placedOrderId) {
    return (
      <div className={cn(container, 'py-20 max-w-xl text-center')}>
        <p className="text-6xl mb-4">{placedPendingQr ? '⏳' : '🎉'}</p>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {placedPendingQr ? 'Order Received — Verifying Payment' : 'Order Placed!'}
        </h1>
        <p className="text-neutral-600 mb-1">
          Your order number is <span className="font-mono font-bold">{placedOrderId}</span>
        </p>
        <p className="text-sm text-neutral-500 mb-2">
          A confirmation will be sent to {shippingAddress.email}.
        </p>
        {placedPendingQr && (
          <p className="text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
            ⏳ We are verifying your UPI payment. Your order will be confirmed within{' '}
            <strong>12 to 48 hours</strong> — no action needed from you. You can watch the status
            on the Track Order page.
          </p>
        )}
        <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-8">
          📦 Your parcel will be delivered at your college — we do not deliver to home or any other place.
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
      <h1 className={cn('text-4xl font-bold text-neutral-900', buyNowItem ? 'mb-2' : 'mb-8')}>
        Checkout
      </h1>
      {buyNowItem && (
        <p className="text-sm text-neutral-500 mb-6">
          Buying this item now — the rest of your cart is untouched.
        </p>
      )}

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
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-amber-800">📦 College delivery only</p>
                      <p className="text-xs text-amber-700 mt-1">
                        We can deliver your parcel only at your college — not at home or any other place.
                      </p>
                    </div>

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
                      <label className="text-sm font-medium mb-1 block text-neutral-900">College Name &amp; Address</label>
                      <Input
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleAddressChange}
                        placeholder="Your college name and address"
                      />
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
                        { value: 'standard', label: 'Standard Delivery (3-5 days)' },
                        ...(settings.fastDeliveryEnabled
                          ? [
                              {
                                value: 'express',
                                label: `Fast Delivery (1-2 days) - ₹${settings.fastDeliveryCharge}`,
                              },
                            ]
                          : []),
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
                {availableMethods.length === 0 ? (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    No payment methods are available right now. Please check back later.
                  </p>
                ) : (
                  <RadioGroup
                    options={[
                      ...(settings.codEnabled ? [{ value: 'cod', label: '💵 Cash on Delivery' }] : []),
                      ...(paySettings.razorpayEnabled
                        ? [{ value: 'razorpay', label: '💳 Pay Online — UPI / Card / NetBanking (instant)' }]
                        : []),
                      ...(paySettings.qrEnabled && paySettings.qrImage
                        ? [{ value: 'qr', label: '📱 Pay via UPI QR (manual verification, 12–48 hrs)' }]
                        : []),
                    ]}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                )}

                {paymentMethod === 'qr' && paySettings.qrEnabled && paySettings.qrImage && (
                  <div className="mt-4 border border-neutral-200 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <Image
                        src={safeImageSrc(paySettings.qrImage)}
                        alt="UPI payment QR code"
                        width={160}
                        height={160}
                        className="w-40 h-40 object-contain border border-neutral-200 rounded-lg bg-white"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          How to pay{paySettings.qrUpiName ? ` (UPI: ${paySettings.qrUpiName})` : ''}:
                        </p>
                        <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside">
                          <li>Scan this QR with any UPI app (GPay, PhonePe, Paytm...)</li>
                          <li>
                            Enter the amount manually —{' '}
                            <strong>exactly ₹{total.toLocaleString('en-IN')}</strong> — and pay
                          </li>
                          <li>Copy the 12-digit transaction ID (UTR) from your UPI app</li>
                          <li>Fill your UPI name and the transaction ID below, then confirm</li>
                        </ol>
                        <button
                          type="button"
                          onClick={downloadQr}
                          className="text-xs font-semibold text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50"
                        >
                          ⬇ Download QR
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-neutral-900">
                          Your name on the UPI app *
                        </label>
                        <Input
                          value={qrPayerName}
                          onChange={e => setQrPayerName(e.target.value)}
                          placeholder="Name shown in your UPI app"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-neutral-900">
                          12-digit Transaction ID (UTR) *
                        </label>
                        <Input
                          value={qrTransactionId}
                          onChange={e => setQrTransactionId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          placeholder="e.g. 405678123456"
                        />
                        {qrTransactionId && !/^\d{12}$/.test(qrTransactionId) && (
                          <p className="text-[11px] text-red-600 mt-1">
                            Transaction ID must be exactly 12 digits
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                      ⏳ <strong>Please note:</strong> {QR_PAYMENT_NOTE} Don&apos;t worry — your
                      order is safe with us while we verify.
                    </p>
                  </div>
                )}

                {placeError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mt-3">
                    {placeError}
                  </p>
                )}

                {paymentMethod === 'cod' && (
                  <Button
                    size="lg"
                    fullWidth
                    className="mt-6"
                    disabled={!settings.codEnabled || isPlacing}
                    onClick={() => placeOrder({ status: 'CONFIRMED', paymentMethod: 'Cash on Delivery' })}
                  >
                    {isPlacing ? 'Placing Order...' : `Place Order - ₹${total.toLocaleString('en-IN')}`}
                  </Button>
                )}

                {paymentMethod === 'razorpay' && (
                  <Button
                    size="lg"
                    fullWidth
                    className="mt-6"
                    disabled={!paySettings.razorpayEnabled || isPlacing}
                    onClick={payWithRazorpay}
                  >
                    {isPlacing ? 'Opening Payment...' : `Pay ₹${total.toLocaleString('en-IN')} & Place Order`}
                  </Button>
                )}

                {paymentMethod === 'qr' && (
                  <Button
                    size="lg"
                    fullWidth
                    className="mt-6"
                    disabled={!qrDetailsValid || isPlacing}
                    onClick={() =>
                      placeOrder({
                        status: 'PENDING',
                        paymentMethod: 'UPI QR (manual verification)',
                        qrPayerName: qrPayerName.trim(),
                        qrTransactionId: qrTransactionId.trim(),
                      })
                    }
                  >
                    {isPlacing
                      ? 'Confirming Order...'
                      : qrDetailsValid
                        ? `Confirm Order - ₹${total.toLocaleString('en-IN')}`
                        : 'Enter payment details to confirm'}
                  </Button>
                )}
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
                  <span className="text-neutral-600">
                    {shippingMethod === 'express' ? 'Fast Delivery' : 'Shipping'}
                  </span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                {lowOrderCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Small order charge</span>
                    <span>₹{lowOrderCharge}</span>
                  </div>
                )}
                {lowOrderCharge > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    Orders below ₹{settings.minOrderAmount.toLocaleString('en-IN')} have a small
                    order charge. Add ₹{(settings.minOrderAmount - subtotal).toLocaleString('en-IN')}{' '}
                    more to avoid it.
                  </p>
                )}
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
