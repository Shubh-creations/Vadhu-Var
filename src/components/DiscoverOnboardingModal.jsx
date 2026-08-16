import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, Sparkles, Check, ArrowRight, X, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DiscoverOnboardingModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: SlidersHorizontal,
      iconColor: 'text-sky-blue',
      bgColor: 'bg-sky-blue/10',
      title: 'Smart Matrimony Filters',
      description: 'Filter verified brides and grooms across India by location, age range, education level, and dietary lifestyle. Click "Apply Filters" to refresh matches anytime.'
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      title: 'Verified Trust Badges',
      description: 'Look for the ID Verified (✓) and 100% Fully Verified (★) trust badges. These profiles have submitted government identification verified by our admin team.'
    },
    {
      icon: Sparkles,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      title: '100-Point Match Compatibility',
      description: 'Every candidate card displays an AI Match Compatibility score comparing marital status, age, diet, and city preferences against your saved partner criteria.'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('vadhu_var_discover_intro_seen', 'true');
    onClose();
  };

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in relative">
        {/* Close / Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 p-1.5 radius-btn text-sub hover:text-main"
          title="Skip Tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Visual & Icon */}
        <div className="text-center space-y-3 pt-2">
          <div className={`w-16 h-16 rounded-2xl ${current.bgColor} ${current.iconColor} flex items-center justify-center mx-auto shadow-sm`}>
            <StepIcon className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-sky-blue' : 'w-2 bg-surface-ground border border-main'
                }`}
              />
            ))}
          </div>

          <h3 className="font-serif font-bold text-main text-lg sm:text-xl">
            {current.title}
          </h3>

          <p className="text-xs sm:text-sm text-sub leading-relaxed max-w-sm mx-auto">
            {current.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-main">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs font-semibold text-sub hover:text-main px-3 py-2"
          >
            Skip Tour
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>{currentStep === steps.length - 1 ? 'Start Discovering' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoverOnboardingModal;
