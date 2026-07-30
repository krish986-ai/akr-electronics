import Link from 'next/link';

export function TopBar({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="hidden md:block bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
        <div className="flex items-center gap-4">
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-primary-600 transition-colors">
            📞 {phone}
          </a>
          <a href={`mailto:${email}`} className="hover:text-primary-600 transition-colors">
            ✉️ {email}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/track-order" className="hover:text-primary-600 transition-colors">
            Track Your Order
          </Link>
          <Link href="/bulk-orders" className="hover:text-primary-600 transition-colors">
            Bulk / B2B Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
