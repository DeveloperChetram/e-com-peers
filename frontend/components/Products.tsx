import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  UserCircle, 
  ChevronDown, 
  ChevronRight, 
  SlidersHorizontal, 
  ChevronUp, 
  Star, 
  StarHalf 
} from 'lucide-react';

// --- Types ---
type Product = {
  id: string;
  name: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
};

// --- Mock Data ---
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Gradient Graphic T-shirt',
    rating: 3.5,
    price: 145,
    imageUrl: 'https://via.placeholder.com/300x400?text=Graphic+T-shirt',
  },
  {
    id: '2',
    name: 'Polo with Tipping Details',
    rating: 4.5,
    price: 180,
    imageUrl: 'https://via.placeholder.com/300x400?text=Polo+Shirt',
  },
  {
    id: '3',
    name: 'Black Striped T-shirt',
    rating: 5.0,
    price: 120,
    originalPrice: 150,
    discount: 30,
    imageUrl: 'https://via.placeholder.com/300x400?text=Striped+T-shirt',
  },
  {
    id: '4',
    name: 'Skinny Fit Jeans',
    rating: 3.5,
    price: 240,
    originalPrice: 260,
    discount: 20,
    imageUrl: 'https://via.placeholder.com/300x400?text=Jeans',
  },
  {
    id: '5',
    name: 'Checkered Shirt',
    rating: 4.5,
    price: 180,
    imageUrl: 'https://via.placeholder.com/300x400?text=Checkered+Shirt',
  },
  {
    id: '6',
    name: 'Sleeve Striped T-shirt',
    rating: 4.5,
    price: 130,
    originalPrice: 160,
    discount: 30,
    imageUrl: 'https://via.placeholder.com/300x400?text=Sleeve+Striped',
  },
];

const CATEGORIES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
const COLORS = [
  'bg-green-500', 'bg-red-500', 'bg-yellow-400', 'bg-orange-500', 'bg-cyan-400',
  'bg-blue-600', 'bg-purple-500', 'bg-pink-500', 'bg-white', 'bg-black'
];
const SIZES = [
  'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'
];

// --- Components ---
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
      </div>
      <span className="text-sm text-gray-500 ml-1">{rating}/5</span>
    </div>
  );
};

export default function ShopCategoryPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black uppercase tracking-tighter cursor-pointer">SHOP.CO</h1>
            <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
              <a href="#" className="flex items-center gap-1 hover:text-gray-600">
                Shop <ChevronDown className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-gray-600">On Sale</a>
              <a href="#" className="hover:text-gray-600">New Arrivals</a>
              <a href="#" className="hover:text-gray-600">Brands</a>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for products..." 
              className="bg-transparent border-none outline-none w-full ml-3 text-sm placeholder-gray-500"
            />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-700 hover:text-black">
              <Search className="w-6 h-6" />
            </button>
            <button className="text-gray-700 hover:text-black">
              <ShoppingCart className="w-6 h-6" />
            </button>
            <button className="text-gray-700 hover:text-black">
              <UserCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Breadcrumbs */}
        <div className="py-6 text-sm text-gray-500 flex items-center gap-2">
          <a href="#" className="hover:text-black">Home</a>
          <span>&gt;</span>
          <span className="text-black font-medium">Casual</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar (Filters) */}
          <aside className="w-full lg:w-[295px] flex-shrink-0">
            <div className="border border-gray-200 rounded-2xl p-5 md:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <SlidersHorizontal className="w-5 h-5 text-gray-500" />
              </div>
              <hr className="border-gray-200 mb-6" />

              {/* Categories */}
              <div className="space-y-4 mb-6">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-gray-600 group-hover:text-black transition-colors">{category}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  </div>
                ))}
              </div>
              <hr className="border-gray-200 mb-6" />

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <h3 className="text-lg font-bold">Price</h3>
                  <ChevronUp className="w-5 h-5" />
                </div>
                <div className="px-2">
                  <div className="relative w-full h-1.5 bg-gray-200 rounded-full mb-4">
                    <div className="absolute left-[25%] right-[25%] top-0 h-full bg-black rounded-full"></div>
                    <div className="absolute left-[25%] -top-1.5 w-4 h-4 bg-black rounded-full border-2 border-white cursor-pointer shadow"></div>
                    <div className="absolute right-[25%] -top-1.5 w-4 h-4 bg-black rounded-full border-2 border-white cursor-pointer shadow"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>$50</span>
                    <span>$200</span>
                  </div>
                </div>
              </div>
              <hr className="border-gray-200 mb-6" />

              {/* Colors */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <h3 className="text-lg font-bold">Colors</h3>
                  <ChevronUp className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((colorClass, idx) => (
                    <button 
                      key={idx} 
                      className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm ${colorClass} ${
                        colorClass === 'bg-blue-600' ? 'ring-2 ring-offset-1 ring-blue-600' : ''
                      }`}
                      aria-label="Color filter"
                    />
                  ))}
                </div>
              </div>
              <hr className="border-gray-200 mb-6" />

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <h3 className="text-lg font-bold">Size</h3>
                  <ChevronUp className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button 
                      key={size}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        size === 'Large' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <section className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold">Casual</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Showing 1-10 of 100 Products</span>
                <div className="hidden sm:block text-gray-300">|</div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-black">
                  <span>Sort by: <strong className="text-black font-medium">Most Popular</strong></span>
                  <ChevronDown className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {PRODUCTS.map((product) => (
                <article key={product.id} className="group cursor-pointer">
                  <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                  <RatingStars rating={product.rating} />
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-bold text-2xl">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 font-bold text-2xl line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    {product.discount && (
                      <span className="bg-red-100 text-red-500 text-xs font-bold px-3 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}