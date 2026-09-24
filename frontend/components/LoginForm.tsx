'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Store, ArrowRight, CheckCircle2, AlertCircle, Loader2, ShieldCheck, User } from 'lucide-react';
import { loginUser } from '@/apis/auth.api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUserAndToken } from '@/redux/slices/auth.slice';

interface LoginFormProps {
  initialRole?: string;
}

export function LoginForm({ initialRole }: LoginFormProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth)
  console.log('user', user)
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || initialRole;
  const isProviderMode = roleParam === 'provider';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      
      console.log(res)
      dispatch(setUserAndToken({user:res.user, token:res.accessToken, role:res.user.role}))
      setSuccessMessage(res?.message || 'Login successful! Redirecting...');

      
      // if (res?.accessToken) {
      //   localStorage.setItem('accessToken', res.accessToken);
      //   if (res.user) {
      //     localStorage.setItem('user', JSON.stringify(res.user));
      //   }
      
      //   document.cookie = `accessToken=${res.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      // }

      // Redirect after brief delay for visual feedback

      
      setTimeout(() => {
        if (isProviderMode) {
          router.push('/');
        } else {
          router.push('/');
        }
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please verify your credentials.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Role / Context Banner */}
      {isProviderMode ? (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Store size={16} />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-amber-900">Provider Portal</span>
              <span className="text-[10px] ml-1.5 font-semibold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded-md">
                Seller Mode
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[11px] font-semibold text-amber-900 underline underline-offset-2 hover:text-black shrink-0 transition-colors"
          >
            Shopper login
          </Link>
        </div>
      ) : null}

      {/* Error Feedback */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <div className="flex-1 leading-snug">{errorMessage}</div>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div
          role="status"
          className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700">
              Password
            </label>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link has been dispatched to registered emails.');
              }}
              className="text-[11px] text-gray-500 hover:text-black transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={16} />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1.5 py-2.5 px-5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>{isProviderMode ? 'Sign in to Provider Portal' : 'Sign In'}</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* PROVIDER CALLOUT / CONTINUE AS PROVIDER LINK */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        {!isProviderMode ? (
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <Store size={14} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate">Store partner or merchant?</p>
              </div>
            </div>
            <Link
              href="/login?role=provider"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-white px-2.5 py-1 rounded-full border border-gray-300 shadow-2xs hover:bg-black hover:text-white transition-all shrink-0"
            >
              <span>Continue as provider</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-gray-500" />
              <span>Shopping for yourself?</span>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold text-black underline underline-offset-2 hover:text-gray-600 transition-colors"
            >
              Continue as shopper
            </Link>
          </div>
        )}
      </div>

      {/* Switch to Register */}
      <div className="mt-3.5 text-center text-xs text-gray-600">
        <span>Don&apos;t have an account yet? </span>
        <Link
          href={isProviderMode ? '/register?role=provider' : '/register'}
          className="font-bold text-black hover:underline underline-offset-2 transition-all"
        >
          {isProviderMode ? 'Register as provider' : 'Create an account'}
        </Link>
      </div>

      {/* Security badge footer */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck size={13} className="text-gray-400" />
        <span>256-bit encrypted secure authentication</span>
      </div>
    </div>
  );
}
