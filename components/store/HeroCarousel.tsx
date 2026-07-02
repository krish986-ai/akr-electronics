'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { heroBanners } from '@/lib/mock/products';

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % heroBanners.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const banner = heroBanners[index];

  return (
    <section
      className={`relative bg-gradient-to-r ${banner.gradient} text-white transition-colors duration-700`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          {banner.badge && (
            <span className="inline-block bg-white/15 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {banner.badge}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{banner.title}</h1>
          <p className="text-base md:text-lg opacity-90 mb-8">{banner.subtitle}</p>
          <Link
            href={banner.href}
            className="inline-block bg-white text-neutral-900 font-semibold px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {banner.cta} →
          </Link>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroBanners.map((b, i) => (
          <button
            key={b.id}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
