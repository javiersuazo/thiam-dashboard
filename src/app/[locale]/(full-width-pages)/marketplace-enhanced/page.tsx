'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useMarketplaceStore,
  useFilteredProducts,
  StoreProduct,
} from '@/components/domains/marketplace'
import { MiniCart } from '@/components/domains/marketplace/components/enhanced/MiniCart'
import { FilterChipRail } from '@/components/domains/marketplace/components/enhanced/FilterChipRail'
import { ProductCard } from '@/components/domains/marketplace/components/store/ProductCard'
import { ProductDetailModal } from '@/components/domains/marketplace/components/enhanced/ProductDetailModal'
import { CatererCard } from '@/components/domains/marketplace/components/enhanced/CatererCard'
import { mockProducts } from '@/components/domains/marketplace/mocks/products'
import { Button } from '@/components/shared/ui/button'
import { Pagination } from '@/components/shared/ui/pagination'
import { LayoutGrid, LayoutList, Utensils, Store } from 'lucide-react'

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
  const [lastAddedItemId, setLastAddedItemId] = useState<string | undefined>()
  const [density, setDensity] = useState<'standard' | 'compact'>('standard')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [viewMode, setViewMode] = useState<'products' | 'caterers'>('products')
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const filteredProducts = useFilteredProducts(mockProducts, filters)

  const searchFilteredProducts = searchQuery.trim()
    ? filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.catererName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts

  const totalProducts = searchFilteredProducts.length
  const totalPages = Math.ceil(totalProducts / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedProducts = searchFilteredProducts.slice(startIndex, endIndex)

  const catererGroups = useMemo(() => {
    const groups = new Map<string, { catererId: string; catererName: string; products: StoreProduct[] }>()

    searchFilteredProducts.forEach((product) => {
      if (!groups.has(product.catererId)) {
        groups.set(product.catererId, {
          catererId: product.catererId,
          catererName: product.catererName,
          products: [],
        })
      }
      groups.get(product.catererId)!.products.push(product)
    })

    return Array.from(groups.values())
  }, [searchFilteredProducts])

  const totalCaterers = catererGroups.length
  const catererTotalPages = Math.ceil(totalCaterers / pageSize)
  const paginatedCaterers = catererGroups.slice(startIndex, endIndex)

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

    if (cart.items.length === 0) {
      setIsCartOpen(true)
    }

    setTimeout(() => {
      setLastAddedItemId(undefined)
    }, 650)
  }

  const router = useRouter()

  const handleCheckout = () => {
    router.push('/en/marketplace-checkout')
  }

  const handleProductClick = (product: StoreProduct) => {
    setSelectedProduct(product)
    setIsDetailModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  const gridCols = density === 'compact' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
  const maxWidth = 'max-w-[1360px]'
  const gutters = 'px-4'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mini-cart pill */}
      <MiniCart
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        lastAddedItemId={lastAddedItemId}
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
      />

      {/* Filter chip rail */}
      <FilterChipRail
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={availableCategories}
        availableTags={availableTags}
        onReset={resetFilters}
      />

      {/* Main content */}
      <main className={`${maxWidth} mx-auto ${gutters} py-6`}>
        {/* Results header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {searchQuery ? `Results for "${searchQuery}"` : viewMode === 'products' ? 'All Dishes' : 'All Caterers'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {viewMode === 'products'
                  ? `${totalProducts} dish${totalProducts !== 1 ? 'es' : ''} available`
                  : `${totalCaterers} caterer${totalCaterers !== 1 ? 's' : ''} • ${totalProducts} dishes total`
                }
              </p>
            </div>

            {/* View mode and density toggles */}
            <div className="flex items-center gap-4">
              {/* View mode toggle */}
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'products' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('products')
                    setCurrentPage(1)
                  }}
                  className="gap-2 h-8"
                >
                  <Utensils className="w-4 h-4" />
                  <span className="hidden sm:inline">Dishes</span>
                </Button>
                <Button
                  variant={viewMode === 'caterers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('caterers')
                    setCurrentPage(1)
                  }}
                  className="gap-2 h-8"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Caterers</span>
                </Button>
              </div>

              {/* Density toggle (only for products view) */}
              {viewMode === 'products' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={density === 'standard' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setDensity('standard')}
                    className="gap-2 h-8"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">4-col</span>
                  </Button>
                  <Button
                    variant={density === 'compact' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setDensity('compact')}
                    className="gap-2 h-8"
                  >
                    <LayoutList className="w-4 h-4" />
                    <span className="hidden sm:inline">5-col</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        {(viewMode === 'products' ? totalProducts : totalCaterers) === 0 ? (
          <div className="text-center py-24">
            <svg
              className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700 mb-4"
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No results found</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  resetFilters()
                }}
              >
                Clear all filters
              </Button>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          </div>
        ) : viewMode === 'products' ? (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${gridCols} gap-4`}
              style={{ gap: '16px' }}
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleProductClick}
                  density={density}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalItems={totalProducts}
                pageSizeOptions={[12, 24, 48]}
              />
            )}
          </>
        ) : (
          <>
            {paginatedCaterers.map((caterer) => (
              <CatererCard
                key={caterer.catererId}
                catererId={caterer.catererId}
                catererName={caterer.catererName}
                products={caterer.products}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}

            {/* Pagination */}
            {catererTotalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={catererTotalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalItems={totalCaterers}
                pageSizeOptions={[12, 24, 48]}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 mt-16 py-6">
        <div className={`${maxWidth} mx-auto ${gutters}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              © 2025 Thiago Marketplace · Made with care
            </div>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <button className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Support</button>
              <button className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Terms</button>
              <button className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Privacy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedProduct(null)
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
