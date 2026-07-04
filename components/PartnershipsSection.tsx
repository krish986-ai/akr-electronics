'use client';

import { useEffect, useState } from 'react';

interface Partnership {
  id: string;
  name: string;
  logo: string;
  link: string;
  banner: string;
  description: string;
  enabled: boolean;
}

export function PartnershipsSection() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        const res = await fetch('/api/partnerships');
        const data = await res.json();
        if (res.ok && data.partnerships) {
          setPartnerships(data.partnerships.filter((p: Partnership) => p.enabled));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    loadPartnerships();
  }, []);

  if (loading || partnerships.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">Our Partners</h2>
          <p className="text-neutral-600 mt-2">Resources and tools we recommend</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {partnerships.map(partnership => (
            <a
              key={partnership.id}
              href={partnership.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all"
            >
              {/* Banner */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-r from-primary-50 to-primary-100">
                <img
                  src={partnership.banner}
                  alt={partnership.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={partnership.logo}
                    alt={partnership.name}
                    className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                  />
                  <p className="font-semibold text-neutral-900">{partnership.name}</p>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-3">{partnership.description}</p>
                <div className="flex items-center gap-2 text-primary-600 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Learn More</span>
                  <span>→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
