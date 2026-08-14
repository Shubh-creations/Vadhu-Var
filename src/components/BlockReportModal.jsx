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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slateDark-900 border border-gray-100 dark:border-slateDark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Block & Report Candidate
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Reporting <span className="font-bold text-gray-800 dark:text-slate-200">{candidate.full_name}</span> for moderation review
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">User Blocked & Report Logged</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              This candidate has been hidden from your match feeds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-gray-800 dark:text-slate-200 mb-1">
                Select Reason Category
              </label>
              <div className="space-y-2">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                      reasonCategory === c.id
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold'
                        : 'border-gray-200 dark:border-slateDark-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={c.id}
                      checked={reasonCategory === c.id}
                      onChange={() => setReasonCategory(c.id)}
                      className="accent-red-600"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 dark:text-slate-200 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows="3"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide details for our safety moderation team..."
                className="w-full p-3 border border-gray-200 dark:border-slateDark-700 rounded-xl bg-white dark:bg-slateDark-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
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
