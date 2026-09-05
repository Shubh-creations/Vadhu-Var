import React, { useState } from 'react';
import { Activity, Clock, ShieldCheck, CheckCircle2, MessageSquare, Zap } from 'lucide-react';

/**
 * ActivityHeatmap - Bklit UI Precision Dot-Matrix Telemetry
 * Visualizes candidate responsiveness, activity cadence across 12 weeks, and trust verification metrics.
 */
export const ActivityHeatmap = ({
  profile = {},
  className = ''
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate 12-week activity matrix (7 days per week)
  const weeks = 12;
  const daysPerWeek = 7;
  const matrix = [];

  // Seeded deterministic activity levels (0: none, 1: low, 2: medium, 3: high)
  for (let w = 0; w < weeks; w++) {
    const weekDays = [];
    for (let d = 0; d < daysPerWeek; d++) {
      const isWeekend = d === 0 || d === 6;
      const rand = Math.sin(w * 3 + d * 7 + (profile.id ? profile.id.charCodeAt(0) : 12)) * 10;
      const level = Math.abs(rand) > 6 ? 3 : Math.abs(rand) > 3 ? 2 : Math.abs(rand) > 1 ? 1 : 0;
      weekDays.push({
        week: w + 1,
        day: d,
        level: isWeekend ? Math.min(3, level + 1) : level,
        events: level === 3 ? '4 logins & 2 active chats' : level === 2 ? 'Active 1 hr ago' : level === 1 ? 'Profile updated' : 'No activity'
      });
    }
    matrix.push(weekDays);
  }

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 3:
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      case 2:
        return 'bg-emerald-600/80';
      case 1:
        return 'bg-emerald-900/60';
      default:
        return 'bg-zinc-850 bg-white/[0.04]';
    }
  };

  return (
    <div className={`p-5 radius-card glass-card border border-white/[0.08] space-y-4 ${className}`}>
      {/* Header with Response Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 radius-btn bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-white text-sm">Responsiveness & Trust Telemetry</h4>
            <p className="text-[11px] text-zinc-400">12-week verified engagement cadence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 radius-btn bg-zinc-900/90 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            <Zap className="w-3 h-3 text-emerald-400" />
            98% Reply Rate
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 radius-btn bg-zinc-900/90 text-gold-400 border border-gold-400/30 text-xs font-mono font-bold">
            <Clock className="w-3 h-3 text-gold-400" />
            &lt; 2 hrs avg
          </span>
        </div>
      </div>

      {/* Dot Matrix Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pb-1">
          <span>3 Months Ago</span>
          <span>Last Month</span>
          <span>This Week</span>
        </div>

        <div className="grid grid-flow-col gap-1 overflow-x-auto pb-1">
          {matrix.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-rows-7 gap-1">
              {week.map((cell, dIdx) => (
                <div
                  key={dIdx}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-3 h-3 rounded-xs transition-all duration-150 cursor-pointer hover:scale-125 ${getLevelColor(cell.level)}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Heatmap Legend & Tooltip */}
        <div className="flex items-center justify-between pt-2 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-white/[0.04]" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-900/60" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600/80" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
            </div>
            <span>High Activity</span>
          </div>

          {hoveredCell && (
            <span className="font-mono text-emerald-300 font-semibold animate-fade-in">
              Week {hoveredCell.week}: {hoveredCell.events}
            </span>
          )}
        </div>
      </div>

      {/* Trust Audit Verification Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-xs">
        <div className="p-2.5 radius-btn bg-zinc-900/60 border border-white/5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-white block text-[11px]">Government ID</span>
            <span className="text-[10px] text-zinc-400">Aadhaar / Voter Verified</span>
          </div>
        </div>

        <div className="p-2.5 radius-btn bg-zinc-900/60 border border-white/5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-white block text-[11px]">Contact Verified</span>
            <span className="text-[10px] text-zinc-400">Phone OTP & Email</span>
          </div>
        </div>

        <div className="p-2.5 radius-btn bg-zinc-900/60 border border-white/5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-white block text-[11px]">Family Consent</span>
            <span className="text-[10px] text-zinc-400">Parent Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
