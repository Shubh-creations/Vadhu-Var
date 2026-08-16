import React from 'react';
import { Lock } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onOpenPrivacy, onOpenTerms, onOpenHelp }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-card border-t border-main py-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Logo size="normal" />
            <p className="text-xs text-sub font-medium mt-1">
              Finding Your Perfect Match.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-sub flex-wrap justify-center">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-main flex items-center gap-1 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-sub" />
              <span>{t('privacyPolicy')}</span>
            </button>
            <span>•</span>
            <button
              onClick={onOpenTerms}
              className="hover:text-main transition-colors"
            >
              <span>{t('termsOfService')}</span>
            </button>
            <span>•</span>
            <button
              onClick={onOpenHelp}
              className="hover:text-main transition-colors"
            >
              <span>{t('helpFaq')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
