import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

export const PrivacyPolicyPage = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-main text-sub font-semibold text-xs sm:text-sm hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back</span>
        </button>
      )}

      <div className="bg-surface-card border border-main rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main">
            Data Privacy & Trust Guarantee
          </h1>
          <p className="text-xs sm:text-sm text-sub mt-1">
            How MH Vadhu-Var protects your personal data, identity documents, and family consent documents.
          </p>
        </div>

        {/* 4 Pillars of Data Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-surface-ground border border-main space-y-2">
            <div className="flex items-center gap-2 font-bold text-main text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Identity Document Security</span>
            </div>
            <p className="text-xs text-sub leading-relaxed">
              Government ID cards (Aadhaar / Driving License) uploaded for identity verification are stored in isolated, private storage buckets accessible exclusively by verified human admins for manual verification review. They are never shared publicly or indexed.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-ground border border-main space-y-2">
            <div className="flex items-center gap-2 font-bold text-main text-sm">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              <span>Photo Privacy & Blur Controls</span>
            </div>
            <p className="text-xs text-sub leading-relaxed">
              You retain full control over your photo visibility. You can keep your profile photos blurred until you explicitly accept a candidate's interest request.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-ground border border-main space-y-2">
            <div className="flex items-center gap-2 font-bold text-main text-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Optional Caste & Sub-Caste Fields</span>
            </div>
            <p className="text-xs text-sub leading-relaxed">
              Caste and Sub-Caste fields are entirely optional and never required. You choose what cultural details you feel comfortable sharing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-ground border border-main space-y-2">
            <div className="flex items-center gap-2 font-bold text-main text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No Commercial Data Selling</span>
            </div>
            <p className="text-xs text-sub leading-relaxed">
              MH Vadhu-Var does not sell user contact info, phone numbers, or personal data to third-party telemarketers or advertisers.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-main text-center text-xs text-sub">
          Have questions about your privacy? Contact our support team at <span className="font-bold text-emerald-600">privacy@mhvadhuvar.com</span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
