import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import { Logo } from './Logo';

export const SmartInstallBanner = () => {
  const { isInstalled, triggerInstall } = usePWA();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('vadhu_var_install_banner_dismissed') === 'true';
  });

  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('vadhu_var_install_banner_dismissed', 'true');
  };

  return (
    <div className="glass-card border-b border-zinc-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md relative z-40 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <Logo type="app" size="small" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
            <span>Vadhu Var App</span>
            <span className="text-[9px] text-amber-700 dark:text-gold-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-semibold">Official</span>
          </p>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate font-medium">Install on Android & iPhone for fastest experience</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={triggerInstall}
          className="px-3.5 py-1.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 radius-btn text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SmartInstallBanner;
