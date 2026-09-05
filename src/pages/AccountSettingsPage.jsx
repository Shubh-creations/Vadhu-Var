import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Globe, HeartHandshake, ShieldAlert, CheckCircle2, Save, UserX, ArrowLeft, Download, Smartphone, LogOut } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 radius-btn glass-card border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gold-400" />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text">{t('accountSettings')}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Manage partner preferences, privacy visibility, app installation, and account options.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 radius-card glass-card border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Partner Preferences Editor */}
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <HeartHandshake className="w-5 h-5 text-gold-400" />
            <h2 className="font-serif font-bold gold-gradient-text text-lg">{t('partnerPreferences')}</h2>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            {/* Accepted Marital Status Multi-Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-200">
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
                      className={`px-3 py-2 radius-btn text-xs font-medium border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-zinc-900 border-gold-400 text-gold-300 font-bold shadow-xs'
                          : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:border-gold-400/40'
                      }`}
                    >
                      <span>{status.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Age & Minimum Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Preferred Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_min}
                    onChange={(e) => setPrefData(prev => ({ ...prev, age_min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-white/10 radius-btn text-xs bg-zinc-900 text-white outline-none focus:border-gold-400"
                    placeholder="Min"
                  />
                  <span className="text-xs text-zinc-500 font-bold">to</span>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_max}
                    onChange={(e) => setPrefData(prev => ({ ...prev, age_max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-white/10 radius-btn text-xs bg-zinc-900 text-white outline-none focus:border-gold-400"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Minimum Annual Income (LPA)</label>
                <select
                  value={prefData.min_income_lpa}
                  onChange={(e) => setPrefData(prev => ({ ...prev, min_income_lpa: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/10 radius-btn text-xs bg-zinc-900 text-white outline-none focus:border-gold-400"
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

            {/* Preferred Diet & Preferred Education */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Preferred Diet</label>
                <select
                  value={prefData.diet}
                  onChange={(e) => setPrefData(prev => ({ ...prev, diet: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/10 radius-btn text-xs bg-zinc-900 text-white outline-none focus:border-gold-400"
                >
                  <option value="any">Any Diet</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Preferred Education</label>
                <select
                  value={prefData.education}
                  onChange={(e) => setPrefData(prev => ({ ...prev, education: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/10 radius-btn text-xs bg-zinc-900 text-white outline-none focus:border-gold-400"
                >
                  <option value="any">Any Education Tier</option>
                  <option value="graduate">Graduate / Bachelor's</option>
                  <option value="postgraduate">Post-Graduate / Master's</option>
                  <option value="doctorate">Doctorate / Ph.D.</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPref}
                className="px-6 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPref ? 'Saving...' : 'Save Partner Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: App Installation (PWA) */}
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Smartphone className="w-5 h-5 text-gold-400" />
            <h2 className="font-serif font-bold gold-gradient-text text-lg">App Installation</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/80 border border-white/10 radius-card">
            <div className="flex items-center gap-3">
              <Logo type="app" size="small" />
              <div>
                <p className="font-bold text-xs text-white">
                  {isInstalled ? 'Vadhu Var App Installed' : 'Install Vadhu Var on this Device'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md leading-relaxed">
                  {isInstalled
                    ? 'You are running the full installed app experience with fast offline caching.'
                    : 'Add to your phone or desktop home screen for one-tap access, notifications, and smooth offline performance.'}
                </p>
              </div>
            </div>

            {!isInstalled && (
              <button
                onClick={triggerInstall}
                className="px-4 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Profile Visibility & Privacy */}
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            {isSearchVisible ? <Eye className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-amber-400" />}
            <h2 className="font-serif font-bold gold-gradient-text text-lg">{t('profileVisibility')}</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/80 border border-white/10 radius-card">
            <div>
              <p className="font-bold text-xs text-white">
                {isSearchVisible ? t('visibleToAll') : t('hiddenFromSearch')}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md leading-relaxed">
                {isSearchVisible
                  ? 'Your profile is active and discoverable by verified matrimonial candidates.'
                  : 'Your profile is hidden from search results. You can still browse and send interests.'}
              </p>
            </div>

            <button
              onClick={handleToggleVisibility}
              className={`px-4 py-2 radius-btn text-xs font-bold transition-colors cursor-pointer ${
                isSearchVisible
                  ? 'glass-card border border-white/10 text-zinc-300 hover:text-white'
                  : 'bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950'
              }`}
            >
              {isSearchVisible ? 'Hide from Search' : 'Make Profile Visible'}
            </button>
          </div>
        </div>

        {/* Section 4: Language Preference */}
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Globe className="w-5 h-5 text-gold-400" />
            <h2 className="font-serif font-bold gold-gradient-text text-lg">Language Preference</h2>
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
                className={`px-4 py-2 radius-btn text-xs font-medium border transition-colors cursor-pointer ${
                  lang === l.code
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 font-bold border-gold-400 shadow-md'
                    : 'glass-card border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Sign Out */}
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-white">
            <LogOut className="w-5 h-5 text-rose-400" />
            <h2 className="font-serif font-bold text-white text-lg">{t('signOut')}</h2>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Sign out of your active session on this device. You can sign back in at any time with your registered account.
          </p>

          <button
            onClick={() => {
              logout();
              if (onBack) onBack();
            }}
            className="px-5 py-2.5 radius-btn bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('signOut')}</span>
          </button>
        </div>

        {/* Section 6: Deactivate Account */}
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-white">
            <ShieldAlert className="w-5 h-5 text-zinc-400" />
            <h2 className="font-serif font-bold text-white text-lg">{t('deactivateAccount')}</h2>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Deactivating your account hides your profile from all search feeds. Your data is preserved so you can reactivate anytime simply by signing back in.
          </p>

          <button
            onClick={handleDeactivateAccount}
            className="px-5 py-2.5 radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
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
