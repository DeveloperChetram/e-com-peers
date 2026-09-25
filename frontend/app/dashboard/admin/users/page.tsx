'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  Search,
  Power,
  Trash2,
  Shield,
  Store,
  UserCheck,
  Loader2,
} from 'lucide-react';
import {
  getAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
  AdminUser,
} from '@/apis/admin.api';
import {
  setUsers,
  updateUserInState,
  removeUserFromState,
} from '@/redux/slices/admin.slice';
import { RootState } from '@/redux/store';

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter,
      });
      dispatch(setUsers(res.data || []));
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      setActionLoadingId(user.id);
      const nextActive = !user.isActive;
      await updateAdminUserStatus(user.id, nextActive);
      dispatch(updateUserInState({ id: user.id, isActive: nextActive }));
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: number, nextRole: string) => {
    try {
      setActionLoadingId(userId);
      await updateAdminUserRole(userId, nextRole);
      dispatch(updateUserInState({ id: userId, role: nextRole as any }));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setActionLoadingId(id);
      await deleteAdminUser(id);
      dispatch(removeUserFromState(id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Users size={28} className="text-purple-500" />
            <span>Customer Accounts</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage customer credentials, assign governance roles, and activate accounts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs font-semibold">
            {['ALL', 'USER', 'PROVIDER', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  roleFilter === r
                    ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-2xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-black dark:text-white" size={24} />
            <span className="text-xs font-semibold">Loading accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <Users size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Users Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              No registered user accounts match your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Affiliation</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* User */}
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0 font-bold text-xs uppercase">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-gray-400 font-normal">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={actionLoadingId === u.id}
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-900 dark:text-white focus:outline-hidden"
                      >
                        <option value="USER">USER</option>
                        <option value="PROVIDER">PROVIDER</option>
                        <option value="PROVIDER_STAFF">PROVIDER_STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Affiliation */}
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {u.provider ? (
                        <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                          <Store size={13} className="text-emerald-500" />
                          <span>{u.provider.businessName}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">Standard shopper</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={actionLoadingId === u.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                        title="Click to toggle active status"
                      >
                        <Power size={11} />
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={actionLoadingId === u.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
