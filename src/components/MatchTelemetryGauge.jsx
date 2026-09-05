import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

/**
 * MatchTelemetryGauge - Bklit UI Precision Concentric Gauge
 * Concentric SVG rings representing dimensional compatibility:
 * - Ring 1 (Gold): Core Values & Lifestyle Match
 * - Ring 2 (Emerald): Education & Career Alignment
 * - Ring 3 (Rose/Crimson): Astrological / Kundali Compatibility (e.g. 32/36)
 * - Center: Master Overall Percentage
 */
export const MatchTelemetryGauge = ({
  score = 88,
  valuesScore = 92,
  careerScore = 86,
  kundaliScore = null, // null if candidate has not provided kundali
  kundaliMax = 36,
  size = 'md', // 'sm' | 'md' | 'lg'
  showDetails = false,
  textColor = null, // e.g. 'text-white' when embedded on dark photo scrims
  className = ''
}) => {
  const [hovered, setHovered] = useState(false);

  const centerTextClass = textColor || 'text-zinc-900 dark:text-white';
  const trackRingClass = textColor ? 'text-white/20' : 'text-zinc-200 dark:text-white/[0.08]';
  const labelTextClass = textColor ? 'text-amber-300' : 'text-amber-700 dark:text-gold-champagne';

  const isKundaliPending = kundaliScore === null || kundaliScore === undefined;
  // Normalize kundali score to percentage for ring draw (0 if pending)
  const kundaliPct = isKundaliPending ? 0 : Math.min(100, Math.round((kundaliScore / kundaliMax) * 100));

  // Size configurations
  const config = {
    sm: {
      svgSize: 64,
      strokeWidth: 3.5,
      r1: 26,
      r2: 20,
      r3: 14,
      fontSize: 'text-xs',
      labelSize: 'text-[9px]'
    },
    md: {
      svgSize: 96,
      strokeWidth: 5,
      r1: 40,
      r2: 31,
      r3: 22,
      fontSize: 'text-lg',
      labelSize: 'text-[10px]'
    },
    lg: {
      svgSize: 140,
      strokeWidth: 7,
      r1: 58,
      r2: 45,
      r3: 32,
      fontSize: 'text-2xl',
      labelSize: 'text-xs'
    }
  }[size] || config.md;

  const { svgSize, strokeWidth, r1, r2, r3, fontSize, labelSize } = config;
  const center = svgSize / 2;

  // Circumference calculations
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;

  const offset1 = c1 - (valuesScore / 100) * c1;
  const offset2 = c2 - (careerScore / 100) * c2;
  const offset3 = isKundaliPending ? c3 : c3 - (kundaliPct / 100) * c3;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative cursor-pointer select-none">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90 drop-shadow-md"
        >
          {/* Background Track Rings */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="currentColor"
            className={trackRingClass}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="currentColor"
            className={trackRingClass}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke="currentColor"
            className={trackRingClass}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Concentric Dimension 1: Values & Lifestyle (Champagne Gold) */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="url(#goldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={c1}
            strokeDashoffset={offset1}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          {/* Concentric Dimension 2: Education & Career (Emerald) */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="url(#emeraldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={c2}
            strokeDashoffset={offset2}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          {/* Concentric Dimension 3: Kundali / Guna Milan (Royal Crimson) */}
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke={isKundaliPending ? 'currentColor' : 'url(#crimsonGradient)'}
            className={isKundaliPending ? (textColor ? 'text-white/20' : 'text-zinc-300 dark:text-white/10') : ''}
            strokeWidth={strokeWidth}
            strokeDasharray={isKundaliPending ? '2 3' : c3}
            strokeDashoffset={offset3}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          {/* SVG Radiant Gradients */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="crimsonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Display: Overall Match Score % */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`font-mono font-black tracking-tighter ${fontSize} ${centerTextClass} drop-shadow-sm`}>
            {score}%
          </span>
          {size !== 'sm' && (
            <span className={`font-sans font-semibold uppercase tracking-widest ${labelSize} ${labelTextClass}`}>
              MATCH
            </span>
          )}
        </div>
      </div>

      {/* Interactive Bklit Glassmorphic Tooltip ONLY on Hover */}
      {hovered && (
        <div className="absolute -top-24 sm:-top-28 z-40 w-52 sm:w-60 p-3 radius-card glass-card border border-zinc-200 dark:border-white/10 shadow-2xl space-y-1.5 text-left text-xs pointer-events-none animate-fade-in backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-white/10">
            <span className="font-serif font-bold text-zinc-900 dark:text-white text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-gold-400" />
              Telemetry Breakdown
            </span>
            <span className="font-mono font-bold text-amber-700 dark:text-gold-400 text-[11px]">{score}% Overall</span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-gold-400" />
              Values & Lifestyle
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">{valuesScore}%</span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Career & Education
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">{careerScore}%</span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isKundaliPending ? 'bg-zinc-400' : 'bg-crimson-500'}`} />
              Kundali Guna Milan
            </span>
            <span className={`font-mono font-semibold ${isKundaliPending ? 'text-zinc-400 dark:text-zinc-500 italic text-[9px]' : 'text-crimson-600 dark:text-crimson-400'}`}>
              {isKundaliPending ? 'Yet to update' : `${kundaliScore}/36 Gunas`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchTelemetryGauge;
