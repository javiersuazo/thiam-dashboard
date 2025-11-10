'use client'

import { useEffect, useRef } from 'react'
import { Cart, CartItem as ICartItem } from '../../types'
import { Button } from '@/components/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/shared/ui/card'
import { Separator } from '@/components/shared/ui/separator'
import { Badge } from '@/components/shared/ui/badge'

export interface CartSidebarProps {
  cart: Cart
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
  lastAddedItemId?: string
}

export function CartSidebar({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  lastAddedItemId,
}: CartSidebarProps) {
  const lastAddedRef = useRef<HTMLDivElement>(null)
  const quantityRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  useEffect(() => {
    if (lastAddedItemId && lastAddedRef.current) {
      lastAddedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })

      const input = quantityRefs.current.get(lastAddedItemId)
      if (input) {
        setTimeout(() => {
          input.focus()
          input.select()
        }, 650)
      }
    }
  }, [lastAddedItemId])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="sticky top-4 h-[calc(100vh-2rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Cart</CardTitle>
            <Badge variant="secondary">{itemCount} items</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          {cart.items.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-sm text-gray-500">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Use search to add items</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  ref={item.product.id === lastAddedItemId ? lastAddedRef : null}
                  className={`border rounded-lg p-3 transition-all duration-600 ${
                    item.product.id === lastAddedItemId
                      ? 'bg-brand-50 border-brand-200 animate-flash'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{item.product.catererName}</p>
                      <p className="text-sm font-semibold mt-1">
                        {item.product.currency} {item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= (item.product.minOrder || 1)}
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        ref={(el) => {
                          if (el) quantityRefs.current.set(item.product.id, el)
                        }}
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-12 h-7 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                        min={item.product.minOrder || 1}
                        max={item.product.maxOrder || 999}
                      />
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={
                          item.product.maxOrder ? item.quantity >= item.product.maxOrder : false
                        }
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      {item.product.currency} {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="flex-col space-y-3 pt-3">
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {cart.items[0]?.product.currency || 'EUR'} {cart.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">
                {cart.items[0]?.product.currency || 'EUR'} {cart.deliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">
                {cart.items[0]?.product.currency || 'EUR'} {cart.tax.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold pt-1">
              <span>Total</span>
              <span className="text-lg">
                {cart.items[0]?.product.currency || 'EUR'} {cart.total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="w-full h-11"
            onClick={onCheckout}
            disabled={cart.items.length === 0}
          >
            Proceed to Checkout
          </Button>

          <p className="text-xs text-center text-gray-500">
            Secure checkout • Free returns
          </p>
        </CardFooter>
      </Card>

      <style jsx>{`
        @keyframes flash {
          0%,
          100% {
            background-color: transparent;
          }
          50% {
            background-color: var(--color-brand-50);
          }
        }

        .animate-flash {
          animation: flash 600ms ease-in-out;
        }
      `}</style>
    </div>
  )
}
