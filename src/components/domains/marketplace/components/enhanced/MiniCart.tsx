'use client'

import { useState } from 'react'
import { Cart } from '../../types'
import { Button } from '@/components/shared/ui/button'
import { Badge } from '@/components/shared/ui/badge'
import { X, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface MiniCartProps {
  cart: Cart
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
  lastAddedItemId?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MiniCart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  lastAddedItemId,
  isOpen: controlledIsOpen,
  onOpenChange,
}: MiniCartProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalIsOpen(open)
    }
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const hasItems = cart.items.length > 0

  const handleScroll = () => {
    if (!isPinned && isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mini-cart pill (collapsed state) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-6 z-40 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 text-sm font-medium"
        aria-label={`Cart: ${itemCount} items, total ${cart.total.toFixed(2)}`}
      >
        <ShoppingBag className="w-4 h-4" />
        {hasItems && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-5 px-1.5 text-xs">
                {itemCount}
              </Badge>
              <span className="hidden sm:inline">
                {cart.items[0]?.product.currency || 'EUR'} {cart.total.toFixed(2)}
              </span>
            </span>
          </>
        )}
      </button>

      {/* Cart drawer (slide-over) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity"
            onClick={() => !isPinned && setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 h-full w-[360px] sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in"
            onScroll={handleScroll}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cart</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isPinned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}
                  title={isPinned ? 'Unpin drawer' : 'Keep open'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1h-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!hasItems ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => {
                    const isLastAdded = item.product.id === lastAddedItemId

                    return (
                      <div
                        key={item.product.id}
                        className={`flex gap-3 pb-4 border-b dark:border-gray-800 transition-colors ${
                          isLastAdded ? 'animate-flash' : ''
                        }`}
                      >
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold mb-0.5 truncate text-gray-900 dark:text-gray-100">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {item.product.catererName}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    Math.max(item.product.minOrder || 1, item.quantity - 1)
                                  )
                                }
                                className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-900 dark:text-gray-100"
                                disabled={item.quantity <= (item.product.minOrder || 1)}
                              >
                                −
                              </button>
                              <span className="text-sm font-medium w-8 text-center text-gray-900 dark:text-gray-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.quantity + 1)
                                }
                                className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-900 dark:text-gray-100"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-sm font-medium mt-2 text-gray-900 dark:text-gray-100">
                            {item.product.currency} {item.subtotal?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {hasItems && (
              <div className="border-t dark:border-gray-800 px-6 py-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {cart.items[0].product.currency} {cart.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax (19%)</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {cart.items[0].product.currency} {cart.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {cart.items[0].product.currency} {cart.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t dark:border-gray-800 text-base font-semibold">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {cart.items[0].product.currency} {cart.total.toFixed(2)}
                  </span>
                </div>

                <Button onClick={onCheckout} className="w-full" size="lg">
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes flash {
          0%,
          100% {
            background-color: transparent;
          }
          50% {
            background-color: rgb(243 244 246);
          }
        }
        .animate-flash {
          animation: flash 600ms ease-in-out;
        }
      `}</style>
    </>
  )
}
