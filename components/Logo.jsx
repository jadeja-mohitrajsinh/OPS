'use client';

export default function Logo({ size = 'md', showText = true, subtitle = 'Personal OS', className = '' }) {
  const dimensions = {
    sm: { iconSize: 24, fontSize: 15, subSize: 10, gap: 8 },
    md: { iconSize: 32, fontSize: 18, subSize: 11, gap: 10 },
    lg: { iconSize: 44, fontSize: 24, subSize: 12, gap: 12 },
    xl: { iconSize: 56, fontSize: 30, subSize: 13, gap: 14 },
  };

  const config = dimensions[size] || dimensions.md;

  return (
    <div className={`ops-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: config.gap, userSelect: 'none' }}>
      {/* ── Modern Geometric OPS Icon ── */}
      <svg
        width={config.iconSize}
        height={config.iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="opsGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="opsGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <filter id="opsGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6d28d9" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer Rounded Container */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#opsGradPrimary)"
          filter="url(#opsGlow)"
        />

        {/* Inner Subtle Border */}
        <rect
          x="3.5"
          y="3.5"
          width="41"
          height="41"
          rx="10.5"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
        />

        {/* OPS Monogram Path (Bold, Geometric & Clean) */}
        {/* Letter O */}
        <path
          d="M13 18C13 15.2386 15.2386 13 18 13C20.7614 13 23 15.2386 23 18V30C23 32.7614 20.7614 35 18 35C15.2386 35 13 32.7614 13 30V18Z"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Pulse / Spark Accent Dot */}
        <circle cx="18" cy="24" r="2" fill="url(#opsGradAccent)" />

        {/* Letter P & S Connected Geometric Circuit */}
        <path
          d="M27 34V14H33C35.2091 14 37 15.7909 37 18C37 20.2091 35.2091 22 33 22H27"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36 26C36 26 34.5 25 32 25C29.5 25 28 26.5 28 28.5C28 31 31 31.5 33 32C35 32.5 36 33.5 36 35C36 37 34 38 31.5 38C29 38 27.5 37 27.5 37"
          stroke="url(#opsGradAccent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* ── Text Branding ── */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: config.fontSize,
                fontWeight: 900,
                letterSpacing: '-0.6px',
                color: 'var(--text)',
                fontFamily: 'inherit',
              }}
            >
              OPS
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                boxShadow: '0 0 6px rgba(139, 92, 246, 0.6)',
              }}
            />
          </div>
          {subtitle && (
            <span
              style={{
                fontSize: config.subSize,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.3px',
                marginTop: 2,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
