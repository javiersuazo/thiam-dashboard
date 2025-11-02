'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Heart, Clock, Users, Star, Info } from 'lucide-react'
import { StoreProduct } from '../../types'
import { Button } from '@/components/shared/ui/button'
import { Badge } from '@/components/shared/ui/badge'

interface ProductDetailModalProps {
  product: StoreProduct | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: StoreProduct, quantity: number) => void
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product || !isOpen) return null

  const isAvailable = product.availability === 'available'
  const isLimited = product.availability === 'limited'

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Left: Image */}
          <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isLimited && (
                <Badge className="bg-white text-gray-900 shadow-sm">Limited today</Badge>
              )}
              {product.rating && product.rating >= 4.5 && (
                <Badge className="bg-white text-gray-900 shadow-sm">Guest favorite</Badge>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
              />
            </button>
          </div>

          {/* Right: Content */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h2>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-base text-gray-600 hover:text-gray-900 hover:underline"
              >
                by {product.catererName}
              </a>
            </div>

            {/* Rating & Reviews */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                </div>
                {product.reviewCount && (
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount} review{product.reviewCount !== 1 && 's'})
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.preparationTime && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Prep time</p>
                    <p className="text-sm font-medium text-gray-900">{product.preparationTime}</p>
                  </div>
                </div>
              )}
              {product.leadTime && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Info className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Lead time</p>
                    <p className="text-sm font-medium text-gray-900">{product.leadTime}</p>
                  </div>
                </div>
              )}
              {product.minOrder && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Min order</p>
                    <p className="text-sm font-medium text-gray-900">{product.minOrder} servings</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Badge variant="outline" className="text-sm">
                  {product.category}
                </Badge>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Availability notice */}
            {!isAvailable && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Currently unavailable</p>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price & Add to Cart */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price per serving</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {product.currency} {product.price.toFixed(2)}
                  </p>
                </div>

                {isAvailable && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(product.minOrder || 1, quantity - 1))}
                      disabled={quantity <= (product.minOrder || 1)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                    >
                      −
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {isAvailable && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Subtotal ({quantity} servings)</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.currency} {(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
