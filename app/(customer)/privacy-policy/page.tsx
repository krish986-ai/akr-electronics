export const metadata = { title: 'Privacy Policy - A.K.R Electronics' };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-neutral-700 leading-relaxed">
        <p>
          A.K.R Electronics collects only the information needed to process your orders and
          improve your shopping experience: your name, contact details, delivery addresses
          and order history.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900">What we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account details you provide (name, email, phone)</li>
          <li>Delivery addresses and order records</li>
          <li>Anonymous usage analytics to improve the store</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900">What we never do</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sell or rent your personal data to third parties</li>
          <li>Store card or UPI credentials — payments are handled by our PCI-compliant payment partner</li>
          <li>Send marketing email without your consent</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900">Your rights</h2>
        <p>
          You can request a copy of your data, correct it, or delete your account at any time
          by writing to{' '}
          <a href="mailto:privacy@akrelectronics.com" className="text-primary-600 hover:underline">
            privacy@akrelectronics.com
          </a>
          .
        </p>
        <p className="text-xs text-neutral-400">Last updated: July 2026</p>
      </div>
    </div>
  );
}
