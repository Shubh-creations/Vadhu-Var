import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Globe, HeartHandshake, ShieldAlert, CheckCircle2, Save, UserX, ArrowLeft, Download, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePWA } from '../context/PWAContext';
import { Logo } from '../components/Logo';

export const AccountSettingsPage = ({ onBack, onNavigateToProfile }) => {
  const { profile, partnerPreferences, savePartnerPreferences, updateAccountSettings, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { isInstalled, triggerInstall } = usePWA();

  const [savingPref, setSavingPref] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Settings State
  const [isSearchVisible, setIsSearchVisible] = useState(
    profile?.is_visible !== undefined ? profile.is_visible !== false : profile?.is_search_visible !== false
  );
  const [prefData, setPrefData] = useState({
    age_min: partnerPreferences?.age_min || 21,
    age_max: partnerPreferences?.age_max || 35,
    height_min_cm: partnerPreferences?.height_min_cm || 150,
    height_max_cm: partnerPreferences?.height_max_cm || 190,
    accepted_marital_statuses: partnerPreferences?.accepted_marital_statuses || ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
    diet: partnerPreferences?.diet || 'any',
    min_income_lpa: partnerPreferences?.min_income_lpa || 'all',
    state: partnerPreferences?.state || 'any',
    city: partnerPreferences?.city || '',
    education: partnerPreferences?.education || 'any',
    notes: partnerPreferences?.notes || ''
  });

  useEffect(() => {
    if (partnerPreferences) {
      setPrefData(prev => ({
        ...prev,
        ...partnerPreferences,
        accepted_marital_statuses: partnerPreferences.accepted_marital_statuses || ['never_married', 'divorced', 'widowed', 'awaiting_divorce']
      }));
    }
  }, [partnerPreferences]);

  const handleMaritalStatusToggle = (status) => {
    setPrefData(prev => {
      const current = prev.accepted_marital_statuses || [];
      const updated = current.includes(status)
        ? current.filter(s => s !== status)
        : [...current, status];
      return { ...prev, accepted_marital_statuses: updated.length > 0 ? updated : ['never_married'] };
    });
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPref(true);
    try {
      await savePartnerPreferences(prefData);
      setSuccessMsg('Partner preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving partner preferences');
    } finally {
      setSavingPref(false);
    }
  };

  const handleToggleVisibility = async () => {
    const newVal = !isSearchVisible;
    setIsSearchVisible(newVal);
    try {
      await updateAccountSettings({ is_visible: newVal });
      setSuccessMsg(newVal ? 'Profile is now visible in Discover results.' : 'Profile hidden from search.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setIsSearchVisible(!newVal);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmDeactivate = window.confirm(
      'Are you sure you want to deactivate your account? Your profile will be hidden from everyone until you log in again.'
    );
    if (confirmDeactivate) {
      try {
        await updateAccountSettings({ is_active: false, is_visible: false });
        alert('Your account has been deactivated.');
        logout();
      } catch (err) {
        alert('Could not deactivate account.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-main">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 radius-btn text-sub hover:text-main">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-main">{t('accountSettings')}</h1>
            <p className="text-xs text-sub">Manage partner preferences, privacy visibility, app installation, and account options.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 radius-card bg-surface-ground border border-main text-main text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-sky-blue" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Partner Preferences Editor */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-main">
            <HeartHandshake className="w-5 h-5 text-sky-blue" />
            <h2 className="font-serif font-bold text-main text-lg">{t('partnerPreferences')}</h2>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            {/* Accepted Marital Status Multi-Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-main">
                {t('acceptedMaritalStatus')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'never_married', label: t('neverMarried') },
                  { id: 'divorced', label: t('divorced') },
                  { id: 'widowed', label: t('widowed') },
                  { id: 'awaiting_divorce', label: t('awaitingDivorce') }
                ].map((status) => {
                  const isChecked = prefData.accepted_marital_statuses?.includes(status.id);
                  return (
                    <button
                      type="button"
                      key={status.id}
                      onClick={() => handleMaritalStatusToggle(status.id)}
                      className={`px-3 py-2 radius-btn text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-surface-ground border-sky-blue text-main font-bold shadow-xs'
                          : 'bg-surface-ground/40 border-main text-sub hover:border-sky-blue/40'
                      }`}
                    >
                      <span>{status.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-sky-blue flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Age & Minimum Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">Preferred Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_min}
                    onChange={(e) => setPrefData(prev => ({ ...prev, age_min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                    placeholder="Min"
                  />
                  <span className="text-xs text-sub font-bold">to</span>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_max}
                    onChange={(e) => setPrefData(prev => ({ ...prev, age_max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Minimum Annual Income (LPA)</label>
                <select
                  value={prefData.min_income_lpa}
                  onChange={(e) => setPrefData(prev => ({ ...prev, min_income_lpa: e.target.value }))}
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                >
                  <option value="all">{t('anyIncome')}</option>
                  <option value="2.5">2.5+ LPA</option>
                  <option value="5">5+ LPA</option>
                  <option value="10">10+ LPA</option>
                  <option value="15">15+ LPA</option>
                  <option value="25">25+ LPA</option>
                </select>
              </div>
            </div>

            {/* Preferred Diet & Preferred Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">Preferred Diet</label>
                <select
                  value={prefData.diet}
                  onChange={(e) => setPrefData(prev => ({ ...prev, diet: e.target.value }))}
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                >
                  <option value="any">{t('allDiets')}</option>
                  <option value="veg">{t('vegetarian')}</option>
                  <option value="non-veg">{t('nonVegetarian')}</option>
                  <option value="eggetarian">{t('eggetarian')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Preferred Location / City</label>
                <input
                  type="text"
                  value={prefData.city}
                  onChange={(e) => setPrefData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Pune, Mumbai, or Any"
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Partner Expectations & Notes</label>
              <textarea
                rows="2"
                maxLength="400"
                value={prefData.notes}
                onChange={(e) => setPrefData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Specific partner values, remarriage considerations, or family expectations..."
                className="w-full px-3.5 py-2.5 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPref}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingPref ? 'Saving...' : 'Save Partner Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: App Installation (PWA) */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-main">
            <Smartphone className="w-5 h-5 text-sky-blue" />
            <h2 className="font-serif font-bold text-main text-lg">App Installation</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-ground border border-main radius-card">
            <div className="flex items-center gap-3">
              <Logo type="app" size="small" />
              <div>
                <p className="font-bold text-xs text-main">
                  {isInstalled ? 'Vadhu Var App Installed' : 'Install Vadhu Var on this Device'}
                </p>
                <p className="text-[11px] text-sub mt-0.5 max-w-md">
                  {isInstalled
                    ? 'You are running the full installed app experience with fast offline caching.'
                    : 'Add to your phone or desktop home screen for one-tap access, notifications, and smooth offline performance.'}
                </p>
              </div>
            </div>

            {!isInstalled && (
              <button
                onClick={triggerInstall}
                className="px-4 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Profile Visibility & Privacy */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-main">
            {isSearchVisible ? <Eye className="w-5 h-5 text-sky-blue" /> : <EyeOff className="w-5 h-5 text-sub" />}
            <h2 className="font-serif font-bold text-main text-lg">{t('profileVisibility')}</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-ground border border-main radius-card">
            <div>
              <p className="font-bold text-xs text-main">
                {isSearchVisible ? t('visibleToAll') : t('hiddenFromSearch')}
              </p>
              <p className="text-[11px] text-sub mt-0.5 max-w-md">
                {isSearchVisible
                  ? 'Your profile is active and discoverable by verified matrimonial candidates.'
                  : 'Your profile is hidden from search results. You can still browse and send interests.'}
              </p>
            </div>

            <button
              onClick={handleToggleVisibility}
              className={`px-4 py-2 radius-btn text-xs font-bold transition-colors ${
                isSearchVisible
                  ? 'bg-surface-card border border-main text-sub hover:text-main'
                  : 'bg-sky-blue text-white'
              }`}
            >
              {isSearchVisible ? 'Hide from Search' : 'Make Profile Visible'}
            </button>
          </div>
        </div>

        {/* Section 4: Language Preference */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-main">
            <Globe className="w-5 h-5 text-sky-blue" />
            <h2 className="font-serif font-bold text-main text-lg">Language Preference</h2>
          </div>

          <div className="flex items-center gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'mr', label: 'मराठी (Marathi)' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-4 py-2 radius-btn text-xs font-medium border transition-colors ${
                  lang === l.code
                    ? 'bg-sky-blue text-white font-bold border-sky-blue shadow-xs'
                    : 'bg-surface-ground border-main text-sub hover:text-main'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Deactivate Account */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-main text-main">
            <ShieldAlert className="w-5 h-5 text-sub" />
            <h2 className="font-serif font-bold text-main text-lg">{t('deactivateAccount')}</h2>
          </div>

          <p className="text-xs text-sub">
            Deactivating your account hides your profile from all search feeds. Your data is preserved so you can reactivate anytime simply by signing back in.
          </p>

          <button
            onClick={handleDeactivateAccount}
            className="px-5 py-2.5 radius-btn bg-surface-ground border border-main text-sub hover:text-main text-xs font-bold transition-colors flex items-center gap-2"
          >
            <UserX className="w-4 h-4" />
            <span>{t('deactivateAccount')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
