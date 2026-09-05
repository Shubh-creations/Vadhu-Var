import React, { useEffect, useState } from 'react';

/**
 * ExpressInterestBurst - Golden Mandala & Particle Explosion
 * Triggers an expanding golden mandala geometry upon sending a proposal or shortlist.
 */
export const ExpressInterestBurst = ({ active = false, onComplete = null }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {/* Expanding Sacred Mandala Rings */}
      <div className="absolute w-32 h-32 rounded-full border border-gold-400/60 animate-ping opacity-75" />
      <div className="absolute w-48 h-48 rounded-full border border-crimson-500/40 animate-ping opacity-50" style={{ animationDelay: '100ms' }} />

      {/* Radiant SVG Mandala Starburst */}
      <svg
        className="w-24 h-24 text-gold-400 animate-spin"
        style={{ animationDuration: '3s' }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" stroke="currentColor" strokeWidth="1.5" fill="rgba(245, 158, 11, 0.15)" />
      </svg>
    </div>
  );
};

export default ExpressInterestBurst;
