import Link from 'next/link';

export function AnnouncementBar({ text }: { text: string }) {
  if (!text.trim()) return null;

  return (
    <div className="bg-neutral-900 text-white text-center text-xs sm:text-sm py-2 px-4">
      <span className="opacity-90">{text} · </span>
      <Link href="/products" className="underline font-medium hover:text-amber-300 transition-colors">
        Shop Now
      </Link>
    </div>
  );
}
