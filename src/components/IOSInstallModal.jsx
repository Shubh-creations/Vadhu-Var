import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import { Logo } from './Logo';

export const IOSInstallModal = () => {
  const { showIOSModal, setShowIOSModal } = usePWA();

  if (!showIOSModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card radius-card border border-white/10 max-w-sm w-full p-6 sm:p-7 text-center space-y-4 shadow-2xl relative animate-fade-in overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 bg-gradient-to-b from-gold-500/20 to-transparent blur-xl pointer-events-none" />

        <button
          onClick={() => setShowIOSModal(false)}
          className="absolute top-4 right-4 p-1.5 radius-btn text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-2 relative z-10">
          <Logo type="app" size="medium" />
        </div>

        <div className="relative z-10">
          <h3 className="font-serif text-xl font-bold gold-gradient-text">Install Vadhu Var on iPhone</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Install on your iPhone or iPad for instant full-screen app experience without App Store download.
          </p>
        </div>

        <div className="bg-zinc-900/80 radius-card p-4 text-left border border-white/10 space-y-3.5 text-xs text-zinc-200 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              1
            </div>
            <p className="leading-relaxed">
              In Safari, tap the <strong className="text-white">Share</strong> icon <Share className="w-4 h-4 inline text-gold-400 mx-1 align-text-bottom" /> at the bottom bar.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              2
            </div>
            <p className="leading-relaxed">
              Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-4 h-4 inline text-gold-400 mx-1 align-text-bottom" />.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              3
            </div>
            <p className="leading-relaxed">
              Tap <strong className="text-white">Add</strong> in the top-right corner. The app icon will appear on your home screen!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIOSModal(false)}
          className="w-full py-3 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Got It, Thanks!
        </button>
      </div>
    </div>
  );
};

export default IOSInstallModal;
