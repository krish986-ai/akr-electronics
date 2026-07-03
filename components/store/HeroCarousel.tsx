'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { heroBanners, HeroBanner } from '@/lib/mock/products';
import { getActiveBanners } from '@/lib/data/catalog';

export function HeroCarousel() {
  const [banners, setBanners] = useState<HeroBanner[]>(heroBanners);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getActiveBanners().then(active => {
      setBanners(active);
      setIndex(0);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[index] ?? banners[0];

  return (
    <section
      className={`relative overflow-hidden text-white transition-colors duration-700 ${
        banner.image ? 'bg-neutral-900' : `bg-gradient-to-r ${banner.gradient}`
      }`}
    >
      {banner.image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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
        {banners.map((b, i) => (
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
