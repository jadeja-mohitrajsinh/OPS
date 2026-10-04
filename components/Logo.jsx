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
      {/* ── OPS Logo Image ── */}
      <img
        src="/ops.png"
        alt="OPS Logo"
        width={config.iconSize}
        height={config.iconSize}
        style={{ flexShrink: 0, objectFit: 'contain' }}
      />

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
                background: 'linear-gradient(135deg, #ff685f, #ff3b30)',
                boxShadow: '0 0 8px rgba(255, 59, 48, 0.65)',
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
