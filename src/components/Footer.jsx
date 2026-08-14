import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onOpenPrivacy }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-card border-t border-main py-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 radius-btn bg-sky-blue text-white flex items-center justify-center font-extrabold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-main text-base">{t('brandName')}</span>
              <span className="text-[10px] text-sub block font-medium">{t('brandSubtitle')}</span>
            </div>
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
            <span>Delhi • Mumbai • Bengaluru • Pune • Hyderabad • Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
