'use client';

import { useEffect, useState } from 'react';

interface Partnership {
  id: string;
  name: string;
  logo: string;
  link: string;
  enabled: boolean;
}

export function FloatingPartnerWidget() {
  const [partner, setPartner] = useState<Partnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovering, setHovering] = useState(false);

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
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={partner.link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
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
        {hovering && (
          <div className="absolute bottom-full mb-3 bg-white rounded-lg shadow-2xl p-4 whitespace-nowrap border border-neutral-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="font-semibold text-neutral-900 text-sm">{partner.name}</p>
            <p className="text-xs text-primary-600 font-medium">Click to visit →</p>
          </div>
        )}

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-200 -z-10"></div>
      </a>
    </div>
  );
}
