import React from 'react';
import { X, Sparkles, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { calculateDetailedMatchScore } from '../lib/compatibilityCalculator';
import { useAuth } from '../context/AuthContext';

export const CompatibilityModal = ({ profile, onClose }) => {
  const { profile: myProfile, partnerPreferences } = useAuth();

  if (!profile) return null;

  const { totalScore, breakdown, matchTier } = calculateDetailedMatchScore(myProfile, profile, partnerPreferences);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card radius-card border border-white/10 max-w-lg w-full p-6 sm:p-7 relative shadow-2xl animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-20 bg-gold-500/10 blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 radius-btn text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pr-8 relative z-10">
          <div className="w-9 h-9 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold gold-gradient-text text-lg sm:text-xl leading-tight">
              Match Compatibility Breakdown
            </h3>
            <p className="text-xs text-zinc-400">
              Evaluation for {profile.full_name}, {profile.age} Yrs
            </p>
          </div>
        </div>

        {/* Overall Score Header */}
        <div className="bg-zinc-900/90 radius-card p-4 text-center border border-white/10 mb-4 flex items-center justify-between gap-4 relative z-10">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">Overall Match Index</span>
            <span className="font-serif text-3xl sm:text-4xl font-extrabold gold-gradient-text mt-0.5 block leading-none">
              {totalScore}%
            </span>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 radius-btn bg-gradient-to-r from-gold-500/20 to-amber-500/20 text-gold-300 border border-gold-500/30 font-bold text-xs">
              {matchTier}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">Based on 100-pt weighted preferences</p>
          </div>
        </div>

        {/* Breakdown Factor List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 text-xs relative z-10 custom-scrollbar">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-1 border-b border-white/10">
            Factor-by-Factor Telemetry
          </p>

          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 radius-card border transition-colors ${
                item.matched
                  ? 'bg-zinc-900/60 border-white/10 hover:border-gold-500/30'
                  : 'bg-zinc-900/30 border-white/5 opacity-85'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  {item.matched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : item.points > 0 ? (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{item.factor}</span>
                </div>

                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                    item.points === item.maxPoints
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : item.points > 0
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}
                >
                  {item.points}/{item.maxPoints} pts
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 pl-5 leading-tight">
                {item.reason}
              </p>
            </div>
          ))}
        </div>

        {/* Verification Status Note */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-300">
              {profile.is_fully_verified
                ? '100% Fully Verified Candidate'
                : profile.is_id_verified
                ? 'Government ID Verified Candidate'
                : 'Standard Candidate Profile'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityModal;
