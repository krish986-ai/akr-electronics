export const metadata = { title: 'Terms of Service - A.K.R Electronics' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-sm text-neutral-700 leading-relaxed">
        <h2 className="text-lg font-semibold text-neutral-900">Orders & Pricing</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>All prices are in Indian Rupees and inclusive of GST unless stated otherwise.</li>
          <li>An order is confirmed only after successful payment or COD verification.</li>
          <li>We may cancel orders affected by pricing errors or stock unavailability, with a full refund.</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900">Warranty</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Products carry the warranty period stated on their product page (typically 15 days) against manufacturing defects.</li>
          <li>Warranty is void for products that are misused, tampered with, soldered, or damaged by static, water or fire.</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900">Acceptable Use</h2>
        <p>
          You agree to provide accurate information, use the store lawfully, and not attempt
          to disrupt or misuse the platform.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900">Liability</h2>
        <p>
          Components are sold for hobbyist, educational and prototyping use. Validate designs
          independently before any safety-critical or commercial deployment.
        </p>
        <p className="text-xs text-neutral-400">Last updated: July 2026</p>
      </div>
    </div>
  );
}
