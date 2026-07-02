import Link from 'next/link';

export function TopBar() {
  return (
    <div className="hidden md:block bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
        <div className="flex items-center gap-4">
          <a href="tel:18001234567" className="hover:text-primary-600 transition-colors">
            📞 1800 123 4567
          </a>
          <a href="mailto:support@akrelectronics.com" className="hover:text-primary-600 transition-colors">
            ✉️ support@akrelectronics.com
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/track-order" className="hover:text-primary-600 transition-colors">
            Track Your Order
          </Link>
          <Link href="/bulk-orders" className="hover:text-primary-600 transition-colors">
            Bulk / B2B Orders
          </Link>
          <Link href="/contact" className="hover:text-primary-600 transition-colors">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
