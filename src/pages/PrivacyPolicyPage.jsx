import React from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, FileText, ArrowLeft, CheckCircle2, UserCheck, Trash2, Mail, Server } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyPage = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 radius-btn bg-surface-card border border-main text-sub hover:text-main font-semibold text-xs transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-sky-blue" />
          <span>Back to Platform</span>
        </button>
      )}

      <div className="bg-surface-card border border-main radius-card p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 radius-btn bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-sub mt-1.5 leading-relaxed">
            Effective Date: August 2026 • Vadhu Var Verified Matrimony Platform
          </p>
        </div>

        {/* Introduction */}
        <div className="p-4 bg-surface-ground radius-btn border border-main text-xs sm:text-sm text-sub leading-relaxed">
          At <strong>Vadhu Var ("वधू - वर")</strong>, we treat your personal privacy, matrimonial choices, and government identity documents with the highest degree of security and confidentiality. This Privacy Policy outlines how your data is collected, stored, encrypted, and accessed.
        </div>

        {/* Section 1: Information We Collect */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">1</span>
            <span>Information We Collect</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <h3 className="font-bold text-main text-xs">Candidate Profile Data</h3>
              <p className="text-sub leading-relaxed">
                Full name, age, date of birth, gender, height, current city, state, diet preference, marital status, children status, occupation, education level, annual income bracket, and personal bio.
              </p>
            </div>

            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <h3 className="font-bold text-main text-xs">Cultural & Family Details (Optional)</h3>
              <p className="text-sub leading-relaxed">
                Caste, sub-caste, and family type (nuclear/joint). These fields are completely optional and shared solely at the candidate's discretion.
              </p>
            </div>

            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <h3 className="font-bold text-main text-xs">Verification Documents</h3>
              <p className="text-sub leading-relaxed">
                Government-issued photo identification (Aadhaar Card, Voter ID, Passport, or Driving License), optional family consent certificates, and career/employment credentials.
              </p>
            </div>

            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <h3 className="font-bold text-main text-xs">Partner Preferences</h3>
              <p className="text-sub leading-relaxed">
                Desired age range, height range, accepted marital backgrounds, location preferences, and diet preferences used to compute your 100-Point Match Compatibility Index.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Why We Collect Your Data */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">2</span>
            <span>Purpose & Use of Data</span>
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-sub leading-relaxed pl-2">
            <li>To create and display your matrimonial candidate profile to other verified members on Vadhu Var.</li>
            <li>To compute weighted 100-Point Match Compatibility scores against candidate preferences.</li>
            <li>To verify identity authenticity and grant genuine Trust Badges (ID Verified & Fully Verified).</li>
            <li>To enable secure, mutual interest requests and proposal communications between matching candidates.</li>
            <li>To detect, prevent, and moderate fraudulent accounts, financial solicitations, and spam.</li>
          </ul>
        </div>

        {/* Section 3: Document Security & Storage */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">3</span>
            <span>Document Security & Access Control</span>
          </h2>
          <div className="p-5 bg-surface-ground radius-btn border border-main space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-sky-blue flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-main block">Strict Role-Based Admin-Only Document Access</strong>
                <p className="text-sub mt-1 leading-relaxed">
                  Government ID documents (Aadhaar / Voter ID / Passport) are stored in secure, private encrypted cloud storage buckets. <strong>They are never visible to other candidates or indexed on search engines.</strong> Only the two authorized system administrators have access to view verification documents for the sole purpose of approving Trust Badges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-main">
              <Server className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-main block">No Commercial Data Selling</strong>
                <p className="text-sub mt-1 leading-relaxed">
                  Vadhu Var does not sell, rent, or lease user personal contact details, email addresses, or phone numbers to third-party telemarketers, advertisers, or loan agencies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Your Rights & Account Deletion */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">4</span>
            <span>Your Rights, Privacy Controls & Data Deletion</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-sub leading-relaxed">
            <p>
              • <strong>Profile Visibility Controls:</strong> You can toggle your profile visibility at any time from your Profile Hub to hide your card from all search feeds.
            </p>
            <p>
              • <strong>Account Deactivation:</strong> You can deactivate your account temporarily, preserving your data while remaining completely invisible.
            </p>
            <p>
              • <strong>Right to Erasure (Permanent Data Deletion):</strong> You may request complete, irreversible deletion of your profile, verification documents, and active session data by emailing our Data Protection Officer at <span className="font-bold text-main">privacy@vadhu-var.com</span>. All associated records are permanently purged from database tables and storage within 7 business days.
            </p>
          </div>
        </div>

        {/* Support Contact Footer */}
        <div className="pt-6 border-t border-main flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sub">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-blue" />
            <span>Privacy Inquiries: <strong>privacy@vadhu-var.com</strong></span>
          </div>
          <span>Vadhu Var Matrimony Platform • All Rights Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
