import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PWAUpdateToast = () => {
  const { t } = useLanguage();
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleUpdate = (e) => {
      setUpdateRegistration(e.detail);
      setVisible(true);
    };

    window.addEventListener('swUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  const handleRefresh = () => {
    if (updateRegistration && updateRegistration.waiting) {
      updateRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-surface-card border border-sky-blue radius-card p-4 shadow-lg animate-bounce-short">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 radius-btn bg-sky-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-main text-sm">Update Available</h4>
            <p className="text-xs text-sub mt-0.5">
              A new version of Vadhu Var is ready. Refresh now to get the latest features.
            </p>
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-sub hover:text-main p-1"
          aria-label="Dismiss Update Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={handleRefresh}
          className="px-4 py-1.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Now</span>
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateToast;
