import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft, Scale, AlertTriangle, Mail, Users, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TermsOfServicePage = ({ onBack }) => {
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
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
            Terms of Service & Community Agreement
          </h1>
          <p className="text-xs sm:text-sm text-sub mt-1.5 leading-relaxed">
            Effective Date: August 2026 • Vadhu Var Verified Matrimony Platform
          </p>
        </div>

        {/* Overview Box */}
        <div className="p-4 bg-surface-ground radius-btn border border-main text-xs sm:text-sm text-sub leading-relaxed">
          Welcome to <strong>Vadhu Var ("वधू - वर")</strong>. By registering an account, browsing candidate profiles, submitting verification documents, or expressing matrimonial interest, you agree to comply with and be bound by the following Terms of Service.
        </div>

        {/* Section 1: Nature of Service & Matrimonial Facilitation Disclaimer */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">1</span>
            <span>Matrimonial Facilitation Platform (No Guarantee Disclaimer)</span>
          </h2>
          <div className="p-4 bg-surface-ground radius-btn border border-main text-xs sm:text-sm text-sub leading-relaxed space-y-2">
            <p>
              • Vadhu Var is an online technology facilitation platform designed to enable prospective brides, grooms, and their families to discover and connect with verified matrimonial candidates.
            </p>
            <p>
              • <strong>Not a Marriage Guarantee:</strong> Vadhu Var does not guarantee marriage alliances, response rates, proposal acceptances, or future marital compatibility. The platform serves as an introduction medium.
            </p>
          </div>
        </div>

        {/* Section 2: User Responsibility & Due Diligence */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">2</span>
            <span>Independent Due Diligence Required</span>
          </h2>
          <div className="p-4 bg-surface-ground radius-btn border border-main text-xs sm:text-sm text-sub leading-relaxed space-y-2">
            <p>
              • <strong>Scope of Verification Badges:</strong> While Vadhu Var administrators review government identity documents to grant Trust Badges (ID Verified & Fully Verified), these badges confirm identity documentation submitted at the time of registration.
            </p>
            <p>
              • <strong>Personal Verification Responsibility:</strong> Candidates, parents, and guardians are strictly advised and expected to conduct their own independent personal background checks, family references, educational degree verifications, employment inquiries, and medical/horoscope assessments before entering into marriage commitments.
            </p>
          </div>
        </div>

        {/* Section 3: Prohibited Conduct & Zero-Tolerance Policies */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-center font-bold">3</span>
            <span>Prohibited Conduct & Community Safety</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-main">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Financial Solicitations & Scams</span>
              </div>
              <p className="text-sub leading-relaxed">
                Asking for money, wire transfers, investments, travel funds, emergency loans, or dowry demands is strictly prohibited and results in immediate permanent banning and reporting to law enforcement authorities.
              </p>
            </div>

            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-main">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Fake / Impersonation Profiles</span>
              </div>
              <p className="text-sub leading-relaxed">
                Uploading stock photos, celebrity images, fraudulent credentials, false ages, or impersonating other individuals is strictly forbidden.
              </p>
            </div>

            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-main">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Harassment & Inappropriate Content</span>
              </div>
              <p className="text-sub leading-relaxed">
                Sending abusive, sexually explicit, defamatory, or threatening messages will result in immediate profile suspension and permanent blacklisting.
              </p>
            </div>

            <div className="p-4 bg-surface-ground radius-btn border border-main space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-main">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Commercial Agent Usage</span>
              </div>
              <p className="text-sub leading-relaxed">
                Using Vadhu Var for commercial marriage bureau operations, data scraping, mass automated messaging, or advertising products/services is prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Moderation, Reporting & Termination */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-main flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-blue/10 text-sky-blue text-xs flex items-center justify-center font-bold">4</span>
            <span>Moderation & User Reporting</span>
          </h2>
          <p className="text-xs sm:text-sm text-sub leading-relaxed">
            Every candidate card features a dedicated <strong>"Block & Report"</strong> tool. Reported profiles are placed in immediate moderation quarantine. Vadhu Var reserves the unreserved right to deactivate, edit, or permanently terminate any account that violates our safety standards without prior notice.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-main flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sub">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-blue" />
            <span>Terms & Compliance: <strong>legal@vadhu-var.com</strong></span>
          </div>
          <span>Vadhu Var Matrimony Platform • All Rights Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
