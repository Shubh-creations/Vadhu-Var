import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * PhotoPrivacyShield - Luxury Frosted Privacy Blur & Vector Padlock
 * Implements a dynamic backdrop-blur filter with an interactive unlock authorization request.
 */
export const PhotoPrivacyShield = ({
  isPrivate = true,
  candidateName = 'Candidate',
  onUnlockRequest = null,
  className = ''
}) => {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isPrivate) return null;

  const handleRequestAccess = (e) => {
    e.stopPropagation();
    if (requested || loading) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRequested(true);
      if (onUnlockRequest) {
        onUnlockRequest();
      }
    }, 600);
  };

  return (
    <div
      className={`absolute inset-0 z-20 backdrop-blur-xl bg-zinc-950/70 border border-white/10 flex flex-col items-center justify-center p-4 text-center select-none transition-all duration-300 ${className}`}
    >
      {/* Animated Glowing Padlock Icon */}
      <div className="relative mb-3 group">
        <div className="absolute -inset-2 bg-gradient-to-r from-gold-500/20 to-crimson-500/20 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-12 h-12 rounded-full glass-card flex items-center justify-center border border-gold-400/30 text-gold-400 shadow-xl">
          {requested ? (
            <Unlock className="w-5 h-5 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-5 h-5 text-gold-champagne animate-pulse" />
          )}
        </div>
      </div>

      <div className="space-y-1 max-w-[200px]">
        <h4 className="font-serif font-bold text-white text-xs sm:text-sm tracking-tight">
          {requested ? 'Access Requested' : 'Photo Privacy Shield'}
        </h4>
        <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-tight">
          {requested
            ? `${candidateName} will be notified to approve your photo view request.`
            : `Protected by candidate privacy preferences.`}
        </p>
      </div>

      <button
        type="button"
        onClick={handleRequestAccess}
        disabled={requested || loading}
        className={`mt-3 px-3.5 py-1.5 radius-btn text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-lg ${
          requested
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
            : 'bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 border border-gold-300 font-extrabold shadow-gold-500/20'
        }`}
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        ) : requested ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Requested ✓</span>
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5" />
            <span>Request Access</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PhotoPrivacyShield;
