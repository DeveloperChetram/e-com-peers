'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Home,
  Briefcase,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAddresses } from '@/hooks/useAddresses';
import { AddressItem } from '@/apis/address.api';

export default function UserAddressesPage() {
  const {
    addresses,
    selectedAddressId,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
  } = useAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddress(addr);
    setFormData({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street.trim() || !formData.city.trim() || !formData.zip.trim()) {
      setFormError('Street address, city, and zip code are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await addAddress(formData);
      }

      setShowModal(false);
    } catch (err: any) {
      console.error('Failed to save address:', err);
      setFormError(err?.message || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
    } catch (err: any) {
      console.error('Failed to remove address:', err);
      alert(err?.message || 'Cannot delete address that is associated with past orders.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <MapPin size={28} className="text-red-500" />
            <span>Delivery Addresses</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your destination shipping addresses stored in your profile and Redux store.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && addresses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800">
          <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Loading your addresses...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] p-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 text-center shadow-xs">
          <MapPin size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No Addresses Saved
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-4">
            Save your home or work address for one-click express checkout.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            <span>Add Address Now</span>
          </button>
        </div>
      ) : (
        /* Addresses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;

            return (
              <div
                key={addr.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-[#161922] border-black dark:border-white shadow-xs ring-1 ring-black/10 dark:ring-white/10'
                    : 'bg-white dark:bg-[#161922] border-gray-200/80 dark:border-gray-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <Home size={14} />
                    </span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      Delivery Address
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle2 size={13} />
                      Primary Address
                    </span>
                  ) : (
                    <button
                      onClick={() => selectAddress(addr.id)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Set as primary
                    </button>
                  )}
                </div>

                <div className="py-4 space-y-1 text-xs">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    {addr.street}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">{addr.country}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg cursor-pointer"
                    title="Remove address"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161922] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Springfield"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="OR"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="97477"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
