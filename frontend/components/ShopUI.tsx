import React from 'react';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { SearchBar } from './ui/SearchBar';
import Link from 'next/link';
import DashboardButton from './ui/DashboardButton';

const ShopUI = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-4 md:px-16 lg:px-24">
        {/* Logo */}
        <div className="text-3xl font-black tracking-tighter uppercase">
          SHOP.CO
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">
          <Link href="#" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            Shop <ChevronDown size={16} />
          </Link>
          <Link href="/products" className="hover:text-gray-600 transition-colors">Products</Link>
          <Link href="/register?role=provider" className="hover:text-gray-600 transition-colors">Become a Provider</Link>
          <Link href="#" className="hover:text-gray-600 transition-colors">Brands</Link>
        </nav>

        {/* Search Bar - Hidden on small mobile */}
       <SearchBar />

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Search size={24} className="sm:hidden text-black" />
          <button aria-label="Cart" className="hover:text-gray-600 transition-colors">
            <ShoppingCart size={24} />
          </button>
          <Link href="/login" aria-label="User Profile / Sign In" className="hover:text-gray-600 transition-colors">
            <User size={24} />
          </Link>
        </div>
      <DashboardButton/>
      </header>

      {/* HERO SECTION */}
      <main className="bg-[#F2F0F1] flex flex-col md:flex-row items-center px-4 md:px-16 lg:px-24 pt-10 md:pt-16 lg:pt-24 relative overflow-hidden">
        
        {/* Left Content */}
        <section className="flex-1 z-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight uppercase text-black mb-6">
            Find Clothes<br />That Matches<br />Your Style
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 max-w-md">
            Browse through our diverse range of meticulously crafted garments, designed 
            to bring out your individuality and cater to your sense of style.
          </p>
          <button className="bg-black text-white w-full md:w-auto px-12 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors mb-10">
            Shop Now
          </button>
          {/* <SearchBar /> */}

          {/* Stats */}
          <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-8 items-center pb-12 md:pb-24">
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-bold">200+</span>
              <span className="text-xs md:text-sm text-gray-500">International Brands</span>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300"></div>
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-bold">2,000+</span>
              <span className="text-xs md:text-sm text-gray-500">High-Quality Products</span>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300"></div>
            <div className="flex flex-col w-full md:w-auto mt-4 md:mt-0">
              <span className="text-3xl md:text-4xl font-bold">30,000+</span>
              <span className="text-xs md:text-sm text-gray-500">Happy Customers</span>
            </div>
          </div>
        </section>

        {/* Right Content / Images */}
        <section className="flex-1 relative w-full h-[400px] md:h-[600px] lg:h-[700px] flex justify-center items-">
          {/* Decorative Star - Small */}
          <div className="absolute top-[40%] left-[10%] md:left-[0%] w-8 h-8 md:w-12 md:h-12 z-20">
            <svg viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
            </svg>
          </div>

          {/* Decorative Star - Large */}
          <div className="absolute top-[10%] right-[10%] md:right-[5%] w-16 h-16 md:w-24 md:h-24 z-20">
            <svg viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
            </svg>
          </div>

          {/* Fallback layout for models using placeholder URL to mimic provided UI */}
          <div className="relative w-full  self-end  w-[100px] md:h-[100%]  ">
            <Image 
              width={800}
              height={800}
              src="/hero.png" 
              alt="Fashion Models" 
              className="object-contain md:object-bottom w-full h-full rounded-t-3xl mask-image-bottom  "
            //   style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
            />
          </div>
        </section>
      </main>

      {/* BRANDS FOOTER */}
      <section className="bg-black py-8 md:py-10 px-4 md:px-16 lg:px-24 flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-8">
        <h2 className="text-white text-2xl md:text-3xl font-serif tracking-widest uppercase">Versace</h2>
        <h2 className="text-white text-3xl md:text-4xl font-sans font-bold tracking-widest uppercase" style={{ transform: 'scaleY(1.2)' }}>Zara</h2>
        <h2 className="text-white text-2xl md:text-3xl font-serif tracking-widest uppercase">Gucci</h2>
        <h2 className="text-white text-2xl md:text-4xl font-serif font-bold tracking-widest uppercase">Prada</h2>
        <h2 className="text-white text-2xl md:text-3xl font-sans tracking-tight">Calvin Klein</h2>
      </section>
    </div>
  );
};

export default ShopUI;
