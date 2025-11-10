'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/shared/ui/input'
import { Badge } from '@/components/shared/ui/badge'
import { StoreProduct } from '../../types'

export interface SearchBarProps {
  onSearch: (query: string) => void
  onSelectProduct: (product: StoreProduct) => void
  products: StoreProduct[]
  recentSearches?: string[]
  autoFocus?: boolean
}

export function SearchBar({
  onSearch,
  onSelectProduct,
  products,
  recentSearches = [],
  autoFocus = true,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.catererName.toLowerCase().includes(query.toLowerCase())
      )
    : []

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }

      if (e.key === 'Escape') {
        setQuery('')
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    onSearch(value)
    setIsOpen(value.length > 0)
    setSelectedIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredProducts.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredProducts.length - 1))
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break

      case 'Enter':
        e.preventDefault()
        if (filteredProducts[selectedIndex]) {
          handleSelectProduct(filteredProducts[selectedIndex], e.shiftKey)
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const handleSelectProduct = (product: StoreProduct, keepOpen: boolean = false) => {
    onSelectProduct(product)
    if (!keepOpen) {
      setQuery('')
      setIsOpen(false)
    }
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Type to search… (Press / to focus)"
          className="h-12 text-base pl-4 pr-32"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            <kbd className="text-xs">/</kbd>
          </Badge>
          <span className="text-xs text-gray-500">to focus</span>
        </div>
      </div>

      {recentSearches.length > 0 && !query && !isOpen && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Recent:</span>
          {recentSearches.slice(0, 5).map((search, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => handleChange(search)}
            >
              {search}
            </Badge>
          ))}
        </div>
      )}

      {isOpen && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto"
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2">
              {filteredProducts.length} result{filteredProducts.length !== 1 && 's'} • Use ↑↓ to
              navigate • Enter to add • Shift+Enter to add & continue
            </div>
            {filteredProducts.map((product, idx) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product, false)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center justify-between ${
                  idx === selectedIndex ? 'bg-brand-50 border-brand-200 border' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate">{product.catererName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      product.availability === 'available'
                        ? 'default'
                        : product.availability === 'limited'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="text-xs"
                  >
                    {product.availability}
                  </Badge>
                  <span className="font-semibold text-sm">
                    {product.currency} {product.price.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query && filteredProducts.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center"
        >
          <p className="text-sm text-gray-500">No products found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
