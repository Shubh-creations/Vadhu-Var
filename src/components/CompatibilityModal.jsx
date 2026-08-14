import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

export const CompatibilityModal = ({ profile, onClose }) => {
  if (!profile) return null;

  const score = calculateCompatibilityEstimate(null, profile);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-md w-full p-6 relative shadow-md">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-sub hover:text-main">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-sky-blue" />
          <h3 className="font-serif font-bold text-main text-lg">Match Compatibility Breakdown</h3>
        </div>

        <div className="bg-surface-ground radius-card p-4 text-center border border-main mb-4">
          <span className="text-xs text-sub block">Overall Compatibility Estimate</span>
          <span className="font-serif text-3xl font-extrabold text-sky-blue mt-1 block">{score}%</span>
        </div>

        <div className="space-y-3 text-xs text-sub">
          <div className="flex justify-between items-center py-1.5 border-b border-main">
            <span>Location Match</span>
            <span className="font-medium text-main">High Overlap</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-main">
            <span>Education Qualification</span>
            <span className="font-medium text-main">Matching Standard</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-main">
            <span>Dietary Preference</span>
            <span className="font-medium text-main capitalize">{profile.diet || 'Veg'}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-main">
            <span>Family Background</span>
            <span className="font-medium text-main capitalize">{profile.family_type || 'Nuclear'}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs shadow-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CompatibilityModal;
