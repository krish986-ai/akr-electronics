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

// Default test partnership for Engorio
const TEST_PARTNERSHIPS: Partnership[] = [
  {
    id: 'engorio-test',
    name: 'Engorio',
    logo: 'https://via.placeholder.com/200x200?text=Engorio+Logo',
    link: 'https://engorio-91f5c.web.app',
    banner: 'https://via.placeholder.com/1200x300?text=Engorio+Banner',
    description: 'Complete IoT project guides, tutorials, and free resources. Learn how to build IoT projects with step-by-step guides, free reports, presentations, and code upload guides without installing heavy software.',
    enabled: true,
  },
];

export function PartnershipsSection() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        console.log('[PartnershipsSection] Fetching partnerships...');
        const res = await fetch('/api/partnerships', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        const data = await res.json();
        console.log('[PartnershipsSection] API Response:', data);

        if (res.ok && data.partnerships && data.partnerships.length > 0) {
          const enabled = data.partnerships.filter((p: Partnership) => p.enabled);
          console.log('[PartnershipsSection] Enabled partnerships:', enabled);
          setPartnerships(enabled);
        } else {
          console.log('[PartnershipsSection] No partnerships from API, using test data');
          setPartnerships(TEST_PARTNERSHIPS);
        }
      } catch (e) {
        console.error('[PartnershipsSection] Error:', e);
        setPartnerships(TEST_PARTNERSHIPS);
      } finally {
        setLoading(false);
      }
    };

    loadPartnerships();
  }, []);

  if (loading) {
    return null;
  }

  if (partnerships.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-primary-50 via-white to-primary-50 border-t border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Our Ecosystem</p>
          <h2 className="text-4xl font-bold text-neutral-900 mt-2">Recommended Partners</h2>
          <p className="text-neutral-600 mt-3 text-lg">Tools and resources curated for makers and IoT enthusiasts</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {partnerships.map(partnership => (
            <a
              key={partnership.id}
              href={partnership.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl overflow-hidden border-2 border-neutral-200 hover:border-primary-400 hover:shadow-2xl transition-all duration-300"
            >
              {/* Banner */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                <img
                  src={partnership.banner}
                  alt={partnership.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-primary-100 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                    <img
                      src={partnership.logo}
                      alt={partnership.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-neutral-900">{partnership.name}</p>
                    <p className="text-xs text-primary-600 font-semibold">Trusted Partner</p>
                  </div>
                </div>
                <p className="text-neutral-700 text-base leading-relaxed">{partnership.description}</p>
                <div className="flex items-center gap-2 text-primary-600 group-hover:gap-3 transition-all font-semibold">
                  <span>Visit Website</span>
                  <span className="text-xl">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnershipsLogoBar() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        console.log('[PartnershipsLogoBar] Fetching partnerships...');
        const res = await fetch('/api/partnerships', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        const data = await res.json();
        console.log('[PartnershipsLogoBar] API Response:', data);

        if (res.ok && data.partnerships && data.partnerships.length > 0) {
          const enabled = data.partnerships.filter((p: Partnership) => p.enabled).slice(0, 6);
          console.log('[PartnershipsLogoBar] Enabled partnerships:', enabled);
          setPartnerships(enabled);
        } else {
          console.log('[PartnershipsLogoBar] No partnerships from API, using test data');
          setPartnerships(TEST_PARTNERSHIPS.slice(0, 6));
        }
      } catch (e) {
        console.error('[PartnershipsLogoBar] Error:', e);
        setPartnerships(TEST_PARTNERSHIPS.slice(0, 6));
      }
    };

    loadPartnerships();
  }, []);

  if (partnerships.length === 0) {
    return null;
  }

  return (
    <section className="bg-white border-b border-neutral-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6">Trusted by makers worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {partnerships.map(partner => (
            <a
              key={partner.id}
              href={partner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
