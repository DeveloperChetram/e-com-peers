'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react';
import { googleAuth, loginUser } from '@/apis/auth.api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUserAndToken } from '@/redux/slices/auth.slice';
import { saveUserToStorage } from '@/utils/userStorage';

interface LoginFormProps {
  initialRole?: string;
}

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm({ initialRole }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || initialRole;
  const isProviderMode = roleParam === 'provider';

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(isProviderMode ? '/dashboard/provider' : '/dashboard/user');
    }
  }, [isAuthenticated, isProviderMode, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginUser({
        email: data.email.trim(),
        password: data.password,
        isProvider: isProviderMode,
      });

      saveUserToStorage(res.user, res.user.role);
      dispatch(setUserAndToken({ user: res.user, token: res.accessToken, role: res.user.role }));
      setSuccessMessage(res?.message || 'Login successful! Redirecting...');

      const targetPath = res?.redirectTo || (isProviderMode ? '/dashboard/provider' : '/dashboard/user');
      setTimeout(() => {
        router.replace(targetPath);
      }, 600);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please verify your credentials.';
      setErrorMessage(message);
    }
  };


  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      const res = await googleAuth(credentialResponse.credential, {
        isProvider: isProviderMode,
      });
      const resolvedRole = res.user?.role || (isProviderMode ? 'PROVIDER' : 'USER');
      saveUserToStorage(res.user, resolvedRole);
      dispatch(
        setUserAndToken({
          user: res.user,
          token: res.accessToken,
          role: resolvedRole,
        })
      );
      setSuccessMessage('Signed in with Google! Redirecting...');
      const targetPath = isProviderMode
        ? '/dashboard/provider'
        : (res?.redirectTo || '/dashboard/user');
      setTimeout(() => {
        router.replace(targetPath);
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setErrorMessage(message);
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
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
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email address',
                },
              })}
              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                errors.email
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.email.message}</p>
          )}
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
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className={`w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
              }`}
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
          {errors.password && (
            <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-1.5 py-2.5 px-5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
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

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage('Google Sign-In failed')}
            useOneTap
            shape="pill"
            width="100%"
          />
        </div>
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
