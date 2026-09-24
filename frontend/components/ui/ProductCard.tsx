'use client';

import React, { useState } from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import { resolveImages } from '@/apis/apiClient';
import Image from 'next/image';

export interface Product {
  id?: string | number;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string;
}

interface ProductCardProps {
  product?: Product;
  onAddToCart?: (product: Product) => void;
}

const defaultProduct: Product = {
  id: '1',
  name: 'Sony Headphone',
  description: 'WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
  price: 339,
  image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
};

const ProductCard: React.FC<ProductCardProps> = ({ product = defaultProduct, onAddToCart }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const rawImage =
    product.imageUrl ||
    product.image ||
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const displayImage = resolveImages(rawImage);

  return (
    <div>
      {/* Main product card container */}
      <div className="bg-white rounded-[24px] p-6 w-full max-w-[340px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-shadow">
        
        {/* Favorite/Heart Button */}
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors z-10 cursor-pointer"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'
            }`} 
            strokeWidth={2} 
          />
        </button>

        {/* Product Image Section */}
        <div className="relative flex justify-center items-center h-[240px]">
          <div className="relative w-48 h-48 drop-shadow-2xl">
             <Image 
               src={displayImage} 
               alt={product.name} 
               width={192}
               height={192}
               unoptimized
               className="w-full h-full object-contain mix-blend-multiply"
             />
             {/* Simulated soft shadow */}
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/10 blur-[10px] rounded-[100%]"></div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="space-y-2 mb-4">
          {/* Product Title */}
          <h2 className="text-xl font-bold text-gray-900 tracking-tight line-clamp-1" title={product.name}>
            {product.name}
          </h2>
          
          {/* Product Description */}
          <p className="text-sm text-gray-400 leading-snug pr-4 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        </div>

        {/* Price and Action Button Section */}
        <div className="flex items-center justify-between pt-2">
          {/* Price */}
          <div className="text-[22px] font-bold text-gray-900">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={() => onAddToCart?.(product)}
            className="flex items-center justify-center gap-1 bg-[#1fe88b] hover:bg-[#1ada7d] text-gray-900 font-semibold py-3 px-5 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            <span className="text-[15px]">Add to cart</span>
            <ChevronRight className="w-4 h-4 ml-1" strokeWidth={3} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;