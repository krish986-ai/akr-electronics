import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <div className="bg-neutral-900 text-white text-center text-xs sm:text-sm py-2 px-4">
      <span className="opacity-90">Grand Opening Offer — Free delivery above ₹999 · Use code </span>
      <span className="font-semibold text-amber-300">SAVE10</span>
      <span className="opacity-90"> for 10% off · </span>
      <Link href="/products" className="underline font-medium hover:text-amber-300 transition-colors">
        Shop Now
      </Link>
    </div>
  );
}
