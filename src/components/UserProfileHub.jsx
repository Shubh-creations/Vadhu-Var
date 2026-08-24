import React, { useState, useRef } from 'react';
import { 
  User, Pencil, ShieldCheck, HeartHandshake, Eye, EyeOff, Globe, 
  Download, LogOut, UserX, ArrowLeft, CheckCircle2, Sparkles, MapPin, 
  Briefcase, IndianRupee, ShieldAlert, Smartphone, ChevronRight, Share2, HelpCircle, FileText, Trash2,
  Camera, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { usePWA } from '../context/PWAContext';
import BadgeVerified from './BadgeVerified';
import ProfileWizardPage from '../pages/ProfileWizardPage';
import ProfileCompletenessCard from './ProfileCompletenessCard';
import ShareProfileModal from './ShareProfileModal';
import DeleteAccountModal from './DeleteAccountModal';
import CandidateAvatar from './CandidateAvatar';
import ImageCropperModal from './ImageCropperModal';
import compressImage from '../lib/imageCompressor';

export const UserProfileHub = ({ onNavigateToDiscover, onOpenHelp, onOpenTerms, onNavigateHome }) => {
  const { user, profile, saveProfile, partnerPreferences, savePartnerPreferences, updateAccountSettings, logout } = useAuth();
  const { refreshProfiles } = useData();
  const { lang, setLang, t } = useLanguage();
  const { isInstalled, triggerInstall } = usePWA();

  const fileInputRef = useRef(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [isEditingWizard, setIsEditingWizard] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(
    profile?.is_visible !== undefined ? profile.is_visible !== false : profile?.is_search_visible !== false
  );
  const [successMsg, setSuccessMsg] = useState('');

  // If user has no saved profile, show the wizard directly
  if (!profile || !profile.full_name) {
    return (
      <div>
        <div className="max-w-3xl mx-auto px-4 pt-4 flex justify-between items-center">
          <button
            onClick={onNavigateToDiscover}
            className="text-xs text-sub hover:text-main flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToMatches')}</span>
          </button>
          <button
            onClick={logout}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('signOut')}</span>
          </button>
        </div>
        <ProfileWizardPage onComplete={() => setIsEditingWizard(false)} />
      </div>
    );
  }

  // If user clicked "Update Profile", show the wizard with a return button
  if (isEditingWizard) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 pt-6 flex items-center justify-between">
          <button
            onClick={() => setIsEditingWizard(false)}
            className="px-4 py-2 radius-btn bg-surface-ground border border-main text-main hover:bg-surface-card text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile Hub</span>
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 radius-btn text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('signOut')}</span>
          </button>
        </div>
        <ProfileWizardPage onComplete={() => setIsEditingWizard(false)} />
      </div>
    );
  }

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      try {
        const optimized = await compressImage(file, 1200, 1200, 0.88);
        if (optimized) {
          setRawPhotoSrc(optimized);
          setCropperOpen(true);
        } else {
          alert('Could not process selected image. Please try another photo.');
        }
      } catch (err) {
        console.warn('Avatar photo load error:', err);
        alert('Could not process photo. Please try another image.');
      } finally {
        setUploadingPhoto(false);
      }
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl) => {
    setUploadingPhoto(true);
    try {
      const finalPhoto = await compressImage(croppedDataUrl, 600, 600, 0.82) || croppedDataUrl;
      const updated = await saveProfile({
        ...profile,
        photo_url: finalPhoto
      });
      if (refreshProfiles) {
        await refreshProfiles();
      }
      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Error saving photo:', err);
      alert('Failed to save profile photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleToggleVisibility = async () => {
    const nextVal = !isSearchVisible;
    setIsSearchVisible(nextVal);
    try {
      await updateAccountSettings({ is_visible: nextVal, is_search_visible: nextVal });
      setSuccessMsg(nextVal ? 'Profile is now visible to verified members' : 'Profile is now hidden from search feeds');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error updating visibility');
      setIsSearchVisible(!nextVal);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmDeactivate = window.confirm(
      'Are you sure you want to deactivate your account? Your profile will be hidden from discovery. You can reactivate anytime by logging back in.'
    );
    if (!confirmDeactivate) return;

    try {
      await updateAccountSettings({ is_active: false, is_visible: false });
      alert('Account deactivated. You will now be signed out.');
      logout();
    } catch (err) {
      alert('Error deactivating account');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 radius-card bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Candidate Card Overview */}
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar / Photo with Direct 1-Click Upload Button */}
          <div className="relative group">
            <CandidateAvatar
              src={profile.photo_url}
              name={profile.full_name}
              size="xl"
              shape="circle"
              showNoPhotoText={true}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-sky-blue hover:bg-sky-blue/90 text-white shadow-md border-2 border-surface-card transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
              title="Upload or change profile photo"
              aria-label="Upload profile photo"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
          </div>

          {/* Profile Details & Badges */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-serif text-2xl font-bold text-main">{profile.full_name}</h1>
                <p className="text-xs text-sub mt-0.5">
                  {profile.age} Yrs • {profile.city || 'Pune'}, {profile.state || 'Maharashtra'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="px-4 py-2.5 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-main hover:text-sky-blue font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  title="Share Bio-Data Card"
                >
                  <Share2 className="w-4 h-4 text-sky-blue" />
                  <span>Share Bio-Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingWizard(true)}
                  className="px-5 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Pencil className="w-4 h-4" />
                  <span>{t('updateYourProfile')}</span>
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <BadgeVerified
                profile={profile}
                size="normal"
              />
            </div>

            {/* Quick Meta Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
              <div className="bg-surface-ground p-2.5 radius-btn border border-main">
                <span className="text-sub block text-[10px]">Profession</span>
                <span className="font-bold text-main truncate block">{profile.occupation || 'Not Specified'}</span>
              </div>
              <div className="bg-surface-ground p-2.5 radius-btn border border-main">
                <span className="text-sub block text-[10px]">Education</span>
                <span className="font-bold text-main truncate block">{profile.education_level || 'Not Specified'}</span>
              </div>
              <div className="bg-surface-ground p-2.5 radius-btn border border-main">
                <span className="text-sub block text-[10px]">Diet</span>
                <span className="font-bold text-main capitalize block">{profile.diet || 'Veg'}</span>
              </div>
              <div className="bg-surface-ground p-2.5 radius-btn border border-main">
                <span className="text-sub block text-[10px]">Marital Status</span>
                <span className="font-bold text-main capitalize block">
                  {profile.marital_status ? profile.marital_status.replace('_', ' ') : 'Never Married'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Profile Completeness Indicator Card */}
      <ProfileCompletenessCard
        profile={profile}
        partnerPreferences={partnerPreferences}
        onUpdateProfile={() => setIsEditingWizard(true)}
      />

      {/* Merged Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Visibility Toggle */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-main">
              {isSearchVisible ? <Eye className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5 text-amber-500" />}
              <h2 className="font-serif font-bold text-main text-base">{t('profileVisibility')}</h2>
            </div>
            <p className="text-xs text-sub mt-3">
              {isSearchVisible
                ? 'Your profile is active and discoverable by verified candidates on Vadhu Var.'
                : 'Your profile is currently hidden from search feeds. Only candidates you express interest in can view you.'}
            </p>
          </div>

          <button
            onClick={handleToggleVisibility}
            className={`w-full py-2.5 px-4 radius-btn text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              isSearchVisible
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isSearchVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isSearchVisible ? t('hiddenFromSearch') : t('visibleToAll')}</span>
          </button>
        </div>

        {/* Language Preference */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-main">
              <Globe className="w-5 h-5 text-sky-blue" />
              <h2 className="font-serif font-bold text-main text-base">Language / भाषा / भाषा निवडा</h2>
            </div>
            <p className="text-xs text-sub mt-3">
              Select your preferred application language for matching, filters, and notifications:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'mr', label: 'मराठी' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`py-2 px-3 radius-btn text-xs font-bold border transition-colors ${
                  lang === l.code
                    ? 'bg-sky-blue text-white border-sky-blue shadow-xs'
                    : 'bg-surface-ground border-main text-sub hover:text-main'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Install Vadhu Var App (PWA) */}
        {!isInstalled && (
          <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4 md:col-span-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-main text-sm">{t('installVadhuVarApp')}</h3>
                  <p className="text-xs text-sub">Install on your phone home screen for instant proposal alerts and offline access.</p>
                </div>
              </div>
              <button
                onClick={triggerInstall}
                className="px-5 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs flex items-center gap-2 shadow-xs flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{t('installApp')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Prominent Sign Out Section */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-main">
            <LogOut className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif font-bold text-main text-base">{t('signOut')}</h2>
          </div>
          <p className="text-xs text-sub">
            Sign out of your active session on this device. You can sign back in anytime.
          </p>
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 radius-btn bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('signOut')}</span>
          </button>
        </div>

        {/* Help & Support & Legal Links */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-main text-main">
            <HelpCircle className="w-5 h-5 text-sky-blue" />
            <h2 className="font-serif font-bold text-main text-base">Help & Legal</h2>
          </div>
          <div className="space-y-2">
            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="w-full p-2.5 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-left text-xs font-semibold text-main flex items-center justify-between transition-colors"
              >
                <span>Help Center & Verification FAQs</span>
                <ChevronRight className="w-4 h-4 text-sub" />
              </button>
            )}
            {onOpenTerms && (
              <button
                type="button"
                onClick={onOpenTerms}
                className="w-full p-2.5 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-left text-xs font-semibold text-main flex items-center justify-between transition-colors"
              >
                <span>Terms of Service & Due Diligence</span>
                <ChevronRight className="w-4 h-4 text-sub" />
              </button>
            )}
          </div>
        </div>

        {/* Danger Zone: Permanent Account & Data Deletion */}
        <div className="bg-surface-card radius-card border border-rose-500/30 p-6 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-rose-500/20 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
            <h2 className="font-serif font-bold text-base">Danger Zone — Delete Account & Data</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-sub leading-relaxed">
                Permanently deletes your matrimonial profile, uploaded photos, and government ID verification documents, and closes your account.
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                Warning: This action is irreversible.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="px-5 py-2.5 radius-btn bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Profile Card Modal */}
      <ShareProfileModal
        profile={profile}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Direct Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawPhotoSrc}
        onCropComplete={handleCropComplete}
        onClose={() => setCropperOpen(false)}
      />

      {/* Delete Account & Data Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={() => {
          setDeleteModalOpen(false);
          if (onNavigateHome) {
            onNavigateHome();
          } else {
            window.location.reload();
          }
        }}
      />
    </div>
  );
};

export default UserProfileHub;
