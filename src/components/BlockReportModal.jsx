import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const BlockReportModal = ({ candidate, isOpen, onClose }) => {
  const { blockUser } = useData();
  const [reasonCategory, setReasonCategory] = useState('fake_profile');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !candidate) return null;

  const categories = [
    { id: 'fake_profile', label: 'Fake Profile / Misleading Details' },
    { id: 'anti_scam', label: 'Financial Request / Money Transfer Solicitations' },
    { id: 'inappropriate', label: 'Inappropriate or Abusive Messages' },
    { id: 'commercial', label: 'Commercial Usage / Agent Spam' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    blockUser(candidate.id, reasonCategory, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card radius-card border border-rose-500/20 max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-fade-in overflow-hidden">
        {/* Ambient Danger Glow */}
        <div className="absolute top-0 right-1/4 w-36 h-16 bg-rose-600/10 blur-xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 radius-btn text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-white">
            Block & Report Candidate
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Reporting <span className="font-bold text-white">{candidate.full_name}</span> for safety moderation review
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 relative z-10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-white">User Blocked & Report Logged</h3>
            <p className="text-xs text-zinc-400">
              This candidate has been hidden from your match feeds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm relative z-10">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5 text-xs">
                Select Reason Category
              </label>
              <div className="space-y-2">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                      reasonCategory === c.id
                        ? 'border-rose-500/60 bg-rose-500/10 text-rose-200 font-bold'
                        : 'border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={c.id}
                      checked={reasonCategory === c.id}
                      onChange={() => setReasonCategory(c.id)}
                      className="accent-rose-500"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                Additional Details (Optional)
              </label>
              <textarea
                rows="3"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide details for our safety moderation team..."
                className="w-full p-3 border border-white/10 radius-btn bg-zinc-900/90 text-white placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/60 transition-colors text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 radius-btn bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Block Candidate & Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlockReportModal;
