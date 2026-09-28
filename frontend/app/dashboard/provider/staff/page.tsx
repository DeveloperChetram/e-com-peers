'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  getProviderStaff,
  createProviderStaff,
  deleteProviderStaff,
  ProviderStaffMember,
} from '@/apis/provider.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

export default function ProviderStaffPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isStaff = (user as any)?.role === 'PROVIDER_STAFF';

  const [staffList, setStaffList] = useState<ProviderStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Add Staff Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
  });

  // Action feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const fetchStaff = async () => {
    if (isStaff) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProviderStaff();
      setStaffList(data || []);
    } catch (err: any) {
      console.error('Failed to load staff list:', err);
      setError(err?.message || 'Failed to load staff roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await createProviderStaff(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'STAFF' });
      setFeedback({
        message: 'Staff member created successfully! They can now log in via the Provider Login portal.',
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
      await fetchStaff();
    } catch (err: any) {
      console.error('Failed to create staff member:', err);
      setFormError(err?.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) {
      return;
    }

    try {
      await deleteProviderStaff(id);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      setFeedback({
        message: `Staff member "${name}" was removed.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to delete staff member:', err);
      setFeedback({
        message: err?.message || 'Failed to delete staff member.',
        type: 'error',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  if (isStaff) {
    return (
      <div className="bg-white dark:bg-[#161922] p-12 rounded-3xl border border-gray-200 dark:border-gray-800 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Shield size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Store Owner Access Only</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Staff member accounts and team rosters are exclusively managed by the store owner. As a staff member, your responsibility is handling the shipment department.
        </p>
        <Link
          href="/dashboard/provider/shipments"
          className="inline-block px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
        >
          Go to Shipment Department
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Users size={28} className="text-purple-600 dark:text-purple-400" />
            <span>Staff & Team Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and monitor staff members assigned to shipment departure and checkpoint tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaff}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            title="Refresh Staff"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <UserPlus size={16} />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-start gap-3">
        <Shield size={18} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 dark:text-purple-300">
          <p className="font-bold">Provider Staff Access:</p>
          <p className="mt-0.5 text-purple-700 dark:text-purple-400">
            Staff members can log in using their email and password through the <strong>Provider Login page</strong>.
            They have access to manage shipments, log checkpoint updates, and process return receipts.
          </p>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {filteredStaff.length} {filteredStaff.length === 1 ? 'member' : 'members'} found
        </span>
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800">
          <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading staff members...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchStaff}
            className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] p-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 text-center shadow-xs">
          <Users size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Staff Members Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-5">
            You have not added any staff members yet. Add staff to delegate shipment and checkpoint handling.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => {
            const initials =
              member.user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'ST';

            return (
              <div
                key={member.id}
                className="bg-white dark:bg-[#161922] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {member.user?.name}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {member.role || 'STAFF'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteStaff(member.id, member.user?.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Remove Staff Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{member.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={13} className="text-gray-400 shrink-0" />
                      <span>Role: <strong className="text-gray-700 dark:text-gray-300">{member.user?.role}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                  <span>
                    {member.user?.createdAt && !isNaN(new Date(member.user.createdAt).getTime())
                      ? `Joined ${new Date(member.user.createdAt).toLocaleDateString()}`
                      : member.joinedAt && !isNaN(new Date(member.joinedAt).getTime())
                      ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}`
                      : 'Staff Member'}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={12} />
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white">
                  Add Staff Member
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a team member account to handle order shipments.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@store.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                  <span>Initial Password</span>
                  <span className="text-[10px] text-gray-400 font-normal">Min 6 characters</span>
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Department Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  <option value="STAFF">Shipment Staff</option>
                  <option value="ADMIN">Store Manager</option>
                  <option value="MEMBER">Associate Member</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{submitting ? 'Creating...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
