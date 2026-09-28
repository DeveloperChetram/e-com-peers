'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tag,
  Store,
  Sparkles,
  CheckCircle2,
  MapPin,
  CreditCard,
  Check,
  X,
  Loader2,
  AlertCircle,
  Package,
  Home,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { resolveImages } from '@/apis/apiClient';
import { ThemeToggle } from '@/components/ThemeProvider';
import DashboardButton from '@/components/ui/DashboardButton';
import { RootState } from '@/redux/store';
import { placeOrder, OrderResponse } from '@/apis/orders.api';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, totalItems, totalPrice, setQuantity, removeItem, clearAll } = useCart();
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    selectAddress,
    addAddress,
  } = useAddresses();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20); // 20% standard promo discount
  const [promoApplied, setPromoApplied] = useState(true);
  const [promoMessage, setPromoMessage] = useState<string | null>(
    'Default 20% welcome discount applied!'
  );

  // Checkout modal & state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Custom address input toggle & state
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  const discountAmount = promoApplied ? (totalPrice * discountPercent) / 100 : 0;
  const deliveryFee = totalPrice > 50 || totalPrice === 0 ? 0 : 15;
  const finalTotal = Math.max(0, totalPrice - discountAmount + deliveryFee);

  useEffect(() => {
    if (addresses.length === 0) {
      setUseNewAddress(true);
    } else {
      setUseNewAddress(false);
    }
  }, [addresses.length]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    if (promoCode.toUpperCase() === 'SHOP20' || promoCode.toUpperCase() === 'SAVE20') {
      setDiscountPercent(20);
      setPromoApplied(true);
      setPromoMessage('20% promo code applied successfully!');
    } else if (promoCode.toUpperCase() === 'VIP30') {
      setDiscountPercent(30);
      setPromoApplied(true);
      setPromoMessage('VIP 30% discount applied successfully!');
    } else {
      setPromoMessage('Invalid promo code. Try SHOP20 or VIP30.');
    }
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }
    setCheckoutError(null);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;

    let targetAddressId: string | undefined = undefined;
    let targetAddressData: any = null;
    let targetDetail = '';

    if (useNewAddress || !selectedAddress) {
      if (!customAddress.street.trim() || !customAddress.city.trim() || !customAddress.zip.trim()) {
        setCheckoutError('Please provide a complete shipping address (Street, City, Zip).');
        return;
      }
      targetAddressData = {
        street: customAddress.street.trim(),
        city: customAddress.city.trim(),
        state: customAddress.state.trim(),
        zip: customAddress.zip.trim(),
        country: customAddress.country.trim(),
      };
      targetDetail = `${targetAddressData.street}, ${targetAddressData.city}, ${targetAddressData.state} ${targetAddressData.zip}, ${targetAddressData.country}`;

      // Automatically persist the new address in user's saved addresses in background
      try {
        const saved = await addAddress(targetAddressData);
        targetAddressId = saved.id;
      } catch (e) {
        // Fallback to order-level address if save fails
      }
    } else {
      targetAddressId = selectedAddress.id;
      targetAddressData = {
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        country: selectedAddress.country,
      };
      targetDetail = `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zip}, ${selectedAddress.country}`;
    }

    try {
      setIsPlacingOrder(true);
      setCheckoutError(null);

      // Snapshot of the address
      const snapshotString = JSON.stringify({
        id: targetAddressId,
        ...targetAddressData,
        formatted: targetDetail,
      });

      const payload = {
        addressId: targetAddressId,
        address: targetAddressData,
        addressDetail: snapshotString,
        items: items.map((item) => ({
          productId: String(item.product.id),
          quantity: item.quantity,
        })),
        clearCart: true,
      };

      const result = await placeOrder(payload);
      setPlacedOrder(result);

      // Clear the local cart
      clearAll();
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setCheckoutError(
        err?.message || 'Failed to place your order. Please check your connection and try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const parseAddressDetail = (detail?: string) => {
    if (!detail) return 'Standard Delivery Address';
    try {
      const parsed = JSON.parse(detail);
      return parsed.formatted || `${parsed.street}, ${parsed.city}`;
    } catch {
      return detail;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0D13] text-gray-900 dark:text-gray-100 transition-colors">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#161922]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-gray-950 dark:text-white"
            >
              SHOP.CO
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-xs sm:text-sm font-semibold">
              <Link
                href="/products"
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Products
              </Link>
              <Link
                href="/register?role=provider"
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Become a Seller
              </Link>
              <Link
                href="/dashboard/user"
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                My Account
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DashboardButton />
          </div>
        </div>
      </header>

      {/* 2. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-bold">Shopping Cart</span>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* 3. Main Cart Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              YOUR CART
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for instant dispatch
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Clear entire cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-20 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 shadow-xs max-w-xl mx-auto space-y-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Looks like you haven&apos;t added anything to your cart yet. Explore our curated collections to discover your signature style.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md active:scale-98"
              >
                <ShoppingBag size={16} />
                <span>Explore Products</span>
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard/user/orders"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Package size={16} />
                  <span>My Orders</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Two Column Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Items List */}
            <div className="lg:col-span-7 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-4 sm:p-6 shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
              {items.map(({ product, quantity }) => {
                const img = product.imageUrl
                  ? resolveImages(product.imageUrl)
                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={product.id}
                    className="py-4 sm:py-5 first:pt-0 last:pb-0 flex gap-4 sm:gap-5 items-center"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${product.id}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-2 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700/60 overflow-hidden group"
                    >
                      <Image
                        src={img}
                        alt={product.name}
                        width={90}
                        height={90}
                        unoptimized
                        className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-bold text-sm sm:text-base text-gray-950 dark:text-white hover:underline truncate block"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                        <span>Price: <strong className="text-gray-900 dark:text-white font-semibold">${Number(product.price).toFixed(2)}</strong></span>
                        {product.providerId && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400">
                            <Store size={11} /> Partner Fulfilled
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-base sm:text-lg font-black text-gray-950 dark:text-white">
                          ${(Number(product.price) * quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800/80 w-28">
                          <button
                            onClick={() => setQuantity(product.id, quantity - 1)}
                            className="text-gray-500 hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(product.id, quantity + 1)}
                            className="text-gray-500 hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs space-y-5">
                <h2 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white tracking-tight">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-950 dark:text-white">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag size={13} />
                        Discount (-{discountPercent}%)
                      </span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Delivery Fee */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Truck size={13} />
                      Delivery Fee
                    </span>
                    <span className="font-bold text-gray-950 dark:text-white">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Free
                        </span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-bold text-gray-950 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="pt-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Tag size={14} />
                      </div>
                      <input
                        type="text"
                        placeholder="Add promo code (e.g. VIP30)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-gray-900 dark:text-white uppercase placeholder:normal-case"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {promoMessage && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>{promoMessage}</span>
                    </p>
                  )}
                </form>

                {/* Checkout CTA */}
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-99"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Guarantees Badge Box */}
              <div className="p-4 rounded-2xl bg-gray-100/70 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Snapshot addresses preserved in immutable orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-blue-500" />
                  <span>Free doorstep delivery on orders over $50</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Interactive Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 sticky top-0 bg-white dark:bg-[#161922] z-10">
              <div>
                <h3 className="text-xl font-black text-gray-950 dark:text-white">
                  {placedOrder ? 'Order Confirmed!' : 'Checkout & Delivery'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {placedOrder
                    ? 'Your order has been placed and is being processed.'
                    : 'Select your saved shipping address or enter a new destination.'}
                </p>
              </div>
              {!placedOrder && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* SUCCESS STATE */}
            {placedOrder ? (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                    Order ID: {placedOrder.id}
                  </span>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Thank you for your order!
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    We’ve received your order and an immutable address snapshot has been recorded.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-left text-xs space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-gray-500 shrink-0">Shipping Snapshot:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right">
                      {parseAddressDetail(placedOrder.addressDetail)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      {placedOrder.status || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700">
                    <span className="text-gray-500">Total Items:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {placedOrder.items?.length || totalItems} items
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/dashboard/user/orders"
                    className="flex-1 py-3 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Package size={15} />
                    <span>View in My Orders</span>
                  </Link>
                  <Link
                    href="/products"
                    className="flex-1 py-3 px-5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={15} />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* CHECKOUT FORM */
              <div className="space-y-5">
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Delivery Address Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-500" />
                      <span>Shipping Address</span>
                    </label>

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(!useNewAddress)}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        {useNewAddress ? 'Select Saved Address' : '+ Add New Address'}
                      </button>
                    )}
                  </div>

                  {/* Saved addresses picker */}
                  {!useNewAddress && addresses.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {addresses.map((addr) => {
                        const isSelected = (selectedAddressId || addresses[0]?.id) === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => selectAddress(addr.id)}
                            className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-600 dark:border-purple-400 ring-1 ring-purple-600 dark:ring-purple-400'
                                : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {addr.street}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {addr.city}, {addr.state} {addr.zip}, {addr.country}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="p-1 rounded-full bg-purple-600 text-white shrink-0">
                                <Check size={12} className="stroke-[3]" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* New address inputs */
                    <div className="space-y-2 text-xs">
                      <div>
                        <input
                          type="text"
                          placeholder="Street Address (e.g. 742 Evergreen Terrace)"
                          value={customAddress.street}
                          onChange={(e) =>
                            setCustomAddress({ ...customAddress, street: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City (e.g. Springfield)"
                          value={customAddress.city}
                          onChange={(e) =>
                            setCustomAddress({ ...customAddress, city: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="State / Region (e.g. OR)"
                          value={customAddress.state}
                          onChange={(e) =>
                            setCustomAddress({ ...customAddress, state: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Postal / ZIP Code (e.g. 97477)"
                          value={customAddress.zip}
                          onChange={(e) =>
                            setCustomAddress({ ...customAddress, zip: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <input
                          type="text"
                          placeholder="Country (e.g. United States)"
                          value={customAddress.country}
                          onChange={(e) =>
                            setCustomAddress({ ...customAddress, country: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-emerald-500" />
                    <span>Payment Method</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 ring-1 ring-black dark:ring-white'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-gray-900 dark:text-white block">
                        Cash on Delivery
                      </span>
                      <span className="text-[11px] text-gray-400">Pay at doorstep</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 ring-1 ring-black dark:ring-white'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-gray-900 dark:text-white block">
                        Online / Card
                      </span>
                      <span className="text-[11px] text-gray-400">Instant verification</span>
                    </button>
                  </div>
                </div>

                {/* Final Breakdown */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-500">
                    <span>Items ({totalItems})</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount (-{discountPercent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Amount Payable
                    </span>
                    <span className="text-base font-black text-gray-900 dark:text-white">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-3.5 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Confirm & Place Order (${finalTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
