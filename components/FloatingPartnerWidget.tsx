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
  const [hovering, setHovering] = useState(false);
  const [hideTimeoutId, setHideTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const res = await fetch('/api/partnerships', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        const data = await res.json();

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
    const interval = setInterval(loadPartner, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }

    // Set new timeout to hide after 1 second
    const timeout = setTimeout(() => {
      setHovering(false);
    }, 1000);

    setHideTimeoutId(timeout);
  };

  const handleMouseEnter = () => {
    // Clear hide timeout if mouse re-enters
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      setHideTimeoutId(null);
    }
    setHovering(true);
  };

  const handleCardMouseEnter = () => {
    // Keep card open when hovering over it
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      setHideTimeoutId(null);
    }
  };

  const handleCardMouseLeave = () => {
    // Start hide timer when leaving the card
    handleMouseLeave();
  };

  if (loading || !partner) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Hover Details Card - Shows on Hover - Positioned Above */}
      {hovering && (
        <div
          className={`mb-4 bg-white rounded-xl shadow-2xl border border-primary-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 w-96 transition-opacity ${hovering ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Banner - Full Width */}
          <div className="h-24 bg-gradient-to-r from-primary-100 to-primary-200 relative overflow-hidden">
            <img
              src={partner.banner}
              alt={partner.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Details Section */}
          <div className="p-5 space-y-4 flex flex-col">
            {/* Logo and Name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg border-2 border-primary-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-md">
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
                <p className="font-bold text-lg text-neutral-900">{partner.name}</p>
                <p className="text-xs text-primary-600 font-semibold mt-0.5">✨ Featured Partner</p>
              </div>
            </div>

            {/* Description - Full Details */}
            <div className="max-h-32 overflow-y-auto">
              <p className="text-sm text-neutral-600 leading-relaxed">
                {partner.description}
              </p>
            </div>

            {/* CTA Link */}
            <div className="pt-2 border-t border-primary-100">
              <a
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 font-bold hover:text-primary-700 hover:underline flex items-center gap-2 transition-colors"
              >
                <span className="text-sm">→</span>
                <span>Visit Website</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Partner Logo with Animations */}
      <button
        onClick={() => window.open(partner.link, '_blank')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col items-center gap-2 cursor-pointer"
      >
        {/* Outer Glow - Continuous Animation */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 opacity-60 blur-lg animate-pulse -z-10"></div>

        {/* Secondary Rotating Glow */}
        <div className="absolute -inset-2 rounded-full border-2 border-primary-400 opacity-40 animate-spin" style={{ animationDuration: '4s' }}></div>

        {/* Logo Container - Main Clickable */}
        <div className="relative">
          {/* Bounce Animation */}
          <div className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-white bg-gradient-to-br from-white to-primary-50 flex items-center justify-center transition-all duration-300 group-hover:shadow-3xl group-hover:scale-125 hover:animate-bounce"
            style={{
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <img
              src={partner.logo}
              alt={partner.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Active Indicator Dot - Pulsing */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-md animate-pulse"></div>

          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </button>

      {/* Floating Animation CSS */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
