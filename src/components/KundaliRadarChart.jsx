import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

/**
 * KundaliRadarChart - 6-Axis Precision Vector Radar Chart
 * Visualizes 6 key dimensions comparing Candidate Attributes against User Partner Preferences.
 */
export const KundaliRadarChart = ({
  candidateData = {},
  userPreferences = {},
  size = 280,
  className = ''
}) => {
  const [activeAxis, setActiveAxis] = useState(null);

  const hasKundali = Boolean(candidateData.hasKundali);
  const kundaliGuna = candidateData.kundaliGuna;

  // 6 Primary Dimensions & Scores
  const dimensions = [
    {
      key: 'age',
      label: 'Age & Stage',
      score: candidateData.ageScore || 85,
      prefScore: 90,
      detail: 'Optimal ±2 year preference bracket'
    },
    {
      key: 'height',
      label: 'Height & Build',
      score: candidateData.heightScore || 75,
      prefScore: 85,
      detail: candidateData.heightScore >= 85 ? 'Matches stated height range' : 'Height details pending or approximate'
    },
    {
      key: 'career',
      label: 'Career & Tier',
      score: candidateData.careerScore || 80,
      prefScore: 80,
      detail: 'Professional qualification alignment'
    },
    {
      key: 'diet',
      label: 'Diet & Lifestyle',
      score: candidateData.dietScore || 80,
      prefScore: 100,
      detail: 'Dietary preference alignment'
    },
    {
      key: 'location',
      label: 'Location & Region',
      score: candidateData.locationScore || 75,
      prefScore: 90,
      detail: 'Native region and current metro preference'
    },
    {
      key: 'kundali',
      label: hasKundali && kundaliGuna ? `Kundali (${kundaliGuna}/36)` : 'Kundali (Pending)',
      score: hasKundali ? (candidateData.kundaliScore || 70) : 15,
      prefScore: 80,
      detail: hasKundali && kundaliGuna ? `${kundaliGuna} of 36 Gunas matched (Vedic aligned)` : 'Astrological details pending update by candidate'
    }
  ];

  const center = size / 2;
  const radius = size * 0.38;
  const count = dimensions.length;

  // Compute (x, y) coordinates on a regular polygon for a given radius
  const getCoordinates = (index, valuePct, maxR = radius) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = (valuePct / 100) * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build polygon path string
  const getPolygonPath = (scoresKey) => {
    const points = dimensions.map((dim, i) => {
      const val = dim[scoresKey];
      const coords = getCoordinates(i, val);
      return `${coords.x},${coords.y}`;
    });
    return `M ${points.join(' L ')} Z`;
  };

  const candidatePath = getPolygonPath('score');
  const preferencePath = getPolygonPath('prefScore');

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none drop-shadow-xl"
        >
          {/* Concentric Background Web Rings (20%, 40%, 60%, 80%, 100%) */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => {
            const points = dimensions.map((_, i) => {
              const coords = getCoordinates(i, level * 100);
              return `${coords.x},${coords.y}`;
            });
            return (
              <polygon
                key={idx}
                points={points.join(' ')}
                fill="none"
                stroke="currentColor"
                className="text-zinc-300/80 dark:text-white/10"
                strokeWidth={idx === 4 ? 1.5 : 0.75}
                strokeDasharray={idx < 4 ? '3 3' : 'none'}
              />
            );
          })}

          {/* Radial Axis Lines */}
          {dimensions.map((dim, i) => {
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={dim.key}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                className="text-zinc-300 dark:text-white/15"
                strokeWidth={1}
              />
            );
          })}

          {/* User Stated Preference Polygon (Translucent Gold) */}
          <path
            d={preferencePath}
            fill="rgba(245, 158, 11, 0.10)"
            stroke="rgba(245, 158, 11, 0.6)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />

          {/* Candidate Actual Match Polygon (Radiant Crimson & Emerald Gradient) */}
          <path
            d={candidatePath}
            fill="url(#radarGradient)"
            stroke="#E11D48"
            strokeWidth={2.5}
            className="drop-shadow-[0_0_12px_rgba(225,29,72,0.4)]"
            style={{ transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          {/* Interactive Vertex Nodes */}
          {dimensions.map((dim, i) => {
            const candidateCoord = getCoordinates(i, dim.score);
            const isHovered = activeAxis === dim.key;

            return (
              <g
                key={dim.key}
                className="cursor-pointer"
                onMouseEnter={() => setActiveAxis(dim.key)}
                onMouseLeave={() => setActiveAxis(null)}
              >
                <circle
                  cx={candidateCoord.x}
                  cy={candidateCoord.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#FDE68A' : '#E11D48'}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="transition-all duration-200 drop-shadow"
                />
              </g>
            );
          })}

          {/* Axis Labels */}
          {dimensions.map((dim, i) => {
            const labelCoord = getCoordinates(i, 122);
            const isHovered = activeAxis === dim.key;

            return (
              <text
                key={dim.key}
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[10px] font-sans transition-colors duration-200 cursor-pointer ${
                  isHovered ? 'fill-amber-600 dark:fill-gold-300 font-bold' : 'fill-zinc-600 dark:fill-zinc-400 font-medium'
                }`}
                onMouseEnter={() => setActiveAxis(dim.key)}
                onMouseLeave={() => setActiveAxis(null)}
              >
                {dim.label}
              </text>
            );
          })}

          {/* Shader Gradients */}
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(225, 29, 72, 0.35)" />
              <stop offset="70%" stopColor="rgba(244, 63, 94, 0.2)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.15)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Axis Detail & Explanation Banner */}
      <div className="w-full mt-3 p-3 radius-btn bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/[0.08] text-xs">
        {activeAxis ? (
          (() => {
            const active = dimensions.find((d) => d.key === activeAxis);
            return (
              <div className="space-y-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-zinc-900 dark:text-white text-xs">{active.label}</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-gold-400">{active.score}% Match</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">{active.detail}</p>
              </div>
            );
          })()
        ) : (
          <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-amber-500 dark:bg-gold-400 rounded-full inline-block" />
              Your Preferences
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-crimson-500 rounded-full inline-block" />
              Candidate Profile
            </span>
            <span className="text-[10px] text-zinc-500">Hover to inspect</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KundaliRadarChart;
