import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Briefcase, GraduationCap, FileText, CheckCircle2, ArrowRight, ArrowLeft, Camera, IndianRupee, Crop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import BadgeVerified from '../components/BadgeVerified';
import ImageCropperModal from '../components/ImageCropperModal';
import { compressImage } from '../lib/imageCompressor';

export const ProfileWizardPage = ({ onComplete }) => {
  const { user, profile: existingProfile, saveProfile } = useAuth();
  const { submitVerificationRequest, addOrUpdateProfile } = useData();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  // Image Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    age: 26,
    gender: 'female',
    city: 'Pune',
    state: 'Maharashtra',
    occupation: '', // Optional
    education_level: '', // Optional
    annual_income_lpa: '', // Optional
    height_cm: 165,
    diet: 'veg',
    marital_status: 'never_married',
    family_type: 'nuclear',
    caste: '',
    sub_caste: '',
    bio: '',
    photo_url: '',
    id_document_url: '',
    family_consent_document_url: '',
    career_proof_url: '' // Optional
  });

  useEffect(() => {
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
        photo_url: existingProfile.photo_url || ''
      }));
    } else if (user?.user_metadata?.full_name) {
      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata.full_name
      }));
    }
  }, [existingProfile, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Open Cropper on file pick
  const handlePhotoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawPhotoSrc(event.target.result);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedDataUrl) => {
    try {
      const compressed = await compressImage(croppedDataUrl, 600, 600, 0.85);
      setFormData(prev => ({ ...prev, photo_url: compressed }));
    } catch (err) {
      setFormData(prev => ({ ...prev, photo_url: croppedDataUrl }));
    }
  };

  const handleIdDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
        setFormData(prev => ({ ...prev, id_document_url: compressedDataUrl }));
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
    e.preventDefault();
    setLoading(true);

    try {
      const saved = await saveProfile(formData);
      addOrUpdateProfile(saved);

      const docUrl = formData.id_document_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
      const familyUrl = formData.family_consent_document_url || null;

      await submitVerificationRequest(saved.id, docUrl, familyUrl);

      setSuccessBanner(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const indianStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawPhotoSrc}
        onCropComplete={handleCropComplete}
        onClose={() => setCropperOpen(false)}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 radius-btn bg-surface-ground text-main text-xs font-medium mb-2 border border-main">
          <ShieldCheck className="w-4 h-4 text-sub" />
          <span>{t('brandSubtitle')}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
          {existingProfile ? 'Update Profile' : t('createProfile')}
        </h1>
        <p className="text-xs sm:text-sm text-sub mt-1 max-w-md mx-auto">
          Submit your details and verification documents.
        </p>

        {existingProfile && (
          <div className="mt-3 inline-block">
            <BadgeVerified
              isFullyVerified={existingProfile.is_fully_verified}
              isIdVerified={existingProfile.is_id_verified}
              isProfessionVerified={existingProfile.is_profession_verified}
            />
          </div>
        )}
      </div>

      {successBanner && (
        <div className="mb-6 p-4 radius-card bg-surface-ground border border-main text-main text-sm font-medium flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-sky-blue flex-shrink-0" />
          <div>
            <p className="font-bold">Profile Submitted!</p>
            <p className="text-xs text-sub mt-0.5">
              Your profile has been saved successfully.
            </p>
          </div>
        </div>
      )}

      {/* Steps Bar */}
      <div className="mb-8 flex items-center justify-between relative px-2">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-surface-ground -z-0" />
        {[
          { number: 1, title: 'Basic Details' },
          { number: 2, title: 'Career & Lifestyle' },
          { number: 3, title: 'Culture & Photo' },
          { number: 4, title: 'Verification' }
        ].map((s) => (
          <div key={s.number} className="relative z-10 flex flex-col items-center">
            <button
              onClick={() => setStep(s.number)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === s.number
                  ? 'bg-sky-blue text-white'
                  : step > s.number
                  ? 'bg-surface-ground text-main border border-main'
                  : 'bg-surface-card border border-main text-sub'
              }`}
            >
              {step > s.number ? <CheckCircle2 className="w-4 h-4 text-sub" /> : s.number}
            </button>
            <span className="text-[11px] font-medium text-sub mt-1 hidden sm:block">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <User className="w-5 h-5 text-sub" />
              <span>Step 1: Personal Details</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-sub mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="e.g. Ananya Deshmukh"
                className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">Age *</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  required
                  value={formData.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Gender *</label>
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
                <label className="block text-xs font-medium text-sub mb-1">State *</label>
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
                <label className="block text-xs font-medium text-sub mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Pune, Delhi, Bengaluru..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Height (cm) *</label>
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
                onClick={() => setStep(2)}
                className="px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Next: Career & Lifestyle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-main pb-2 border-b border-main flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sub" />
              <span>Step 2: Career, Education & Income {t('optional')}</span>
            </h2>

            {/* Profession & Education (Completely Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-sub mb-1">Occupation / Profession {t('optional')}</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="e.g. Software Engineer, Doctor, Business..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Education Qualification {t('optional')}</label>
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
              <label className="block text-xs font-medium text-sub mb-1">Annual Income (LPA in Lakhs) {t('optional')}</label>
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
                <label className="block text-xs font-medium text-sub mb-1">Diet *</label>
                <select
                  value={formData.diet}
                  onChange={(e) => handleChange('diet', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Marital Status *</label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => handleChange('marital_status', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                >
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Family Type *</label>
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
                <label className="block text-xs font-medium text-sub mb-1">Caste {t('optional')}</label>
                <input
                  type="text"
                  value={formData.caste}
                  onChange={(e) => handleChange('caste', e.target.value)}
                  placeholder="e.g. Brahmin, Patel, Maratha..."
                  className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-sub mb-1">Sub-Caste {t('optional')}</label>
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
              <label className="block text-xs font-medium text-sub mb-1">Bio (About Me)</label>
              <textarea
                rows="3"
                maxLength="500"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Describe your personality and partner expectations..."
                className="w-full px-3.5 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
              />
            </div>

            {/* Profile Photo Uploader with Integrated Cropper */}
            <div className="p-4 border border-main radius-card bg-surface-ground space-y-3">
              <label className="block text-xs font-semibold text-main">Profile Photo & Cropper</label>
              <div className="flex items-center gap-4">
                {formData.photo_url ? (
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
                <span>Next: Verification Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="p-4 bg-surface-ground border border-main radius-card">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif font-bold text-main text-sm">Verification Documents</h3>
                  <p className="text-xs text-sub mt-0.5">
                    Upload documents to unlock verification trust badges on your profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-main p-4 radius-card space-y-2">
              <div className="flex items-center gap-2 font-medium text-main text-sm">
                <BadgeVerified isIdVerified={true} size="small" />
                <span>1. Government ID Document (Aadhaar / License)</span>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleIdDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main"
              />
            </div>

            <div className="border border-main p-4 radius-card space-y-2">
              <div className="flex items-center gap-2 font-medium text-main text-sm">
                <BadgeVerified isFullyVerified={true} size="small" />
                <span>2. Family Consent Letter {t('optional')}</span>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFamilyDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main"
              />
            </div>

            {/* Optional Career or Education Certificate Upload */}
            <div className="border border-main p-4 radius-card space-y-2">
              <div className="flex items-center gap-2 font-medium text-main text-sm">
                <BadgeVerified isProfessionVerified={true} size="small" />
                <span>3. {t('careerCertificate')} {t('optional')}</span>
              </div>
              <p className="text-xs text-sub">
                {t('careerCertDesc')}
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleCareerDocUpload}
                className="block w-full text-xs text-sub file:py-2 file:px-4 file:radius-btn file:border-0 file:text-xs file:font-medium file:bg-surface-ground file:text-main"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-main">
              <button
                type="button"
                onClick={() => setStep(3)}
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
                <span>{loading ? t('sending') : 'Submit Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileWizardPage;
