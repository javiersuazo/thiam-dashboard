'use client'

import Image from 'next/image'
import { StoreProduct } from '../../types'
import { Button } from '@/components/shared/ui/button'
import { Badge } from '@/components/shared/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/shared/ui/card'

export interface ProductCardProps {
  product: StoreProduct
  onAddToCart: (product: StoreProduct, quantity: number) => void
  onViewDetails?: (product: StoreProduct) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const isAvailable = product.availability === 'available'
  const isLimited = product.availability === 'limited'

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-2">
            {!isAvailable && (
              <Badge variant="destructive" className="text-xs">
                Unavailable
              </Badge>
            )}
            {isLimited && (
              <Badge variant="secondary" className="text-xs">
                Limited Stock
              </Badge>
            )}
          </div>

          {product.rating && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-xs text-gray-500">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.catererName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          {product.preparationTime && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {product.preparationTime}
            </span>
          )}
        </div>

        <div className="pt-2">
          <span className="text-2xl font-bold text-gray-900">
            {product.currency} {product.price.toFixed(2)}
          </span>
          {product.minOrder && product.minOrder > 1 && (
            <p className="text-xs text-gray-500 mt-1">Min. order: {product.minOrder}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1"
          onClick={() => onAddToCart(product, product.minOrder || 1)}
          disabled={!isAvailable}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Add to Cart
        </Button>
        {onViewDetails && (
          <Button variant="outline" size="icon" onClick={() => onViewDetails(product)}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
