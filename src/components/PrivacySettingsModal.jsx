import React from 'react';
import { Shield, Eye, EyeOff, Phone, Lock, X, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const PrivacySettingsModal = ({ isOpen, onClose }) => {
  const { privacySettings, updatePrivacySettings } = useData();

  if (!isOpen) return null;

  const handleToggle = (key, value) => {
    updatePrivacySettings({ [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slateDark-900 border border-gray-100 dark:border-slateDark-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slateDark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Granular Privacy Controls
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Configure photo blur, phone number masking & incognito mode
          </p>
        </div>

        <div className="space-y-5 text-xs sm:text-sm">
          {/* 1. Photo Shielding / Blur */}
          <div className="bg-gray-50 dark:bg-slateDark-800 p-4 rounded-2xl border border-gray-100 dark:border-slateDark-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {privacySettings.photoBlur ? (
                  <EyeOff className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                ) : (
                  <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-bold text-gray-900 dark:text-white">Photo Privacy Shield</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('photoBlur', !privacySettings.photoBlur)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  privacySettings.photoBlur ? 'bg-gold-600' : 'bg-gray-300 dark:bg-slateDark-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    privacySettings.photoBlur ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
              {privacySettings.photoBlur
                ? 'Photos stay blurred until you accept a connection request.'
                : 'Photos are visible to verified members on discovery grid.'}
            </p>
          </div>

          {/* 2. Phone Number Masking Shield */}
          <div className="bg-gray-50 dark:bg-slateDark-800 p-4 rounded-2xl border border-gray-100 dark:border-slateDark-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-gray-900 dark:text-white">In-App Calling Protection</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('phoneShield', !privacySettings.phoneShield)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  privacySettings.phoneShield ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slateDark-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    privacySettings.phoneShield ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
              Masks your mobile number while permitting in-app WebRTC calls.
            </p>
          </div>

          {/* 3. Incognito Private Mode */}
          <div className="bg-gray-50 dark:bg-slateDark-800 p-4 rounded-2xl border border-gray-100 dark:border-slateDark-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-roseGold-600 dark:text-roseGold-500" />
                <span className="font-bold text-gray-900 dark:text-white">Incognito / Private Mode</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('incognito', !privacySettings.incognito)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  privacySettings.incognito ? 'bg-roseGold-600' : 'bg-gray-300 dark:bg-slateDark-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    privacySettings.incognito ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
              Only show your profile to candidates you have shortlisted or expressed interest in.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
        >
          Save Privacy Preferences
        </button>
      </div>
    </div>
  );
};

export default PrivacySettingsModal;
