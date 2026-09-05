import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Inbox, CheckCircle2, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AuthPage = ({ onSuccess }) => {
  const { t } = useLanguage();
  const { login, signUp, resetPassword, updatePassword, isPasswordRecovery, setIsPasswordRecovery } = useAuth();

  // Mode: 'signin' | 'signup' | 'forgot' | 'recovery'
  const [mode, setMode] = useState(() => {
    if (isPasswordRecovery) return 'recovery';
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        return 'recovery';
      }
    }
    return 'signin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [emailSentScreen, setEmailSentScreen] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
      const search = typeof window !== 'undefined' ? window.location.search || '' : '';
      if (isPasswordRecovery || hash.includes('type=recovery') || search.includes('type=recovery')) {
        setMode('recovery');
      }
    };
    checkHash();
  }, [isPasswordRecovery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // 1. Password Recovery / Update Mode
    if (mode === 'recovery') {
      if (!password || password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        await updatePassword(password);
        setSuccessMsg('Your password has been updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } catch (err) {
        setError(err.message || 'Could not update password. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Forgot Password Mode
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        return;
      }

      setLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMsg(`Password reset link sent! Check ${email} for instructions.`);
      } catch (err) {
        setError(err.message || 'Could not send password reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Sign In & Sign Up Modes
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!termsAccepted) {
        setError('Please agree to the Terms of Service and Privacy Policy to continue.');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const termsTimestamp = new Date().toISOString();
        localStorage.setItem('vadhu_var_terms_accepted_at', termsTimestamp);
        const res = await signUp(email, password, { 
          full_name: fullName,
          terms_accepted_at: termsTimestamp
        });
        if (res?.user && !res?.session) {
          setEmailSentScreen(true);
        } else {
          if (onSuccess) onSuccess();
        }
      } else {
        await login(email, password);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('exceeded')) {
        setError('Email sign-up limit reached for this hour (Supabase test mailer limit). Please disable "Confirm email" in Supabase Auth Settings or connect a custom SMTP provider.');
      } else {
        setError(msg || 'Authentication failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSentScreen) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Logo variant="icon" size="large" />
          </div>

          <h2 className="font-serif text-2xl font-bold gold-gradient-text">
            Check Your Email
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            We sent a verification link to <strong className="text-white font-mono">{email}</strong>. Please check your inbox (and spam folder) and click the link to activate your Vadhu Var account.
          </p>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setEmailSentScreen(false);
                setMode('signin');
                setError('');
              }}
              className="px-6 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 text-xs font-bold hover:brightness-110 shadow-md transition-all active:scale-95"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
      <div className="glass-card radius-card border border-white/10 p-6 sm:p-8 shadow-2xl text-center transition-colors relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-gold-500/15 via-gold-500/5 to-transparent blur-xl pointer-events-none" />

        {/* Header Logo */}
        <div className="flex justify-center mb-5 relative z-10">
          <Logo size="large" />
        </div>

        {/* Title and Subtitle */}
        {mode === 'recovery' && (
          <>
            <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text mb-1 tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-zinc-400 mb-6">
              Create a new secure password for your Vadhu Var account.
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text mb-1 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-zinc-400 mb-6">
              Enter your registered email address and we'll send you a password reset link.
            </p>
          </>
        )}

        {mode === 'signin' && (
          <>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text mb-1 tracking-tight">
              Sign In to Vadhu Var
            </h1>
            <p className="text-xs text-zinc-400 mb-6">
              Access verified bride and groom profiles across India.
            </p>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text mb-1 tracking-tight">
              Create Your Profile
            </h1>
            <p className="text-xs text-zinc-400 mb-6">
              Start your verified matrimony search today.
            </p>
          </>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 radius-btn bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-left flex items-start gap-2">
            <span className="font-bold text-rose-500">•</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 radius-btn bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-left flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-10">
          {/* Sign Up: Full Name */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Deshmukh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-white/10 radius-btn text-sm bg-zinc-900/90 text-white placeholder:text-zinc-500 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/40 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Address (Hidden in recovery mode) */}
          {mode !== 'recovery' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-white/10 radius-btn text-sm bg-zinc-900/90 text-white placeholder:text-zinc-500 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/40 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Password field (Used in signin, signup, and recovery) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  {mode === 'recovery' ? 'New Password *' : 'Password *'}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setMode('forgot');
                    }}
                    className="text-xs text-gold-400 hover:text-gold-300 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-white/10 radius-btn text-sm bg-zinc-900/90 text-white placeholder:text-zinc-500 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/40 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Confirm Password (only for recovery) */}
          {mode === 'recovery' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-white/10 radius-btn text-sm bg-zinc-900/90 text-white placeholder:text-zinc-500 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/40 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Terms & Privacy Consent Checkbox (Sign Up Mode) */}
          {mode === 'signup' && (
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 text-gold-500 focus:ring-gold-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] sm:text-xs text-zinc-400 leading-snug">
                  I agree to the <a href="#terms" onClick={(e) => { e.preventDefault(); if (window.__onOpenTerms) window.__onOpenTerms(); }} className="text-gold-400 font-semibold hover:underline">Terms of Service</a> and <a href="#privacy" onClick={(e) => { e.preventDefault(); if (window.__onOpenPrivacy) window.__onOpenPrivacy(); }} className="text-gold-400 font-semibold hover:underline">Privacy Policy</a> of Vadhu Var.
                </span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'recovery'
                ? 'Update Password & Sign In'
                : mode === 'forgot'
                ? 'Send Reset Link'
                : mode === 'signup'
                ? 'Create Account'
                : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Navigation & Mode Switching */}
        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-zinc-400 space-y-2 relative z-10">
          {mode === 'forgot' && (
            <button
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setMode('signin');
              }}
              className="text-gold-400 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}

          {mode === 'signin' && (
            <p>
              New candidate?{' '}
              <button
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('signup');
                }}
                className="text-gold-400 font-bold hover:underline ml-1"
              >
                Create an Account
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('signin');
                }}
                className="text-gold-400 font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
