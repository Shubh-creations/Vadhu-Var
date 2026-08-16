import React, { useState } from 'react';
import { 
  HelpCircle, ShieldCheck, Sparkles, Pencil, ShieldAlert, 
  Trash2, Mail, ChevronDown, ChevronUp, ArrowLeft, CheckCircle2, Award, HeartHandshake, PhoneCall
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HelpPage = ({ onBack }) => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqList = [
    {
      id: 'badges',
      icon: Award,
      title: "What do the Verification Badges mean?",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-sub leading-relaxed">
          <p>
            Vadhu Var enforces strict trust standards to eliminate fake accounts and matrimonial scams:
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-surface-ground radius-btn border border-main">
              <strong className="text-emerald-600 dark:text-emerald-400 block text-xs">✓ ID Verified Badge (Compulsory)</strong>
              <span>Granted after human administrators manually cross-verify a government-issued photo ID (Aadhaar Card, Voter ID, Passport, or Driving License).</span>
            </div>
            <div className="p-3 bg-surface-ground radius-btn border border-main">
              <strong className="text-emerald-600 dark:text-emerald-400 block text-xs">★ 100% Fully Verified Badge</strong>
              <span>Awarded to high-trust profiles who have submitted both government identity verification and family consent/parent verification documents.</span>
            </div>
            <div className="p-3 bg-surface-ground radius-btn border border-main">
              <strong className="text-sky-blue block text-xs">💼 Profession / Career Verified Badge</strong>
              <span>Awarded when candidates upload proof of education (degree certificate) or career credentials (corporate ID / salary slip).</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'match_score',
      icon: Sparkles,
      title: "How does the 100-Point Match Compatibility Score work?",
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-sub leading-relaxed">
          <p>
            The Match Compatibility percentage is calculated using a 100-point weighted preference algorithm comparing candidate attributes against your saved partner criteria:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Marital Status Alignment (25 Pts):</strong> Full match if candidate status is in your accepted list.</li>
            <li><strong>Age Preference (20 Pts):</strong> Full match if within your configured minimum and maximum age range.</li>
            <li><strong>Location & City (15 Pts):</strong> Points awarded for matching state or preferred city.</li>
            <li><strong>Dietary Lifestyle (15 Pts):</strong> Full match for compatible diet (Vegetarian, Jain, Eggetarian, Non-Veg).</li>
            <li><strong>Height Range (15 Pts):</strong> Match based on candidate height in centimeters.</li>
            <li><strong>Education & Career (10 Pts):</strong> Alignment with preferred education tier.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'edit_profile',
      icon: Pencil,
      title: "How do I edit my profile details or reposition my photo?",
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-sub leading-relaxed">
          <p>
            1. Tap <strong>"My Profile"</strong> in the bottom navigation bar or click your avatar at the top right.
          </p>
          <p>
            2. Click the <strong>"Update Profile"</strong> button to open the 5-step wizard.
          </p>
          <p>
            3. In Step 1, click the camera icon to upload a new photo, or use the <strong>Center 🎯</strong> and directional arrows (←, ↑, ↓, →) to position your face in the circular frame.
          </p>
          <p>
            4. Complete all steps and tap <strong>"Save Changes & Update Profile"</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'reporting',
      icon: ShieldAlert,
      title: "How do I report a fake profile, harassment, or financial scam?",
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-sub leading-relaxed">
          <p>
            Vadhu Var maintains a zero-tolerance policy against monetary requests, dowry demands, fake photos, and abusive language:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Open the candidate's profile or chat screen and click the <strong>Shield / Report</strong> icon.</li>
            <li>Select the category (Fake Profile, Financial Solicitation, Inappropriate Content, or Commercial Agent).</li>
            <li>Submit the report. The candidate is immediately hidden from your feeds, and their profile is flagged for urgent admin moderation review.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'deactivate',
      icon: Trash2,
      title: "How do I hide my profile or delete my account?",
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-sub leading-relaxed">
          <p>
            • <strong>Hide from Search Feeds:</strong> In your Profile Hub, toggle <strong>"Profile Visibility"</strong> to "Hidden from Search". Only candidates you explicitly message can view your card.
          </p>
          <p>
            • <strong>Deactivate Account:</strong> Scroll down in your Profile Hub and click <strong>"Deactivate Account"</strong>.
          </p>
          <p>
            • <strong>Permanent Data Erasure:</strong> To permanently delete your profile, documents, and account credentials, email <span className="font-bold text-sky-blue">privacy@vadhu-var.com</span> and our team will erase all data within 7 business days.
          </p>
        </div>
      )
    },
    {
      id: 'contact',
      icon: Mail,
      title: "How can I contact the Vadhu Var Support Team?",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-sub leading-relaxed">
          <p>
            Our dedicated matrimonial support team is available 7 days a week to assist you with profile verification, account inquiries, or technical support:
          </p>
          <div className="p-4 bg-surface-ground radius-btn border border-main space-y-2">
            <div className="flex items-center gap-2 text-main font-bold">
              <Mail className="w-4 h-4 text-sky-blue" />
              <span>Email Support: support@vadhu-var.com</span>
            </div>
            <p className="text-xs text-sub">
              Typical response time: Under 4 hours during business hours (9:00 AM – 8:00 PM IST).
            </p>
          </div>
        </div>
      )
    }
  ];

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
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
            Help Center & Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-sub mt-1.5 leading-relaxed">
            Everything you need to know about verification badges, match compatibility, privacy, and safety.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqList.map((faq, idx) => {
            const Icon = faq.icon;
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.id}
                className="bg-surface-ground radius-card border border-main overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-main text-sm sm:text-base hover:bg-main/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-sky-blue flex-shrink-0" />
                    <span>{faq.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sub flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-sub flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-main/60 animate-fade-in">
                    {faq.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="p-6 radius-card bg-sky-blue/10 border border-sky-blue/20 text-center space-y-3">
          <h3 className="font-serif font-bold text-main text-base">Still have questions or need assistance?</h3>
          <p className="text-xs text-sub max-w-md mx-auto">
            Our verification and matrimonial support team is happy to help you via email.
          </p>
          <a
            href="mailto:support@vadhu-var.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Contact support@vadhu-var.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
