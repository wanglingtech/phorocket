import React from 'react';

export interface PhorocketLogoProps {
  variant?: 'horizontal' | 'isotipo' | 'favicon' | 'monochrome' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const PhorocketSymbol: React.FC<{
  monochrome?: boolean;
  light?: boolean;
  className?: string;
}> = ({ monochrome = false, light = false, className = 'w-8 h-8' }) => {
  // Theme reactive gradient or monochrome
  const primaryColor = monochrome
    ? '#ffffff'
    : light
    ? '#1e1136'
    : 'var(--accent-primary, #a855f7)';
  const secondaryColor = monochrome
    ? '#a1a1aa'
    : light
    ? '#581c87'
    : 'var(--accent-secondary, #c084fc)';
  const coreFill = monochrome
    ? '#ffffff'
    : light
    ? '#090514'
    : '#07060c';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Phorocket Isotipo"
    >
      <defs>
        <linearGradient id="phoRocketGrad" x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} />
          <stop offset="1" stopColor={secondaryColor} />
        </linearGradient>
        <radialGradient id="phoCoreGlow" cx="50%" cy="50%" r="50%">
          <stop stopColor={secondaryColor} stopOpacity="0.8" />
          <stop offset="1" stopColor={primaryColor} stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* 1. Concentric Audio Wave Arcs (Vinyl Grooves & Sound Waves) */}
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke={monochrome ? 'rgba(255,255,255,0.2)' : light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)'}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke={monochrome ? 'rgba(255,255,255,0.35)' : light ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'}
        strokeWidth="1.5"
      />

      {/* 2. Audio Spectrum Frequency Bars radiating from lower-left to upper-right */}
      <path
        d="M12 40C12 40 14 34 16 34C18 34 19 46 21 46C23 46 25 24 27 24C29 24 31 42 33 42C35 42 37 16 39 16C41 16 43 38 45 38C47 38 49 28 51 28"
        stroke={monochrome ? 'rgba(255,255,255,0.45)' : secondaryColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* 3. Outer Vinyl Core Circle */}
      <circle cx="32" cy="32" r="14" fill={coreFill} stroke="url(#phoRocketGrad)" strokeWidth="2" />

      {/* 4. Dynamic Stylized Rocket Silhouette (Forward 45-degree angle thrust) */}
      <path
        d="M45 19C45 19 40.5 22.5 35 24.5C31.5 26 27.5 28 25 32C24 33.6 23.5 36.5 24 38.5L25.5 40L23 43.5C21.8 45.2 21 47 21 47C21 47 22.8 46.2 24.5 45L28 42.5L29.5 44C31.5 44.5 34.4 44 36 43C40 40.5 42 36.5 43.5 33C45.5 27.5 49 23 49 23C49 23 47 20.5 45 19Z"
        fill="url(#phoRocketGrad)"
      />

      {/* Rocket Cockpit / Audio Node Aperture */}
      <circle cx="37" cy="27" r="2.2" fill={monochrome ? '#ffffff' : '#ffffff'} />

      {/* Sonic Jet Exhaust Wave Pulse */}
      <path
        d="M19 49L15 53M16 46L11 48M22 51L20 56"
        stroke={monochrome ? 'rgba(255,255,255,0.8)' : primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const PhorocketLogo: React.FC<PhorocketLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: { symbol: 'w-6 h-6', text: 'text-base', gap: 'gap-2' },
    md: { symbol: 'w-8 h-8', text: 'text-xl', gap: 'gap-2.5' },
    lg: { symbol: 'w-10 h-10', text: 'text-2xl', gap: 'gap-3' },
    xl: { symbol: 'w-14 h-14', text: 'text-4xl', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size];

  if (variant === 'isotipo') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <PhorocketSymbol className={currentSize.symbol} />
      </div>
    );
  }

  if (variant === 'favicon') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-[#0e0c18] border border-white/10 p-2 shadow-lg shadow-purple-950/40 ${className}`}
      >
        <PhorocketSymbol className={currentSize.symbol} />
      </div>
    );
  }

  if (variant === 'monochrome') {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        <PhorocketSymbol monochrome className={currentSize.symbol} />
        <span className={`font-display font-bold tracking-tight text-white ${currentSize.text}`}>
          Phorocket
        </span>
      </div>
    );
  }

  if (variant === 'light') {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        <PhorocketSymbol light className={currentSize.symbol} />
        <span className={`font-display font-bold tracking-tight text-slate-900 ${currentSize.text}`}>
          Phorocket
        </span>
      </div>
    );
  }

  // Default 'horizontal' variant
  return (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      <div className="relative transition-transform duration-300 group-hover:scale-105">
        <PhorocketSymbol className={currentSize.symbol} />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-display font-extrabold tracking-tight text-white transition-colors duration-200 ${currentSize.text}`}
        >
          Phorocket
        </span>
      </div>
    </div>
  );
};
