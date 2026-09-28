'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { loginAdmin } from '@/apis/auth.api';
import { useAppDispatch } from '@/redux/hooks';
import { setUserAndToken } from '@/redux/slices/auth.slice';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginAdmin({ email, password });

      dispatch(
        setUserAndToken({
          user: res.user,
          token: res.accessToken,
          role: res.user.role,
        })
      );

      setSuccessMessage(res.message || 'Admin authentication successful! Redirecting...');

      const targetPath = res.redirectTo || '/dashboard/admin';
      setTimeout(() => {
        router.push(targetPath);
      }, 600);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to authenticate as admin. Check your credentials.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-black tracking-tight uppercase hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Shield size={18} />
            </div>
            <span>
              SHOP.CO <span className="text-xs text-indigo-400 font-semibold lowercase">/admin</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Customer Login</span>
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header Badge & Title */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Shield size={12} className="text-indigo-400" />
                Control Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Admin Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your administrative credentials to access platform governance.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                role="status"
                className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shop.co"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-5 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Admin Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Not an admin? <span className="underline font-medium text-slate-300">Go to Shopper / Merchant Login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} SHOP.CO Internal Administration Portal</p>
      </footer>
    </div>
  );
}
