import React, { useState } from 'react';
import { X, HeartHandshake, Sparkles, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import CandidateAvatar from './CandidateAvatar';

export const SendProposalModal = ({
  isOpen,
  onClose,
  candidate,
  onSendProposal,
  isLoading = false
}) => {
  if (!isOpen || !candidate) return null;

  const templates = [
    `Namaskar, we reviewed ${candidate.full_name}'s bio-data and believe our family values and lifestyles align well. We would be honored to connect and discuss a matrimonial alliance.`,
    `Hello, our horoscopes and partner expectations show great compatibility with ${candidate.full_name}. We would like to initiate a conversation between both families.`,
    `Warm regards, we were impressed by ${candidate.full_name}'s profile, education, and family background. We look forward to connecting with your family.`
  ];

  const [message, setMessage] = useState(templates[0]);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (onSendProposal) {
      await onSendProposal(candidate.id, message.trim());
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg glass-card radius-card border border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Ambient Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-20 bg-gradient-to-r from-gold-500/20 via-crimson-500/20 to-gold-500/20 blur-xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 text-zinc-950 flex items-center justify-center shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-zinc-900 dark:text-white text-base sm:text-lg">
                Send Matrimonial Proposal
              </h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Formal cultural introduction to candidate & family</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 radius-btn text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close Proposal Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Preview Chip */}
        <div className="p-3.5 radius-btn bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 flex items-center gap-3.5 relative z-10">
          <CandidateAvatar
            src={candidate.photo_url}
            name={candidate.full_name}
            size="md"
            shape="rounded"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-sm truncate">
                {candidate.full_name}
              </h4>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{candidate.age} yrs</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
              {candidate.occupation || 'Professional'} • {candidate.city || 'Maharashtra'}
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-gold-400 border border-amber-500/20">
            Verified
          </span>
        </div>

        {/* Proposal Form */}
        {sentSuccess ? (
          <div className="py-8 text-center space-y-2 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-base">Proposal Sent Successfully!</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
              Your formal matrimonial proposal has been delivered to {candidate.full_name}'s profile inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400" />
                  <span>Personal Introduction Message</span>
                </label>
                <span className="text-[10px] text-zinc-500">Culturally respectful</span>
              </div>

              {/* Quick Template Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {templates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(tmpl)}
                    className={`text-[10px] px-2.5 py-1 radius-btn border transition-all ${
                      message === tmpl
                        ? 'bg-amber-500/15 text-amber-700 dark:text-gold-300 border-amber-500/40 font-semibold shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Template {idx + 1}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your matrimonial introduction message..."
                className="w-full p-3 radius-btn text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Privacy & Trust Assurance */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Contact details and phone numbers are only exchanged once both parties accept the proposal.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 radius-btn border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="px-5 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-md gold-glow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendProposalModal;
