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

export function FloatingPartnerWidget() {
  const [partner, setPartner] = useState<Partnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadPartner = async () => {
      try {
        console.log('[FloatingWidget] Loading first enabled partnership...');
        const res = await fetch('/api/partnerships', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        const data = await res.json();
        console.log('[FloatingWidget] Partnerships:', data.partnerships);

        if (res.ok && data.partnerships && data.partnerships.length > 0) {
          setPartner(data.partnerships[0]);
        }
      } catch (e) {
        console.error('[FloatingWidget] Error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
    // Refresh every 5 seconds
    const interval = setInterval(loadPartner, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !partner) {
    return null;
  }

  return (
    <>
      {/* Floating Widget at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowDetails(true)}
          onMouseEnter={() => setShowDetails(true)}
          className="group relative flex flex-col items-center gap-2 cursor-pointer"
        >
          {/* Logo Container */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full shadow-lg overflow-hidden border-2 border-white bg-white flex items-center justify-center group-hover:shadow-2xl group-hover:scale-110 transition-all duration-200">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Pulsing indicator dot */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
          </div>

          {/* Tooltip - shows on hover */}
          {showDetails && (
            <div className="absolute bottom-full mb-3 bg-white rounded-lg shadow-2xl p-3 whitespace-nowrap border border-neutral-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <p className="font-semibold text-neutral-900 text-sm">{partner.name}</p>
              <p className="text-xs text-primary-600 font-medium">View Details →</p>
            </div>
          )}

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-200 -z-10"></div>
        </button>
      </div>

      {/* Details Modal/Popup */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in scale-95 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
              <img
                src={partner.banner}
                alt={partner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Header with Logo */}
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-primary-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-neutral-900">{partner.name}</h2>
                  <p className="text-primary-600 font-semibold mt-1">Trusted Partner</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-neutral-700 leading-relaxed text-lg">{partner.description}</p>
              </div>

              {/* CTA Button */}
              <div className="flex gap-3 pt-4">
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 px-6 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Visit {partner.name}</span>
                  <span>→</span>
                </a>
                <button
                  onClick={() => setShowDetails(false)}
                  className="h-12 px-6 rounded-lg border-2 border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
