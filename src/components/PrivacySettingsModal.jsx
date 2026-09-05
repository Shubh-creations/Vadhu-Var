import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Phone, Lock, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const PrivacySettingsModal = ({ isOpen, onClose }) => {
  const { profile, updateAccountSettings } = useAuth();
  const { t } = useLanguage();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vadhu_var_privacy_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      photoBlur: false,
      phoneShield: true,
      incognito: profile?.is_visible === false
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        incognito: profile.is_visible === false
      }));
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('vadhu_var_privacy_settings', JSON.stringify(next));
      return next;
    });
  };

  const handleSave = async () => {
    try {
      localStorage.setItem('vadhu_var_privacy_settings', JSON.stringify(settings));
      if (updateAccountSettings) {
        await updateAccountSettings({
          is_visible: !settings.incognito,
          is_search_visible: !settings.incognito
        });
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card border border-white/10 radius-card max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-16 bg-gold-500/15 blur-xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 radius-btn text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 radius-btn bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center mx-auto mb-2.5">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold gold-gradient-text">
            Privacy & Trust Controls
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure photo blur, phone number masking & search visibility
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm relative z-10">
          {/* 1. Photo Shielding / Blur */}
          <div className="bg-zinc-900/80 p-4 radius-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.photoBlur ? (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-bold text-white">Photo Privacy Shield</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('photoBlur')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.photoBlur ? 'bg-gradient-to-r from-gold-500 to-amber-600' : 'bg-zinc-800 border border-white/10'
                }`}
              >
                <div
                  className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.photoBlur ? 'translate-x-5 bg-white' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {settings.photoBlur
                ? 'Photos stay blurred until you explicitly accept a connection request.'
                : 'Photos are visible to verified candidates on discovery feed.'}
            </p>
          </div>

          {/* 2. Phone Number Masking Shield */}
          <div className="bg-zinc-900/80 p-4 radius-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Direct Phone Masking</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('phoneShield')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.phoneShield ? 'bg-gradient-to-r from-gold-500 to-amber-600' : 'bg-zinc-800 border border-white/10'
                }`}
              >
                <div
                  className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.phoneShield ? 'translate-x-5 bg-white' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Masks your mobile number and requires in-app proposal verification before contact exchange.
            </p>
          </div>

          {/* 3. Incognito Search Mode */}
          <div className="bg-zinc-900/80 p-4 radius-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400" />
                <span className="font-bold text-white">Private / Incognito Mode</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('incognito')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.incognito ? 'bg-gradient-to-r from-gold-500 to-amber-600' : 'bg-zinc-800 border border-white/10'
                }`}
              >
                <div
                  className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.incognito ? 'translate-x-5 bg-white' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {settings.incognito
                ? 'Your profile is currently hidden from public search feeds.'
                : 'Your profile is active and discoverable by verified candidates.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-6 py-3 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer relative z-10"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : null}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Privacy Preferences'}</span>
        </button>
      </div>
    </div>
  );
};

export default PrivacySettingsModal;
