import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, User, Briefcase, GraduationCap, FileText, CheckCircle2, ArrowRight, ArrowLeft, Camera, IndianRupee, Crop, AlertCircle, HeartHandshake, Baby, Clock, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabaseClient';
import BadgeVerified from '../components/BadgeVerified';
import ImageCropperModal from '../components/ImageCropperModal';
import { compressImage } from '../lib/imageCompressor';
import { performOcrPreCheck } from '../lib/ocrScanner';

export const ProfileWizardPage = ({ onComplete }) => {
  const { user, profile: existingProfile, partnerPreferences: existingPref, saveProfile, savePartnerPreferences } = useAuth();
  const { submitVerificationRequest, addOrUpdateProfile, refreshProfiles } = useData();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [ocrStatus, setOcrStatus] = useState({ scanning: false, result: null });
  const [successModal, setSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Guard ref: Prevents re-render or auth changes from wiping out user's typed inputs
  const isInitializedRef = useRef(false);

  // Image Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState(null);

  // Profile Form Data
  const [formData, setFormData] = useState({
    full_name: '',
    age: 26,
    gender: 'female',
    city: '',
    state: 'Maharashtra',
    occupation: '', // Optional
    education_level: '', // Optional
    annual_income_lpa: '', // Optional
    height_cm: 165,
    diet: 'veg',
    marital_status: 'never_married',
    has_children: 'no', // Optional
    children_count: '',
    children_living_status: null,
    family_type: 'nuclear',
    caste: '',
    sub_caste: '',
    bio: '',
    photo_url: '',
    id_document_url: '',
    family_consent_document_url: '',
    career_proof_url: '' // Optional
  });

  // Partner Preferences Form Data
  const [prefData, setPrefData] = useState({
    age_min: 21,
    age_max: 35,
    height_min_cm: 150,
    height_max_cm: 190,
    accepted_marital_statuses: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
    diet: 'any',
    min_income_lpa: 'all',
    state: 'any',
    city: '',
    education: 'any',
    notes: ''
  });

  // Seed form data ONLY ONCE on mount to ensure user typing is never lost
  useEffect(() => {
    if (isInitializedRef.current) return;

    if (existingProfile) {
      setFormData(prev => ({
        ...prev,
        ...existingProfile,
        occupation: existingProfile.occupation || '',
        education_level: existingProfile.education_level || '',
        annual_income_lpa: existingProfile.annual_income_lpa || '',
        caste: existingProfile.caste || '',
        sub_caste: existingProfile.sub_caste || '',
        bio: existingProfile.bio || '',
        photo_url: existingProfile.photo_url || '',
        has_children: existingProfile.has_children || 'no',
        children_count: existingProfile.children_count || '',
        children_living_status: existingProfile.children_living_status || 'living_together'
      }));
      isInitializedRef.current = true;
    } else if (user?.user_metadata?.full_name) {
      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata.full_name
      }));
      isInitializedRef.current = true;
    }

    if (existingPref) {
      setPrefData(prev => ({
        ...prev,
        ...existingPref,
        accepted_marital_statuses: existingPref.accepted_marital_statuses || ['never_married', 'divorced', 'widowed', 'awaiting_divorce']
      }));
    }
  }, [existingProfile, existingPref, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePrefChange = (field, value) => {
    setPrefData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaritalStatusToggle = (status) => {
    setPrefData(prev => {
      const current = prev.accepted_marital_statuses || [];
      if (status === 'all') {
        return { ...prev, accepted_marital_statuses: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'] };
      }
      const updated = current.includes(status)
        ? current.filter(s => s !== status)
        : [...current, status];
      return { ...prev, accepted_marital_statuses: updated.length > 0 ? updated : ['never_married'] };
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required.';
    if (!formData.age || formData.age < 18 || formData.age > 80) newErrors.age = 'Age must be between 18 and 80.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (targetStep) => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(targetStep);
  };

  // Open Cropper on file pick with auto-compression for high-res camera photos
  const handlePhotoFileSelect = async (e) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUploading(true);
      try {
        // Auto-compress high-resolution smartphone camera pictures
        const optimizedSrc = await compressImage(file, 1200, 1200, 0.88);
        if (optimizedSrc) {
          setRawPhotoSrc(optimizedSrc);
          setCropperOpen(true);
        } else {
          setPhotoError('Could not process selected image. Please try another photo.');
        }
      } catch (err) {
        console.warn('Photo processing error:', err);
        setPhotoError('Could not read image file. Please try another image.');
      } finally {
        setPhotoUploading(false);
      }
    }
    // Clear input value so selecting the same photo again triggers change
    e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl) => {
    setPhotoUploading(true);
    setPhotoError('');
    try {
      const compressed = await compressImage(croppedDataUrl, 600, 600, 0.82);
      setFormData(prev => ({ ...prev, photo_url: compressed || croppedDataUrl }));
    } catch (err) {
      setFormData(prev => ({ ...prev, photo_url: croppedDataUrl }));
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateStep5 = () => {
    if (!formData.id_document_url) {
      setErrors(prev => ({
        ...prev,
        id_document_url: 'Government ID Document (Aadhaar / Driving License / Voter ID / Passport) is strictly compulsory to submit registration.'
      }));
      return false;
    }
    return true;
  };

  const handleIdDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setOcrStatus({ scanning: true, result: null });
        const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
        setFormData(prev => ({ ...prev, id_document_url: compressedDataUrl }));
        setErrors(prev => {
          const next = { ...prev };
          delete next.id_document_url;
          return next;
        });

        // Run automated OCR pre-check asynchronously
        performOcrPreCheck(compressedDataUrl, {
          fullName: formData.full_name,
          age: formData.age,
          gender: formData.gender
        }).then(result => {
          setOcrStatus({ scanning: false, result });
        }).catch(err => {
          console.warn('OCR error:', err);
          setOcrStatus({ scanning: false, result: null });
        });
      } catch (err) {
        setOcrStatus({ scanning: false, result: null });
        alert('Could not process ID document upload');
      }
    }
  };

  const handleFamilyDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
        setFormData(prev => ({ ...prev, family_consent_document_url: compressedDataUrl }));
      } catch (err) {
        alert('Could not process family consent document');
      }
    }
  };

  const handleCareerDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
        setFormData(prev => ({ ...prev, career_proof_url: compressedDataUrl }));
      } catch (err) {
        alert('Could not process career certificate upload');
      }
    }
  };

  const handleSubmitProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!validateStep5()) {
      setStep(5);
      return;
    }

    setLoading(true);

    try {
      // 1. Save profile to Supabase
      const savedProfile = await saveProfile(formData);
      addOrUpdateProfile(savedProfile);

      // 2. Save partner preferences
      await savePartnerPreferences(prefData);

      // 3. Submit verification request strictly with real uploaded document
      const docUrl = formData.id_document_url;
      const familyUrl = formData.family_consent_document_url || null;
      if (docUrl) {
        await submitVerificationRequest(savedProfile.id, docUrl, familyUrl);
      }

      // 4. Immediately trigger live profiles refresh so profile appears on Discover
      if (refreshProfiles) {
        await refreshProfiles();
      }

      // 5. Send automated profile completion email in background (non-blocking)
      try {
        const candidateEmail = (user?.email || formData.email || '').trim();
        const candidateFullName = (savedProfile.full_name || formData.full_name || user?.user_metadata?.full_name || '').trim();
        if (candidateEmail && candidateFullName && supabase?.functions) {
          supabase.functions.invoke('send-profile-complete-email', {
            body: {
              email: candidateEmail,
              full_name: candidateFullName,
              profile_id: savedProfile.id,
              type: 'profile_completed'
            }
          }).catch(e => console.warn('Background email trigger:', e));
        }
      } catch (emailErr) {
        console.warn('Silent email trigger error:', emailErr);
      }

      setSuccessModal(true);
    } catch (err) {
      alert(`Error saving profile: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const indianStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawPhotoSrc}
        onCropComplete={handleCropComplete}
        onClose={() => setCropperOpen(false)}
      />

      {/* Post-Submission "What Happens Next" Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-surface-card radius-card border border-main max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 radius-btn bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-main">
              {existingProfile?.id || existingProfile?.full_name ? t('profileUpdatedSuccess') : t('profileCreatedSuccess')}
            </h2>

            <div className="p-4 bg-surface-ground radius-card border border-main text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-main">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{t('whatHappensNext')}</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                {t('whatHappensNextDesc')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessModal(false);
                if (onComplete) onComplete();
              }}
              className="w-full py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('startBrowsing')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 radius-btn bg-surface-ground text-main text-xs font-medium mb-2 border border-main">
          <ShieldCheck className="w-4 h-4 text-sub" />
          <span>{t('brandSubtitle')}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
          {existingProfile?.id || existingProfile?.full_name ? t('updateYourProfile') : t('createProfile')}
        </h1>
        <p className="text-xs sm:text-sm text-sub mt-1 max-w-md mx-auto">
          {existingProfile?.id || existingProfile?.full_name
            ? t('updateProfileSubtitle')
            : t('createProfileSubtitle')}
        </p>

        {(existingProfile?.id || existingProfile?.full_name) && (
          <div className="mt-3 inline-block">
            <BadgeVerified
              isFullyVerified={existingProfile.is_fully_verified}
              isIdVerified={existingProfile.is_id_verified}
              isProfessionVerified={existingProfile.is_profession_verified}
              isPending={!existingProfile.is_id_verified}
            />
          </div>
        )}
      </div>

      {/* Step Progress Bar (Step X of 5) */}
      <div className="mb-6 bg-surface-card radius-card border border-main p-4 space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-main">{t('stepOfFive', { step })}</span>
          <span className="text-sub font-medium">{t('percentCompleted', { percent: Math.round((step / 5) * 100) })}</span>
        </div>
        <div className="w-full h-2 bg-surface-ground radius-btn overflow-hidden border border-main">
          <div
            className="h-full bg-sky-blue transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Navigation Bar */}
      <div className="mb-8 relative px-1 sm:px-4">
        {/* Background Step Connector Line (Centered on 36px circles at top-[18px]) */}
        <div className="absolute left-[10%] right-[10%] top-[18px] h-0.5 bg-surface-ground border-t border-main -z-0">
          <div
            className="h-full bg-sky-blue transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>

        {/* Step Circles & Centered Labels */}
        <div className="flex items-start justify-between relative z-10">
          {[
            { number: 1, title: t('step1Title') },
            { number: 2, title: t('step2Title') },
            { number: 3, title: t('step3Title') },
            { number: 4, title: t('step4Title') },
            { number: 5, title: t('step5Title') },
          ].map((s) => (
            <div key={s.number} className="flex-1 flex flex-col items-center text-center max-w-[130px]">
              <button
                type="button"
                onClick={() => handleNextStep(s.number)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  step === s.number
                    ? 'bg-sky-blue text-white ring-4 ring-sky-blue/20 shadow-md scale-105'
                    : step > s.number
                    ? 'bg-surface-card text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/80 font-bold'
                    : 'bg-surface-card border border-main text-sub hover:border-sky-blue hover:text-main'
                }`}
                title={`Step ${s.number}: ${s.title}`}
              >
                {step > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
              </button>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-2 text-center leading-tight transition-colors hidden sm:block px-1 ${
                  step === s.number
                    ? 'text-main font-bold'
                    : step > s.number
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-sub'
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile Active Step Subtitle */}
        <div className="sm:hidden text-center mt-3">
          <span className="text-xs font-bold text-main bg-surface-ground px-3 py-1 radius-btn border border-main inline-block">
            {step}. {[t('step1Title'), t('step2Title'), t('step3Title'), t('step4Title'), t('step5Title')][step - 1]}
          </span>
        </div>
      </div>

      {/* Form Steps Container */}
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <User className="w-5 h-5 text-sub" />
              <span>{t('stepOfFive', { step: 1 })}: {t('step1Title')}</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="e.g. Ananya Deshmukh"
                className={`w-full px-3.5 py-2.5 border radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue ${
                  errors.full_name ? 'border-sky-blue' : 'border-main'
                }`}
              />
              {errors.full_name && (
                <p className="text-[11px] text-sky-blue mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.full_name}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">Age *</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  required
                  value={formData.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 border radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue ${
                    errors.age ? 'border-sky-blue' : 'border-main'
                  }`}
                />
                {errors.age && (
                  <p className="text-[11px] text-sky-blue mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.age}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="female">Bride (Female)</option>
                  <option value="male">Groom (Male)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  {indianStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Pune, Delhi, Bengaluru..."
                  className={`w-full px-3.5 py-2.5 border radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue ${
                    errors.city ? 'border-sky-blue' : 'border-main'
                  }`}
                />
                {errors.city && (
                  <p className="text-[11px] text-sky-blue mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Height (cm) *</label>
                <input
                  type="number"
                  min="120"
                  max="220"
                  required
                  value={formData.height_cm}
                  onChange={(e) => handleChange('height_cm', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => handleNextStep(2)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>{t('nextStep')}: {t('step2Title')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sub" />
              <span>{t('stepOfFive', { step: 2 })}: {t('step2Title')}</span>
            </h2>

            {/* Profession & Education (Explicitly marked Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-main">{t('occupation')}</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
                </div>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="e.g. Software Engineer, Doctor, Business..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-main">{t('educationQualification')}</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
                </div>
                <input
                  type="text"
                  value={formData.education_level}
                  onChange={(e) => handleChange('education_level', e.target.value)}
                  placeholder="e.g. B.Tech, MBA, MBBS..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-main">{t('annualIncomeLpa')}</label>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.annual_income_lpa}
                onChange={(e) => handleChange('annual_income_lpa', e.target.value)}
                placeholder="e.g. 12.5 (for 12.5 Lakhs per year)"
                className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('diet')} *</label>
                <select
                  value={formData.diet}
                  onChange={(e) => handleChange('diet', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="veg">{t('vegetarian')}</option>
                  <option value="non-veg">{t('nonVegetarian')}</option>
                  <option value="eggetarian">{t('eggetarian')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('maritalStatus')} *</label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => handleChange('marital_status', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="never_married">{t('neverMarried')}</option>
                  <option value="divorced">{t('divorced')}</option>
                  <option value="widowed">{t('widowed')}</option>
                  <option value="awaiting_divorce">{t('awaitingDivorce')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('familyType')} *</label>
                <select
                  value={formData.family_type}
                  onChange={(e) => handleChange('family_type', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="nuclear">{t('nuclearFamily')}</option>
                  <option value="joint">{t('jointFamily')}</option>
                </select>
              </div>
            </div>

            {/* Conditional Children / Dependents Section */}
            {formData.marital_status !== 'never_married' && (
              <div className="p-4 radius-card bg-surface-ground border border-main space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-main text-xs font-bold">
                    <Baby className="w-4 h-4 text-sky-blue" />
                    <span>Children / Dependents Details</span>
                  </div>
                  <span className="text-[10px] text-sub bg-surface-card px-1.5 py-0.5 rounded border border-main">Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-sub mb-1">{t('hasChildren')}</label>
                    <select
                      value={formData.has_children}
                      onChange={(e) => handleChange('has_children', e.target.value)}
                      className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-card text-main outline-none"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  {formData.has_children === 'yes' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-sub mb-1">{t('childrenCount')}</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.children_count}
                          onChange={(e) => handleChange('children_count', e.target.value)}
                          placeholder="e.g. 1"
                          className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-card text-main outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-sub mb-1">{t('childrenLivingStatus')}</label>
                        <select
                          value={formData.children_living_status}
                          onChange={(e) => handleChange('children_living_status', e.target.value)}
                          className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-card text-main outline-none"
                        >
                          <option value="living_together">{t('livingTogether')}</option>
                          <option value="living_separately">{t('livingSeparately')}</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 radius-btn border border-main text-sub font-medium text-xs sm:text-sm flex items-center gap-1 hover:bg-surface-ground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Next: Culture & Photo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <FileText className="w-5 h-5 text-sub" />
              <span>{t('stepOfFive', { step: 3 })}: {t('step3Title')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-main">{t('caste')}</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
                </div>
                <input
                  type="text"
                  value={formData.caste}
                  onChange={(e) => handleChange('caste', e.target.value)}
                  placeholder="e.g. Brahmin, Patel, Maratha..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-main">{t('subCaste')}</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
                </div>
                <input
                  type="text"
                  value={formData.sub_caste}
                  onChange={(e) => handleChange('sub_caste', e.target.value)}
                  placeholder="Sub-caste details..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-main">{t('bio')}</label>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
              </div>
              <textarea
                rows="3"
                maxLength="500"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Describe your personality and partner expectations..."
                className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
              />
            </div>

            {/* Profile Photo Uploader with Integrated Cropper & Inline Spinner */}
            <div className="p-4 border border-main radius-card bg-surface-ground space-y-3">
              <label className="block text-xs font-semibold text-main">{t('profilePhotoAndCropper')}</label>
              
              {photoError && (
                <div className="p-2.5 radius-btn bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                {photoUploading ? (
                  <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center text-sky-blue border border-main shadow-xs">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : formData.photo_url ? (
                  <div className="relative group">
                    <img
                      src={formData.photo_url}
                      alt="Cropped Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-sky-blue shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center text-sub border border-main">
                    <Camera className="w-8 h-8 text-sub" />
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <input
                    type="file"
                    id="profile-photo-input"
                    accept="image/*"
                    onChange={handlePhotoFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-photo-input"
                    className="inline-flex items-center gap-2 px-4 py-2 radius-btn bg-sky-blue text-white text-xs font-bold hover:bg-sky-blue/90 cursor-pointer shadow-xs transition-colors"
                  >
                    <Crop className="w-4 h-4" />
                    <span>{formData.photo_url ? t('changePhoto') : t('uploadPhoto')}</span>
                  </label>
                  <p className="text-[11px] text-sub">
                    {t('dragPhotoHint')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 radius-btn border border-main text-sub font-medium text-xs sm:text-sm flex items-center gap-1 hover:bg-surface-ground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backStep')}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>{t('nextStep')}: {t('step4Title')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Partner Expectations & Preferences */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-sky-blue" />
              <span>{t('stepOfFive', { step: 4 })}: {t('step4Title')}</span>
            </h2>

            <p className="text-xs text-sub">
              {t('discoverSubtitleRanked')}
            </p>

            {/* Accepted Marital Status Multi-Select */}
            <div className="space-y-2 p-4 bg-surface-ground border border-main radius-card">
              <label className="block text-xs font-bold text-main">
                {t('acceptedMaritalStatus')}
              </label>
              <p className="text-[11px] text-sub">
                {t('acceptedMaritalStatusDesc')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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
                          ? 'bg-surface-card border-sky-blue text-main font-bold shadow-xs'
                          : 'bg-surface-card/60 border-main text-sub hover:border-sky-blue/50'
                      }`}
                    >
                      <span>{status.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-sky-blue flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Age & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('preferredAgeRange')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_min}
                    onChange={(e) => handlePrefChange('age_min', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                    placeholder={t('minAge')}
                  />
                  <span className="text-xs text-sub font-bold">{t('to')}</span>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_max}
                    onChange={(e) => handlePrefChange('age_max', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                    placeholder={t('maxAge')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('preferredMinIncome')}</label>
                <select
                  value={prefData.min_income_lpa}
                  onChange={(e) => handlePrefChange('min_income_lpa', e.target.value)}
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                >
                  <option value="all">{t('anyIncome')}</option>
                  <option value="2.5">{t('income2_5Plus')}</option>
                  <option value="5">{t('income5Plus')}</option>
                  <option value="10">{t('income10Plus')}</option>
                  <option value="15">{t('income15Plus')}</option>
                  <option value="25">{t('income25Plus')}</option>
                </select>
              </div>
            </div>

            {/* Preferred Diet & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('preferredDiet')}</label>
                <select
                  value={prefData.diet}
                  onChange={(e) => handlePrefChange('diet', e.target.value)}
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                >
                  <option value="any">{t('allDiets')}</option>
                  <option value="veg">{t('vegetarian')}</option>
                  <option value="non-veg">{t('nonVegetarian')}</option>
                  <option value="eggetarian">{t('eggetarian')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">{t('preferredLocation')}</label>
                <input
                  type="text"
                  value={prefData.city}
                  onChange={(e) => handlePrefChange('city', e.target.value)}
                  placeholder={t('cityPlaceholder')}
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-main">{t('partnerNotes')}</label>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
              </div>
              <textarea
                rows="2"
                maxLength="400"
                value={prefData.notes}
                onChange={(e) => handlePrefChange('notes', e.target.value)}
                placeholder="e.g. Looking for a supportive partner with shared values..."
                className="w-full px-3.5 py-2.5 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 radius-btn border border-main text-sub font-medium text-xs sm:text-sm flex items-center gap-1 hover:bg-surface-ground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backStep')}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>{t('nextStep')}: {t('step5Title')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Verification Documents Submission */}
        {step === 5 && (
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="p-4 bg-surface-ground border border-main radius-card">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif font-bold text-main text-sm">{t('stepOfFive', { step: 5 })}: {t('step5Title')}</h3>
                  <p className="text-xs text-sub mt-0.5">
                    {t('governmentIdDocDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className={`border radius-card p-4 space-y-2 transition-colors ${errors.id_document_url ? 'border-rose-500 bg-rose-500/5' : 'border-main'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-main text-sm">
                  <BadgeVerified isIdVerified={true} size="small" />
                  <span>{t('governmentIdDoc')}</span>
                </div>
                <span className="text-[10px] text-white bg-sky-blue px-2 py-0.5 radius-btn font-bold">{t('compulsory')}</span>
              </div>
              <p className="text-xs text-sub">
                {t('governmentIdDocDesc')}
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleIdDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main cursor-pointer"
              />

              {/* Live Automated OCR Pre-Check Status */}
              {ocrStatus.scanning && (
                <div className="p-3 bg-sky-blue/10 border border-sky-blue/30 radius-btn flex items-center gap-2.5 text-xs text-sky-blue animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Running automated AI OCR pre-check on document...</span>
                </div>
              )}

              {ocrStatus.result && (
                <div className={`p-3 radius-btn border text-xs space-y-1.5 ${
                  ocrStatus.result.status === 'verified_match'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-blue" />
                      <span>AI OCR Pre-Check: {ocrStatus.result.docType}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 radius-btn bg-surface-ground border border-main">
                      {ocrStatus.result.nameMatchConfidence}% Name Match
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {ocrStatus.result.status === 'verified_match'
                      ? `✓ High-trust document match detected for candidate. Ready for instant admin verification.`
                      : `ℹ️ Document attached. Admin will cross-verify profile details with the submitted document.`}
                  </p>
                </div>
              )}

              {formData.id_document_url && !ocrStatus.scanning && !ocrStatus.result && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('attachedSuccess')}</span>
                </p>
              )}
              {errors.id_document_url && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.id_document_url}</span>
                </p>
              )}
            </div>

            <div className="border border-main p-4 radius-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-main text-sm">
                  <BadgeVerified isFullyVerified={true} size="small" />
                  <span>{t('familyConsentLetter')}</span>
                </div>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
              </div>
              <p className="text-xs text-sub">
                {t('familyConsentLetterDesc')}
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFamilyDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main cursor-pointer"
              />
              {formData.family_consent_document_url && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('attachedSuccess')}</span>
                </p>
              )}
            </div>

            <div className="border border-main p-4 radius-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-main text-sm">
                  <BadgeVerified isProfessionVerified={true} size="small" />
                  <span>3. {t('careerCertificate')}</span>
                </div>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">{t('optional')}</span>
              </div>
              <p className="text-xs text-sub">
                {t('careerCertDesc')}
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleCareerDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main cursor-pointer"
              />
              {formData.career_proof_url && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('attachedSuccess')}</span>
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-main">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 radius-btn border border-main text-sub font-medium text-xs sm:text-sm flex items-center gap-1 hover:bg-surface-ground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backStep')}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {loading
                    ? t('sending')
                    : existingProfile?.id || existingProfile?.full_name
                    ? t('saveChangesAndUpdate')
                    : t('createProfile')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileWizardPage;
