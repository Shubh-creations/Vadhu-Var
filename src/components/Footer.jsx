import React from 'react';
import { Lock, Mail, HelpCircle, FileText } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onOpenPrivacy, onOpenTerms, onOpenHelp }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-card border-t border-main py-6 mt-12 pb-24 md:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Logo variant="nav" />
            <p className="text-xs text-sub font-medium mt-0.5">
              Finding Your Perfect Match.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-medium text-sub flex-wrap justify-center">
            <div className="flex items-center gap-4 flex-wrap justify-center">
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

            <div className="flex items-center gap-1.5 text-main font-semibold bg-surface-ground px-3 py-1 radius-btn border border-main">
              <Mail className="w-3.5 h-3.5 text-sky-blue" />
              <span className="text-sub font-normal hidden md:inline">{t('supportContact') || 'Support'}:</span>
              <a
                href="mailto:vadhuvar.matrimonyapp@gmail.com"
                className="text-sky-blue hover:underline text-xs font-medium"
              >
                vadhuvar.matrimonyapp@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
