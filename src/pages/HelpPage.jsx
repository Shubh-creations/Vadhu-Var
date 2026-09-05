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
        <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Vadhu Var enforces strict trust standards to eliminate fake accounts and matrimonial scams:
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 radius-btn border border-zinc-200 dark:border-white/10">
              <strong className="text-emerald-700 dark:text-emerald-400 block text-xs">✓ ID Verified Badge (Compulsory)</strong>
              <span>Granted after human administrators manually cross-verify a government-issued photo ID (Aadhaar Card, Voter ID, Passport, or Driving License).</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 radius-btn border border-zinc-200 dark:border-white/10">
              <strong className="text-emerald-700 dark:text-emerald-400 block text-xs">★ 100% Fully Verified Badge</strong>
              <span>Awarded to high-trust profiles who have submitted both government identity verification and family consent/parent verification documents.</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 radius-btn border border-zinc-200 dark:border-white/10">
              <strong className="text-amber-700 dark:text-gold-400 block text-xs">💼 Profession / Career Verified Badge</strong>
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
        <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            The Match Compatibility percentage is calculated using a 100-point weighted preference algorithm comparing candidate attributes against your saved partner criteria:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-zinc-900 dark:text-white">Marital Status Alignment (25 Pts):</strong> Full match if candidate status is in your accepted list.</li>
            <li><strong className="text-zinc-900 dark:text-white">Age Preference (20 Pts):</strong> Full match if within your configured minimum and maximum age range.</li>
            <li><strong className="text-zinc-900 dark:text-white">Location & City (15 Pts):</strong> Points awarded for matching state or preferred city.</li>
            <li><strong className="text-zinc-900 dark:text-white">Dietary Lifestyle (15 Pts):</strong> Full match for compatible diet (Vegetarian, Jain, Eggetarian, Non-Veg).</li>
            <li><strong className="text-zinc-900 dark:text-white">Height Range (15 Pts):</strong> Match based on candidate height in centimeters.</li>
            <li><strong className="text-zinc-900 dark:text-white">Education & Career (10 Pts):</strong> Alignment with preferred education tier.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'edit_profile',
      icon: Pencil,
      title: "How do I edit my profile details or reposition my photo?",
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            1. Tap <strong className="text-zinc-900 dark:text-white">"My Profile"</strong> in the bottom navigation bar or click your avatar at the top right.
          </p>
          <p>
            2. Click the <strong className="text-zinc-900 dark:text-white">"Update Profile"</strong> button to open the 5-step wizard.
          </p>
          <p>
            3. In Step 1, click the camera icon to upload a new photo, or use the <strong className="text-zinc-900 dark:text-white">Center 🎯</strong> and directional arrows (←, ↑, ↓, →) to position your face in the circular frame.
          </p>
          <p>
            4. Complete all steps and tap <strong className="text-zinc-900 dark:text-white">"Save Changes & Update Profile"</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'reporting',
      icon: ShieldAlert,
      title: "How do I report a fake profile, harassment, or financial scam?",
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Vadhu Var maintains a zero-tolerance policy against monetary requests, dowry demands, fake photos, and abusive language:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Open the candidate's profile or chat screen and click the <strong className="text-zinc-900 dark:text-white">Shield / Report</strong> icon.</li>
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
        <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            • <strong className="text-zinc-900 dark:text-white">Hide from Search Feeds:</strong> In your Profile Hub, toggle <strong className="text-zinc-900 dark:text-white">"Profile Visibility"</strong> to "Hidden from Search". Only candidates you explicitly message can view your card.
          </p>
          <p>
            • <strong className="text-zinc-900 dark:text-white">Temporary Deactivation:</strong> In your Profile Hub, click <strong className="text-zinc-900 dark:text-white">"Deactivate Account"</strong> to temporarily pause matching while keeping your records safe.
          </p>
          <p>
            • <strong className="text-zinc-900 dark:text-white">Instant Permanent Account & Data Deletion:</strong> In your Profile Hub, scroll to the <strong className="text-zinc-900 dark:text-white">Danger Zone</strong> and click <strong className="text-zinc-900 dark:text-white">"Delete My Account"</strong>. Confirm by typing DELETE to permanently erase your profile, photos, and ID documents from our servers instantly.
          </p>
        </div>
      )
    },
    {
      id: 'contact',
      icon: Mail,
      title: "How can I contact the Vadhu Var Support Team?",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Our dedicated matrimonial support team is available 7 days a week to assist you with profile verification, account inquiries, or technical support:
          </p>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/70 radius-btn border border-zinc-200 dark:border-white/10 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <span className="text-zinc-900 dark:text-white font-bold flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-600 dark:text-gold-400 flex-shrink-0" />
                <span>Email Support:</span>
              </span>
              <a
                href="mailto:vadhuvar.matrimonyapp@gmail.com"
                className="text-amber-700 dark:text-gold-400 hover:underline font-bold break-all"
              >
                vadhuvar.matrimonyapp@gmail.com
              </a>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
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
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 radius-btn glass-card border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600 dark:text-gold-400" />
          <span>Back to Platform</span>
        </button>
      )}

      <div className="glass-card border border-zinc-200 dark:border-white/10 radius-card p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden bg-white/95 dark:bg-zinc-950/80">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gold-500/10 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto relative z-10">
          <div className="w-14 h-14 radius-btn bg-gold-500/10 border border-gold-500/20 text-amber-600 dark:text-gold-400 flex items-center justify-center mx-auto mb-3 shadow-md">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold gold-gradient-text">
            Help Center & Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Everything you need to know about verification badges, match compatibility, privacy, and safety.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 relative z-10">
          {faqList.map((faq, idx) => {
            const Icon = faq.icon;
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.id}
                className="bg-zinc-50 dark:bg-zinc-900/80 radius-card border border-zinc-200 dark:border-white/10 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-zinc-900 dark:text-white text-sm sm:text-base hover:bg-zinc-100/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-amber-600 dark:text-gold-400 flex-shrink-0" />
                    <span>{faq.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-zinc-200 dark:border-white/10 animate-fade-in text-zinc-700 dark:text-zinc-300">
                    {faq.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="p-6 sm:p-8 radius-card bg-zinc-50 dark:bg-zinc-900/90 border border-amber-500/20 text-center space-y-3 relative z-10 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-gold-400 flex items-center justify-center mx-auto mb-1">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold gold-gradient-text text-base sm:text-xl">
            Still have questions or need assistance?
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Our verification and matrimonial support team is happy to help you via email.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href="mailto:vadhuvar.matrimonyapp@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 text-center cursor-pointer max-w-full"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="font-mono truncate">vadhuvar.matrimonyapp@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
