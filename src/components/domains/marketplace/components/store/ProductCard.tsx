'use client'

import { useState } from 'react'
import Image from 'next/image'
import { StoreProduct } from '../../types'
import { Button } from '@/components/shared/ui/button'
import { Badge } from '@/components/shared/ui/badge'
import { Heart, Plus } from 'lucide-react'

export interface ProductCardProps {
  product: StoreProduct
  onAddToCart: (product: StoreProduct, quantity: number) => void
  onViewDetails?: (product: StoreProduct) => void
  density?: 'standard' | 'compact'
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  density = 'standard',
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showQuantityPicker, setShowQuantityPicker] = useState(false)

  const isAvailable = product.availability === 'available'
  const isLimited = product.availability === 'limited'
  const imageHeight = density === 'compact' ? 'h-[140px] sm:h-[152px]' : 'h-[168px] sm:h-[184px]'

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowQuantityPicker(true)
  }

  const handleQuickAdd = (qty: number) => {
    onAddToCart(product, qty)
    setShowQuantityPicker(false)
  }

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className={`relative ${imageHeight} w-full overflow-hidden bg-gray-100`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Top overlays */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isLimited && (
            <Badge className="bg-white text-gray-900 text-xs h-6 px-2 shadow-sm">
              Limited today
            </Badge>
          )}
          {product.rating && product.rating >= 4.5 && (
            <Badge className="bg-white text-gray-900 text-xs h-6 px-2 shadow-sm">
              Guest favorite
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          />
        </button>

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Unavailable
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title & Provider */}
        <h3 className="font-semibold text-[16px] leading-tight line-clamp-1 mb-0.5 text-gray-900">
          {product.name}
        </h3>
        <a
          href="#"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-gray-500 hover:text-gray-900 hover:underline inline-block mb-2"
        >
          {product.catererName}
        </a>

        {/* Availability info */}
        {product.leadTime && (
          <p className="text-xs text-gray-500 mb-2">Lead {product.leadTime}</p>
        )}

        {/* Meta chips */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap text-xs text-gray-600">
          {product.rating && (
            <span className="inline-flex items-center gap-0.5">
              ⭐ {product.rating.toFixed(1)}
            </span>
          )}
          {product.reviewCount && (
            <>
              <span>·</span>
              <span>{product.reviewCount}</span>
            </>
          )}
          {product.preparationTime && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5">
                🕒 {product.preparationTime}
              </span>
            </>
          )}
          {product.minOrder && (
            <>
              <span>•</span>
              <span>Min {product.minOrder}</span>
            </>
          )}
        </div>

        {/* Price & Add button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-base text-gray-900">
              {product.currency} {product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 ml-1">· per serving</span>
          </div>

          {isAvailable && (
            <div className="relative">
              <Button
                onClick={handleAddClick}
                size="sm"
                className="h-8 px-3 text-xs font-medium group-hover:bg-gray-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>

              {/* Quantity popper */}
              {showQuantityPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowQuantityPicker(false)
                    }}
                  />
                  <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg py-2 z-50 whitespace-nowrap">
                    {[10, 20, 30, 50].map((qty) => (
                      <button
                        key={qty}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuickAdd(qty)
                        }}
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                      >
                        {qty} servings
                      </button>
                    ))}
                    <div className="border-t my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickAdd(product.minOrder || 1)
                      }}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors text-gray-600"
                    >
                      Custom amount
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
