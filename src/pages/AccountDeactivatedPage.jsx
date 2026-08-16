import React from 'react';
import { ShieldAlert, Mail, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';

export const AccountDeactivatedPage = ({ onReturnHome }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await logout();
    if (onReturnHome) {
      onReturnHome();
    }
  };

  return (
    <div className="min-h-screen bg-surface-ground text-main flex items-center justify-center p-4">
      <div className="bg-surface-card radius-card border border-main max-w-lg w-full p-8 text-center space-y-5 shadow-2xl animate-fade-in">
        <div className="flex justify-center">
          <Logo size="normal" />
        </div>

        <div className="w-16 h-16 radius-btn bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-main">
            Account Deactivated & Deleted
          </h1>
          <p className="text-xs text-sub leading-relaxed">
            This account and its associated matrimonial profile data, photos, and verification documents have been permanently removed from Vadhu Var.
          </p>
        </div>

        <div className="p-4 bg-surface-ground radius-card border border-main text-left text-xs space-y-2">
          <p className="font-bold text-main">What this means:</p>
          <p className="text-sub leading-relaxed">
            Your profile is no longer discoverable, messages and match preferences have been erased, and file storage has been cleared.
          </p>
          <div className="pt-2 border-t border-main">
            <p className="text-[11px] text-sub">
              If you requested this by mistake or wish to create a fresh profile, please contact our support desk:
            </p>
            <a
              href="mailto:vadhuvar.matrimonyapp@gmail.com"
              className="text-xs font-semibold text-sky-blue hover:underline inline-flex items-center gap-1.5 mt-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>vadhuvar.matrimonyapp@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleSignOut}
            className="flex-1 py-2.5 px-4 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDeactivatedPage;
