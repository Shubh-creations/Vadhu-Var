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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-card border border-main radius-card max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 radius-btn text-sub hover:text-main"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 radius-btn bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto mb-2.5">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-main">
            Privacy & Trust Controls
          </h2>
          <p className="text-xs text-sub mt-0.5">
            Configure photo blur, phone number masking & search visibility
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* 1. Photo Shielding / Blur */}
          <div className="bg-surface-ground p-4 radius-card border border-main space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.photoBlur ? (
                  <EyeOff className="w-4 h-4 text-amber-500" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-500" />
                )}
                <span className="font-bold text-main">Photo Privacy Shield</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('photoBlur')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.photoBlur ? 'bg-sky-blue' : 'bg-surface-card border border-main'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.photoBlur ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-sub leading-relaxed">
              {settings.photoBlur
                ? 'Photos stay blurred until you explicitly accept a connection request.'
                : 'Photos are visible to verified candidates on discovery feed.'}
            </p>
          </div>

          {/* 2. Phone Number Masking Shield */}
          <div className="bg-surface-ground p-4 radius-card border border-main space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-main">Direct Phone Masking</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('phoneShield')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.phoneShield ? 'bg-sky-blue' : 'bg-surface-card border border-main'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.phoneShield ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-sub leading-relaxed">
              Masks your mobile number and requires in-app proposal verification before contact exchange.
            </p>
          </div>

          {/* 3. Incognito Search Mode */}
          <div className="bg-surface-ground p-4 radius-card border border-main space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-blue" />
                <span className="font-bold text-main">Private / Incognito Mode</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('incognito')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.incognito ? 'bg-sky-blue' : 'bg-surface-card border border-main'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.incognito ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-sub leading-relaxed">
              {settings.incognito
                ? 'Your profile is currently hidden from public search feeds.'
                : 'Your profile is active and discoverable by verified candidates.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-6 py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : null}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Privacy Preferences'}</span>
        </button>
      </div>
    </div>
  );
};

export default PrivacySettingsModal;
