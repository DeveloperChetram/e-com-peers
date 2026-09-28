'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Shield,
  Key,
  Check,
  Mail,
  ShieldCheck,
  Lock,
  Save,
  AlertCircle,
} from 'lucide-react';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/slices/auth.slice';

export default function UserProfileSettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState((user as any)?.name || 'Alex Morgan');
  const [email] = useState((user as any)?.email || 'alex.morgan@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(setUser({ user: { ...(user as any), name }, role: (user as any)?.role }));
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
          <User size={28} className="text-black dark:text-white" />
          <span>Account & Security</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal details, email address, and account credentials.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check size={16} />
          <span>Your profile details have been saved successfully!</span>
        </div>
      )}

      {/* Profile Information Form */}
      <div className="bg-white dark:bg-[#161922] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Personal Information
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Update your public name and view your registered email.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
            <ShieldCheck size={14} />
            Verified Customer
          </span>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg text-xs">
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed font-medium"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Primary
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Your email address is used for order confirmations and sign-in authentication.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={14} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="bg-white dark:bg-[#161922] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-6 transition-colors">
        <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock size={18} />
            <span>Update Password</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ensure your account is using a long and random password to stay secure.
          </p>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg text-xs">
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Key size={14} />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
