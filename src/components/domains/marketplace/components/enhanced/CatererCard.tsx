'use client'

import { useRef } from 'react'
import { StoreProduct } from '../../types'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '../store/ProductCard'

interface CatererCardProps {
  catererId: string
  catererName: string
  products: StoreProduct[]
  onAddToCart: (product: StoreProduct, quantity: number) => void
  onProductClick: (product: StoreProduct) => void
}

export function CatererCard({
  catererId,
  catererName,
  products,
  onAddToCart,
  onProductClick,
}: CatererCardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const avgRating =
    products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.filter((p) => p.rating).length
  const totalReviews = products.reduce((sum, p) => sum + (p.reviewCount || 0), 0)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const newPosition =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="mb-10">
      {/* Caterer Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{catererName}</h2>
          <p className="text-sm text-gray-600 mt-0.5">{products.length} dishes</p>
        </div>

        {avgRating > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 rounded-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
            {totalReviews > 0 && (
              <span className="text-xs text-gray-500">({totalReviews})</span>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[240px] snap-start">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onProductClick}
                density="compact"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
