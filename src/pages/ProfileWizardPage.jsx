import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, User, Briefcase, GraduationCap, FileText, CheckCircle2, ArrowRight, ArrowLeft, Camera, IndianRupee, Crop, AlertCircle, HeartHandshake, Baby, Clock, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import BadgeVerified from '../components/BadgeVerified';
import ImageCropperModal from '../components/ImageCropperModal';
import { compressImage } from '../lib/imageCompressor';

export const ProfileWizardPage = ({ onComplete }) => {
  const { user, profile: existingProfile, partnerPreferences: existingPref, saveProfile, savePartnerPreferences } = useAuth();
  const { submitVerificationRequest, addOrUpdateProfile, refreshProfiles } = useData();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
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
    children_living_status: 'living_together',
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

  // Open Cropper on file pick without submitting form or resetting step
  const handlePhotoFileSelect = (e) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Image file is too large (max 10MB). Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawPhotoSrc(event.target.result);
        setCropperOpen(true);
      };
      reader.onerror = () => {
        setPhotoError('Could not read image file. Please try another image.');
      };
      reader.readAsDataURL(file);
    }
    // Clear input value so selecting the same photo again triggers change
    e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl) => {
    setPhotoUploading(true);
    setPhotoError('');
    try {
      const compressed = await compressImage(croppedDataUrl, 600, 600, 0.85);
      setFormData(prev => ({ ...prev, photo_url: compressed }));
    } catch (err) {
      setFormData(prev => ({ ...prev, photo_url: croppedDataUrl }));
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateStep5 = () => {
    if (!formData.id_document_url && !existingProfile?.is_id_verified) {
      setErrors(prev => ({
        ...prev,
        id_document_url: 'Government ID Document (Aadhaar / Driving License / Voter ID) is required to complete registration.'
      }));
      return false;
    }
    return true;
  };

  const handleIdDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
        setFormData(prev => ({ ...prev, id_document_url: compressedDataUrl }));
        if (errors.id_document_url) {
          setErrors(prev => ({ ...prev, id_document_url: null }));
        }
      } catch (err) {
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

      // 3. Submit verification request with compulsory ID and optional family doc
      const docUrl = formData.id_document_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
      const familyUrl = formData.family_consent_document_url || null;
      await submitVerificationRequest(savedProfile.id, docUrl, familyUrl);

      // 4. Immediately trigger live profiles refresh so profile appears on Discover
      if (refreshProfiles) {
        await refreshProfiles();
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
              Profile Saved Successfully!
            </h2>

            <div className="p-4 bg-surface-ground radius-card border border-main text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-main">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>What Happens Next?</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                Your profile is now live. Our team is reviewing your verification documents. <strong>You don't need to wait</strong> — you can start browsing verified matches, saving shortlists, and expressing interest immediately!
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
              <span>Start Browsing Matches</span>
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
          {existingProfile ? 'Update Profile & Preferences' : t('createProfile')}
        </h1>
        <p className="text-xs sm:text-sm text-sub mt-1 max-w-md mx-auto">
          Submit your candidate info, partner expectations, and verification proof.
        </p>

        {existingProfile && (
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
          <span className="font-bold text-main">Step {step} of 5</span>
          <span className="text-sub font-medium">{Math.round((step / 5) * 100)}% Completed</span>
        </div>
        <div className="w-full h-2 bg-surface-ground radius-btn overflow-hidden border border-main">
          <div
            className="h-full bg-sky-blue transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Navigation Bar */}
      <div className="mb-8 flex items-center justify-between relative px-2">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-surface-ground -z-0" />
        {[
          { number: 1, title: 'Basic Info' },
          { number: 2, title: 'Career & Life' },
          { number: 3, title: 'Culture & Photo' },
          { number: 4, title: 'Partner Prefs' },
          { number: 5, title: 'Verification' }
        ].map((s) => (
          <div key={s.number} className="relative z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={() => handleNextStep(s.number)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === s.number
                  ? 'bg-sky-blue text-white shadow-xs'
                  : step > s.number
                  ? 'bg-surface-ground text-main border border-main'
                  : 'bg-surface-card border border-main text-sub'
              }`}
            >
              {step > s.number ? <CheckCircle2 className="w-4 h-4 text-sub" /> : s.number}
            </button>
            <span className="text-[10px] font-medium text-sub mt-1 hidden sm:block">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Steps Container */}
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <User className="w-5 h-5 text-sub" />
              <span>Step 1: Personal Details</span>
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
                <span>Next: Career & Lifestyle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sub" />
              <span>Step 2: Career, Education & Lifestyle</span>
            </h2>

            {/* Profession & Education (Explicitly marked Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-main">Occupation / Profession</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
                  <label className="text-xs font-semibold text-main">Education Qualification</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
                <label className="text-xs font-semibold text-main">Annual Income (LPA in Lakhs)</label>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
                <label className="block text-xs font-semibold text-main mb-1">Diet *</label>
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
                <label className="block text-xs font-semibold text-main mb-1">Marital Status *</label>
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
                <label className="block text-xs font-semibold text-main mb-1">Family Type *</label>
                <select
                  value={formData.family_type}
                  onChange={(e) => handleChange('family_type', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="nuclear">Nuclear Family</option>
                  <option value="joint">Joint Family</option>
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
              <span>Step 3: Cultural Background & Profile Photo</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-main">Caste</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
                  <label className="text-xs font-semibold text-main">Sub-Caste</label>
                  <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
                <label className="text-xs font-semibold text-main">Bio (About Me)</label>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
              <label className="block text-xs font-semibold text-main">Profile Photo & Cropper</label>
              
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
                    <span>{formData.photo_url ? 'Re-crop / Change Photo' : 'Upload & Crop Photo'}</span>
                  </label>
                  <p className="text-[11px] text-sub">
                    Upload an image to open the crop, zoom, and rotate editor.
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
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Next: Partner Preferences</span>
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
              <span>Step 4: Partner Expectations & Remarriage Preferences</span>
            </h2>

            <p className="text-xs text-sub">
              Define what you are looking for in a partner. These will personalize your match recommendations and compatibility scores.
            </p>

            {/* Accepted Marital Status Multi-Select */}
            <div className="space-y-2 p-4 bg-surface-ground border border-main radius-card">
              <label className="block text-xs font-bold text-main">
                {t('acceptedMaritalStatus')}
              </label>
              <p className="text-[11px] text-sub">
                Select relationship backgrounds you are open to connecting with:
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
                <label className="block text-xs font-semibold text-main mb-1">Preferred Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_min}
                    onChange={(e) => handlePrefChange('age_min', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                    placeholder="Min"
                  />
                  <span className="text-xs text-sub font-bold">to</span>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefData.age_max}
                    onChange={(e) => handlePrefChange('age_max', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Preferred Minimum Income (LPA)</label>
                <select
                  value={prefData.min_income_lpa}
                  onChange={(e) => handlePrefChange('min_income_lpa', e.target.value)}
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

            {/* Preferred Diet & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">Preferred Diet</label>
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
                <label className="block text-xs font-semibold text-main mb-1">Preferred Location / City</label>
                <input
                  type="text"
                  value={prefData.city}
                  onChange={(e) => handlePrefChange('city', e.target.value)}
                  placeholder="e.g. Pune, Mumbai, or Any"
                  className="w-full px-3 py-2 border border-main radius-btn text-xs bg-surface-ground text-main outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-main">Partner Expectations & Notes</label>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
              </div>
              <textarea
                rows="2"
                maxLength="400"
                value={prefData.notes}
                onChange={(e) => handlePrefChange('notes', e.target.value)}
                placeholder="e.g. Looking for a supportive partner with shared values, open to remarriage..."
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
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Next: Verification Proof</span>
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
                  <h3 className="font-serif font-bold text-main text-sm">Step 5: Verification Documents</h3>
                  <p className="text-xs text-sub mt-0.5">
                    Upload documents to unlock green verified trust badges on your candidate profile.
                  </p>
                </div>
              </div>
            </div>

            <div className={`border radius-card p-4 space-y-2 transition-colors ${errors.id_document_url ? 'border-rose-500 bg-rose-500/5' : 'border-main'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-main text-sm">
                  <BadgeVerified isIdVerified={true} size="small" />
                  <span>1. Government ID Document (Aadhaar / License / Voter ID)</span>
                </div>
                <span className="text-[10px] text-white bg-sky-blue px-2 py-0.5 radius-btn font-bold">Compulsory *</span>
              </div>
              <p className="text-xs text-sub">
                Upload your official photo ID to verify your profile authenticity and earn the ID Verified badge.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleIdDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main cursor-pointer"
              />
              {formData.id_document_url && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Government ID document attached successfully</span>
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
                  <span>2. Family Consent Letter</span>
                </div>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
              </div>
              <p className="text-xs text-sub">
                Optional document signed by family or parents for 100% Fully Verified trust badge.
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
                  <span>Family consent document attached</span>
                </p>
              )}
            </div>

            <div className="border border-main p-4 radius-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-main text-sm">
                  <BadgeVerified isProfessionVerified={true} size="small" />
                  <span>3. {t('careerCertificate')}</span>
                </div>
                <span className="text-[10px] text-sub bg-surface-ground px-1.5 py-0.5 rounded border border-main">Optional</span>
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
                  <span>Career certificate attached</span>
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
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? t('sending') : 'Submit Profile & Preferences'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileWizardPage;
