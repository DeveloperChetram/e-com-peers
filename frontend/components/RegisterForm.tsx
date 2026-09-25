'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  User,
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
  Building2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { registerUser, registerProvider, RegisterProviderData } from '@/apis/auth.api';
import { setUserAndToken } from '@/redux/slices/auth.slice';
import { useDispatch } from 'react-redux';

interface RegisterFormProps {
  initialRole?: string;
}

interface RegisterFormInputs extends RegisterProviderData {
  name: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export function RegisterForm({ initialRole }: RegisterFormProps = {}) {
  const dispatch = useDispatch()
  const router = useRouter();
  const searchParams = useSearchParams();


  const roleParam = searchParams.get('role') || initialRole;
  const isProviderMode = roleParam === 'provider';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      name: '',
      businessName: '',
      description: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setServerError(null);
    setServerSuccess(null);

    try {
      if (!isProviderMode) {
        const userPayload = {
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
        };
        const res = await registerUser(userPayload);
        dispatch(
          setUserAndToken({
            user: res.user,
            token: res.accessToken,
            role: res.user?.role || 'USER',
          })
        );
        setServerSuccess(res?.message || 'Account created! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard/user');
        }, 800);
        return;
      }

      const providerPayload = {
        name: data.name.trim(),
        businessName: data.businessName?.trim(),
        description: data.description?.trim(),
        email: data.email.trim(),
        password: data.password,
      };
      const res = await registerProvider(providerPayload);
      dispatch(
        setUserAndToken({
          user: res.user,
          token: res.accessToken,
          role: res.user?.role || 'PROVIDER',
        })
      );

      setServerSuccess(
        res?.message || 'Provider account created! Redirecting to provider portal...'
      );

      setTimeout(() => {
        router.push('/dashboard/provider');
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <div className="w-full">
      {/* Role / Context Banner */}
      {!isProviderMode ? (
        <div className="mb-4 p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
              <Store size={14} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900 truncate">Want to sell your products?</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                  <Sparkles size={9} /> Partner
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/register?role=provider"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-white px-2.5 py-1 rounded-full border border-gray-300 shadow-2xs hover:bg-black hover:text-white transition-all shrink-0"
          >
            <span>Become a provider</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Store size={16} />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-amber-900">Provider Registration</span>
              <span className="text-[10px] ml-1.5 font-semibold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded-md">
                Merchant
              </span>
            </div>
          </div>
          <Link
            href="/register"
            className="text-[11px] font-semibold text-amber-900 underline underline-offset-2 hover:text-black shrink-0 transition-colors"
          >
            Customer signup
          </Link>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in"
        >
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <div className="flex-1 leading-snug">{serverError}</div>
        </div>
      )}

      {/* Server Success Alert */}
      {serverSuccess && (
        <div
          role="status"
          className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <div className="flex-1 font-medium">{serverSuccess}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {/* Name & Business Name Row (for Provider) or Name & Email Row (for Customer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Contact / Full Name */}
          <div>
            <label htmlFor="register-name" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
              {isProviderMode ? 'Owner Name' : 'Full Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={16} />
              </div>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder={isProviderMode ? 'Jane Doe' : 'John Doe'}
                {...register('name', {
                  required: isProviderMode ? 'Contact name is required' : 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.name
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.name.message}</p>
            )}
          </div>

          {/* Business Name (Provider Mode) or Email (Customer Mode) */}
          {isProviderMode ? (
            <div>
              <label htmlFor="register-businessName" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Business / Brand Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Building2 size={16} />
                </div>
                <input
                  id="register-businessName"
                  type="text"
                  placeholder="Urban Threads Studio"
                  {...register('businessName', {
                    required: isProviderMode ? 'Business name is required' : false,
                    minLength: {
                      value: 2,
                      message: 'Business name must be at least 2 characters',
                    },
                  })}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                    errors.businessName
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                  }`}
                />
              </div>
              {errors.businessName && (
                <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.businessName.message}</p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="register-email" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="register-email"
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
          )}
        </div>

        {/* Business Email & Description for Provider Mode */}
        {isProviderMode && (
          <>
            {/* Email Address in Provider Mode */}
            <div>
              <label htmlFor="register-provider-email" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="register-provider-email"
                  type="email"
                  autoComplete="email"
                  placeholder="partner@example.com"
                  {...register('email', {
                    required: 'Business email is required',
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

            {/* Description (Optional) */}
            <div>
              <label htmlFor="register-description" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Business Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none text-gray-400">
                  <FileText size={16} />
                </div>
                <textarea
                  id="register-description"
                  rows={2}
                  placeholder="Briefly describe the categories or products you sell..."
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description must be under 500 characters',
                    },
                  })}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all resize-none ${
                    errors.description
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                  }`}
                />
              </div>
              {errors.description && (
                <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.description.message}</p>
              )}
            </div>
          </>
        )}

        {/* Password & Confirm Password Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Password */}
          <div>
            <label htmlFor="register-password" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Password <span className="text-gray-400 font-normal lowercase">(min 6)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Must be at least 6 characters',
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="register-confirm-password" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (value, formValues) =>
                    value === formValues.password || 'Passwords do not match',
                })}
                className={`w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2 cursor-pointer text-[11px] text-gray-600 leading-snug">
            <input
              type="checkbox"
              {...register('agreedToTerms', {
                required: 'You must agree to continue',
              })}
              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer shrink-0"
            />
            <span>
              I agree to the{' '}
              <a href="#" className="font-semibold text-black underline underline-offset-2">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-semibold text-black underline underline-offset-2">
                Privacy Policy
              </a>
              {isProviderMode && ' including Merchant Guidelines'}.
            </span>
          </label>
          {errors.agreedToTerms && (
            <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.agreedToTerms.message}</p>
          )}
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
              <span>{isProviderMode ? 'Creating provider account...' : 'Creating account...'}</span>
            </>
          ) : (
            <>
              <span>{isProviderMode ? 'Register as Provider' : 'Create Account'}</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-3.5 text-center text-xs text-gray-600">
        <span>Already have an account? </span>
        <Link
          href={isProviderMode ? '/login?role=provider' : '/login'}
          className="font-bold text-black hover:underline underline-offset-2 transition-all"
        >
          {isProviderMode ? 'Sign in to provider portal' : 'Sign in'}
        </Link>
      </div>

      {/* Security badge footer */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck size={13} className="text-gray-400" />
        <span>Your data is protected with bank-grade encryption</span>
      </div>
    </div>
  );
}
