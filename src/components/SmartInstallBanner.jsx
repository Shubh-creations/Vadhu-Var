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
    <div className="bg-surface-card border-b border-main px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <Logo type="app" size="small" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-main truncate">Vadhu Var App</p>
          <p className="text-[10px] text-sub truncate">Fast access & offline matchmaking</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={triggerInstall}
          className="px-3 py-1.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 radius-btn text-sub hover:text-main"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SmartInstallBanner;
