'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  useMarketplaceStore,
  useFilteredProducts,
  StoreProduct,
} from '@/components/domains/marketplace'
import { SearchBar } from '@/components/domains/marketplace/components/enhanced/SearchBar'
import { CartSidebar } from '@/components/domains/marketplace/components/enhanced/CartSidebar'
import { FilterPane } from '@/components/domains/marketplace/components/enhanced/FilterPane'
import { ProductCard } from '@/components/domains/marketplace/components/store/ProductCard'
import { mockProducts } from '@/components/domains/marketplace/mocks/products'
import { Button } from '@/components/shared/ui/button'
import { Badge } from '@/components/shared/ui/badge'

export default function MarketplaceEnhancedPage() {
  const {
    cart,
    filters,
    addToCart,
    removeFromCart,
    updateQuantity,
    setFilters,
    resetFilters,
  } = useMarketplaceStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false)
  const [lastAddedItemId, setLastAddedItemId] = useState<string | undefined>()
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const announcementRef = useRef<HTMLDivElement>(null)

  const filteredProducts = useFilteredProducts(mockProducts, filters)

  const searchFilteredProducts = searchQuery.trim()
    ? filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.catererName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts

  const availableCategories = useMemo(
    () => Array.from(new Set(mockProducts.map((p) => p.category))),
    []
  )

  const availableTags = useMemo(
    () => Array.from(new Set(mockProducts.flatMap((p) => p.tags))),
    []
  )

  const handleAddToCart = (product: StoreProduct, quantity: number = 1) => {
    addToCart(product, quantity)
    setLastAddedItemId(product.id)

    if (announcementRef.current) {
      announcementRef.current.textContent = `Added ${product.name} to cart`
    }

    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev].slice(0, 5))
    }

    setTimeout(() => {
      setLastAddedItemId(undefined)
    }, 650)
  }

  const handleCheckout = () => {
    alert('Checkout flow would open here (inline or slide-in pane)')
  }

  useEffect(() => {
    const handleOpenFilterPane = () => setIsFilterPaneOpen(true)
    document.addEventListener('openFilterPane', handleOpenFilterPane)
    return () => document.removeEventListener('openFilterPane', handleOpenFilterPane)
  }, [])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Thiago Marketplace</h1>
              <Badge variant="secondary" className="text-xs">
                Enhanced
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {itemCount} item{itemCount !== 1 && 's'} • {cart.items[0]?.product.currency || 'EUR'}{' '}
                {cart.total.toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                title="Help"
              >
                ?
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            onSelectProduct={(product) => handleAddToCart(product, product.minOrder || 1)}
            products={mockProducts}
            recentSearches={recentSearches}
            autoFocus={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {searchQuery
                    ? `Search results for "${searchQuery}"`
                    : 'All Products'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {searchFilteredProducts.length} product
                  {searchFilteredProducts.length !== 1 && 's'} found
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterPaneOpen(true)}
                className="gap-2"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                  ]
                </kbd>
              </Button>
            </div>

            {searchFilteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); resetFilters(); }}>
                  Clear Search & Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchFilteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <CartSidebar
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              lastAddedItemId={lastAddedItemId}
            />
          </div>
        </div>
      </div>

      <footer className="bg-white border-t mt-16 py-4 sticky bottom-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-gray-600">
                {itemCount} item{itemCount !== 1 && 's'}
              </span>
              <span className="text-gray-600">•</span>
              <span className="font-semibold">
                Total: {cart.items[0]?.product.currency || 'EUR'} {cart.total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Shortcuts:</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">/</kbd>
              <span>Search</span>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">]</kbd>
              <span>Filters</span>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </footer>

      <FilterPane
        isOpen={isFilterPaneOpen}
        onClose={() => setIsFilterPaneOpen(false)}
        filters={filters}
        availableCategories={availableCategories}
        availableTags={availableTags}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
    </div>
  )
}
