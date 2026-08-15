import React from 'react';
import { X, Sparkles, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { calculateDetailedMatchScore } from '../lib/compatibilityCalculator';
import { useAuth } from '../context/AuthContext';

export const CompatibilityModal = ({ profile, onClose }) => {
  const { profile: myProfile, partnerPreferences } = useAuth();

  if (!profile) return null;

  const { totalScore, breakdown, matchTier } = calculateDetailedMatchScore(myProfile, profile, partnerPreferences);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-lg w-full p-6 relative shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 pr-8">
          <Sparkles className="w-5 h-5 text-sky-blue flex-shrink-0" />
          <div>
            <h3 className="font-serif font-bold text-main text-lg leading-tight">
              Match Compatibility Breakdown
            </h3>
            <p className="text-xs text-sub">
              Comparison for {profile.full_name}, {profile.age}
            </p>
          </div>
        </div>

        {/* Overall Score Header */}
        <div className="bg-surface-ground radius-card p-4 text-center border border-main mb-4 flex items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs text-sub block">Overall Match Index</span>
            <span className="font-serif text-3xl font-extrabold text-sky-blue mt-0.5 block leading-none">
              {totalScore}%
            </span>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 radius-btn bg-sky-blue/10 text-sky-blue border border-sky-blue/20 font-bold text-xs">
              {matchTier}
            </span>
            <p className="text-[10px] text-sub mt-1">Based on 100-pt weighted preferences</p>
          </div>
        </div>

        {/* Breakdown Factor List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 text-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sub pb-1 border-b border-main">
            Factor-by-Factor Evaluation
          </p>

          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 radius-card border transition-colors ${
                item.matched
                  ? 'bg-surface-ground/70 border-main'
                  : 'bg-surface-ground/30 border-main opacity-85'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-main">
                  {item.matched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : item.points > 0 ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span>{item.factor}</span>
                </div>

                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                    item.points === item.maxPoints
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : item.points > 0
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-surface-card text-sub border-main'
                  }`}
                >
                  {item.points}/{item.maxPoints} pts
                </span>
              </div>

              <p className="text-[11px] text-sub pl-5 leading-tight">
                {item.reason}
              </p>
            </div>
          ))}
        </div>

        {/* Verification Status Tie-Breaker Note */}
        <div className="mt-4 pt-3 border-t border-main flex items-center justify-between text-[11px] text-sub">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {profile.is_fully_verified
                ? '100% Fully Verified Candidate'
                : profile.is_id_verified
                ? 'Government ID Verified Candidate'
                : 'Standard Candidate Profile'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityModal;
