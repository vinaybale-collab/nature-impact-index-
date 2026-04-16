'use client';

export default function MVPWatermark() {
  return (
    <div
      aria-hidden="true"
      title="MVP Preview · Data under construction and review"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        background: 'rgba(255, 251, 235, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid #FCD34D',
        borderRadius: '999px',
        boxShadow:
          '0 10px 30px -8px rgba(217, 119, 6, 0.25), 0 4px 12px -4px rgba(0, 0, 0, 0.08)',
        zIndex: 70,
        userSelect: 'none',
        pointerEvents: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#F59E0B',
          boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)',
          flexShrink: 0,
          animation: 'mvp-watermark-pulse 2s ease-in-out infinite',
        }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '13px',
            color: '#92400E',
            letterSpacing: '0.02em',
          }}
        >
          MVP Preview
        </span>
        <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 500 }}>
          Data under construction and review
        </span>
      </span>
      <style jsx>{`
        @keyframes mvp-watermark-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
          }
        }
      `}</style>
    </div>
  );
}
