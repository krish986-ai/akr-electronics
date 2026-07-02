import { FREE_DELIVERY_THRESHOLD } from '@/lib/mock/products';

export const metadata = { title: 'Shipping & Refund Policy - A.K.R Electronics' };

export default function ShippingRefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Shipping & Refund Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-neutral-700 leading-relaxed">
        <h2 className="text-lg font-semibold text-neutral-900">Shipping</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Free standard delivery on orders above ₹{FREE_DELIVERY_THRESHOLD}; flat ₹49 below that.</li>
          <li>Orders placed before 2 PM are usually dispatched the same business day.</li>
          <li>Metro cities: 2–4 business days · Rest of India: 3–6 business days.</li>
          <li>Cash on Delivery available on eligible pincodes (small COD fee may apply).</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900">Returns & Replacements</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Report damaged or defective items within 48 hours of delivery with an unboxing photo/video.</li>
          <li>Manufacturing defects within the warranty period are replaced free of charge.</li>
          <li>Items must be unused, unsoldered and in original packaging for replacement.</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900">Refunds</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Approved refunds are processed to the original payment method within 5–7 business days.</li>
          <li>COD refunds are made via bank transfer after details verification.</li>
        </ul>
        <p>
          Questions? Write to{' '}
          <a href="mailto:support@akrelectronics.com" className="text-primary-600 hover:underline">
            support@akrelectronics.com
          </a>
          .
        </p>
        <p className="text-xs text-neutral-400">Last updated: July 2026</p>
      </div>
    </div>
  );
}
