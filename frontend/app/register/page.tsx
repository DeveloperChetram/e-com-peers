import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/RegisterForm';
import { ArrowLeft, Store, Shield, Sparkles, Check, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create an Account | SHOP.CO',
  description: 'Join SHOP.CO to discover trending styles or register to become a provider and sell your products.',
};

interface RegisterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedParams = await searchParams;
  const role = typeof resolvedParams.role === 'string' ? resolvedParams.role : undefined;
  const isProviderMode = role === 'provider';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between text-black">
      {/* Top Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-black hover:opacity-80 transition-opacity"
          >
            SHOP.CO
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-black transition-colors font-medium text-xs sm:text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Shop</span>
            </Link>

            {/* Direct SSR Link for "Become a provider" */}
            {!isProviderMode ? (
              <Link
                href="/register?role=provider"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 hover:bg-black hover:text-white transition-colors"
              >
                <Store size={14} />
                <span>Become a provider</span>
              </Link>
            ) : (
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 hover:bg-black hover:text-white transition-colors"
              >
                <span>Customer Registration</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero / Brand Showcase (SSR Server Rendered) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-7 rounded-3xl bg-black text-white relative overflow-hidden min-h-[500px] shadow-xl">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide uppercase text-white/90">
                <Sparkles size={13} className="text-amber-300" />
                {isProviderMode ? 'Partner Ecosystem' : 'Join Our Community'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mt-5">
                {isProviderMode ? (
                  <>
                    Grow Your Brand.<br />
                    Reach New<br />
                    Audiences.
                  </>
                ) : (
                  <>
                    Step Into<br />
                    Premium Style &<br />
                    Everyday Luxury.
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed">
                {isProviderMode
                  ? 'Join our vetted network of modern brands. Showcase your catalog to thousands of shoppers looking for the latest styles.'
                  : 'Create your account to unlock personalized recommendations, early access to drops, and seamless fast checkout.'}
              </p>
            </div>

            {/* Benefits List */}
            <div className="relative z-10 space-y-2.5 my-6">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  {isProviderMode ? <TrendingUp size={12} /> : <Check size={12} />}
                </div>
                <span>{isProviderMode ? 'Zero upfront listing fees to launch' : 'Exclusive member discounts & drops'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Check size={12} />
                </div>
                <span>{isProviderMode ? 'Secure automated weekly payouts' : 'Order tracking & 30-day free returns'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Check size={12} />
                </div>
                <span>{isProviderMode ? 'Built-in logistics & analytics tools' : 'Curated lookbooks tailored to your taste'}</span>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-emerald-400" />
                <span>Verified Buyer & Seller Protection</span>
              </div>
              <span className="font-semibold text-white">SHOP.CO</span>
            </div>
          </div>

          {/* Right Form Card (Interactive Client Component separated in UI folder) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg bg-white p-5 sm:p-7 rounded-3xl border border-gray-200/80 shadow-xs">
              
              {/* Header Titles */}
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950">
                  {isProviderMode ? 'Become a Provider' : 'Create an Account'}
                </h1>
              </div>

              {/* User Interactive Component from components/ui */}
              <Suspense
                fallback={
                  <div className="space-y-3 py-6 animate-pulse">
                    <div className="h-9 bg-gray-100 rounded-xl w-full"></div>
                    <div className="h-9 bg-gray-100 rounded-xl w-full"></div>
                    <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                  </div>
                }
              >
                <RegisterForm initialRole={role} />
              </Suspense>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SHOP.CO. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/register?role=provider" className="hover:text-black font-semibold transition-colors">
              Become a provider
            </Link>
            <Link href="/login?role=provider" className="hover:text-black transition-colors">
              Continue as provider
            </Link>
            <Link href="/login" className="hover:text-black transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
