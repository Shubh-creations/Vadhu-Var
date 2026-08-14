import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, { full_name: fullName });
      } else {
        await login(email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-xs text-center">
        {/* Header Icon */}
        <div className="w-12 h-12 radius-btn bg-sky-blue text-white flex items-center justify-center mx-auto mb-4 font-bold shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="font-serif text-2xl font-extrabold text-main mb-1">
          {isSignUp ? 'Create Your Profile' : 'Sign In to MH Vadhu-Var'}
        </h1>
        <p className="text-xs text-sub mb-6">
          {isSignUp
            ? 'Start your verified matrimony search today.'
            : 'Access verified bride and groom profiles across Maharashtra.'}
        </p>

        {error && (
          <div className="mb-4 p-3 radius-btn bg-surface-ground border border-main text-main text-xs font-medium text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-sub mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-sub absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kulkarni"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-sub mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sub absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-sub mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-sub absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-main radius-btn text-sm bg-surface-ground text-main outline-none focus:ring-1 focus:ring-sky-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-main text-xs text-sub">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-main font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New candidate?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-main font-bold hover:underline"
              >
                Create an Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
