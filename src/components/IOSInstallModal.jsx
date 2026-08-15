import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import { Logo } from './Logo';

export const IOSInstallModal = () => {
  const { showIOSModal, setShowIOSModal } = usePWA();

  if (!showIOSModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative animate-fade-in">
        <button
          onClick={() => setShowIOSModal(false)}
          className="absolute top-4 right-4 p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-2">
          <Logo type="app" size="medium" />
        </div>

        <div>
          <h3 className="font-serif text-xl font-bold text-main">Install Vadhu Var App</h3>
          <p className="text-xs text-sub mt-1">
            Install on your iPhone or iPad for fast access and a full-screen experience.
          </p>
        </div>

        <div className="bg-surface-ground radius-card p-4 text-left border border-main space-y-3 text-xs text-main">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              1
            </div>
            <p>
              Tap the <strong>Share</strong> icon <Share className="w-3.5 h-3.5 inline text-sky-blue mx-0.5" /> in your Safari browser bottom bar.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              2
            </div>
            <p>
              Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-sky-blue mx-0.5" />.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              3
            </div>
            <p>
              Tap <strong>Add</strong> in the top right corner. Done!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIOSModal(false)}
          className="w-full py-2.5 radius-btn bg-sky-blue text-white font-bold text-xs shadow-xs"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export default IOSInstallModal;
