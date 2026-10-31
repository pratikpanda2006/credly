import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password needs at least 6 characters.');
      return;
    }

    if (mode === 'signup' && displayName.trim().length > 0 && displayName.trim().length < 2) {
      setError('Name should have at least 2 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(trimmedEmail, password, displayName.trim() || undefined);
      } else {
        await login(trimmedEmail, password);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#0e1013] text-[#ecebe5] relative overflow-hidden transition-colors duration-200">
      {/* Subtle, elegant neutral illumination (Linear/Vercel style - no muddy purple) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-slate-800/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 h-48 bg-teal-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full px-6 py-5 flex justify-between items-center max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-2.5">
          <img src="/icon.png" alt="Credly" className="h-8 w-auto rounded-lg" />
          <span className="text-lg font-bold tracking-tight text-white">Credly</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="p-2.5 rounded-control border border-[#2a2d34] bg-[#16181d] hover:bg-[#1f2229] transition-colors text-slate-400 hover:text-white"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </header>

      {/* Main Content - Seamless whole-screen integration */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
        {/* Brand Header: Crisp logo mark and Credly text (NO baked-in duplicate text) */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-2">
            <img
              src="/credly_brand.png"
              alt="Credly"
              className="h-14 sm:h-16 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.06)]"
            />
          </div>

          {/* Clean single tagline */}
          <p className="text-sm font-medium text-slate-400 tracking-wide">
            Every contribution counts.
          </p>
        </div>

        {/* Integrated Form Container */}
        <div className="w-full">
          {/* Mode Switcher Tabs - Sleek Obsidian Pill */}
          <div className="flex p-1 mb-6 rounded-control bg-[#16181d] border border-[#26282f]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                mode === 'login'
                  ? 'bg-[#242730] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                mode === 'signup'
                  ? 'bg-[#242730] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Chen"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-control border border-[#26282f] bg-[#16181d] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#62b9a2] focus:border-transparent text-sm transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-control border border-[#26282f] bg-[#16181d] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#62b9a2] focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-500">6+ characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-control border border-[#26282f] bg-[#16181d] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#62b9a2] focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-control bg-red-500/10 border border-red-500/20 text-[#e3836f] text-xs flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-control bg-[#62b9a2] hover:bg-[#52a48f] text-[#0e1a15] font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Credly' : 'Create Your Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                className="font-semibold text-[#62b9a2] hover:underline ml-1 transition-colors"
              >
                {mode === 'login' ? 'Sign up free' : 'Log in here'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Attribution */}
      <footer className="w-full py-4 px-6 text-center text-xs text-slate-500 relative z-10">
        Credly: fair credit for every contributor. Designed and built by Pratik Panda.
      </footer>
    </div>
  );
};
