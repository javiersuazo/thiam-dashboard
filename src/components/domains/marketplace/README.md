# Marketplace Domain - Developer Guide

A fully-featured marketplace implementation following **Domain-Driven Design (DDD)** principles with a clean, layered architecture and **plugin pattern** for seamless backend integration.

## Quick Start

### Setup with Mock Data (Development)

```tsx
import {
  MarketplaceProvider,
  MockProductRepository,
  MockCatererRepository,
  LocalStorageCartRepository,
} from '@/components/domains/marketplace'

export default function App() {
  return (
    <MarketplaceProvider
      productRepository={new MockProductRepository()}
      catererRepository={new MockCatererRepository()}
      cartRepository={new LocalStorageCartRepository()}
    >
      {/* Your marketplace components */}
    </MarketplaceProvider>
  )
}
```

### Setup with Real API (Production)

```tsx
import {
  MarketplaceProvider,
  LocalStorageCartRepository,
} from '@/components/domains/marketplace'
import { ApiProductRepository } from '@/lib/api/marketplace/products'
import { ApiCatererRepository } from '@/lib/api/marketplace/caterers'

export default function App() {
  return (
    <MarketplaceProvider
      productRepository={new ApiProductRepository()}
      catererRepository={new ApiCatererRepository()}
      cartRepository={new LocalStorageCartRepository()}
    >
      {/* Your marketplace components */}
    </MarketplaceProvider>
  )
}
```

## Architecture Overview

The marketplace follows a **three-layer architecture**:

```
┌─────────────────────────────────────────────┐
│       PRESENTATION LAYER                     │
│  - React Components                          │
│  - Custom Hooks                              │
│  - UI State Management                       │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│       BUSINESS LOGIC LAYER                   │
│  - Services (Product, Cart, Caterer)        │
│  - Domain Logic                              │
│  - Use Cases                                 │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          DATA LAYER                          │
│  - Repository Interfaces                     │
│  - Adapters (Mock, API, LocalStorage)      │
│  - Data Transformation                       │
└─────────────────────────────────────────────┘
```

### Benefits

- ✅ **Plug & Play**: Swap data sources without changing business logic or UI
- ✅ **Type Safe**: Full TypeScript support across all layers
- ✅ **Testable**: Each layer can be tested independently
- ✅ **Flexible**: Mix mock and real data sources
- ✅ **DDD Compliant**: Domain models are the source of truth
- ✅ **SOLID**: Follows all five SOLID principles

## Folder Structure

```
src/components/domains/marketplace/
├── types/
│   ├── domain.ts              # Core domain models
│   └── index.ts               # Legacy types
│
├── repositories/              # Data layer contracts
│   ├── IProductRepository.ts
│   ├── ICatererRepository.ts
│   └── ICartRepository.ts
│
├── adapters/                  # Data layer implementations
│   ├── MockProductRepository.ts
│   ├── MockCatererRepository.ts
│   ├── LocalStorageCartRepository.ts
│   └── ApiProductRepository.ts         # Example
│
├── services/                  # Business logic layer
│   ├── ProductService.ts
│   ├── CartService.ts
│   └── CatererService.ts
│
├── providers/
│   └── MarketplaceProvider.tsx  # React Context + DI
│
├── hooks/                     # Presentation layer hooks
│   ├── useProducts.ts
│   ├── useCaterers.ts
│   └── useProductSearch.ts
│
├── components/                # Presentation layer
│   ├── enhanced/
│   ├── store/
│   └── forms/
│
└── index.ts                   # Public API
```

## Core Concepts

### 1. Domain Models

Domain models represent your business entities:

```typescript
// Product entity
interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  tags: string[]
  catererId: string
  catererName: string
  // ...
}

// Cart aggregate
interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  itemCount: number
}
```

### 2. Repository Pattern

Repositories abstract data access:

```typescript
// Interface (contract)
interface IProductRepository {
  getAll(params?: PaginationParams): Promise<PaginatedResult<Product>>
  getById(id: string): Promise<Product | null>
  filter(filters: MarketplaceFilters): Promise<PaginatedResult<Product>>
}

// Mock implementation
class MockProductRepository implements IProductRepository {
  async getAll(params) {
    return { items: mockProducts, total: mockProducts.length, ... }
  }
}

// Real API implementation
class ApiProductRepository implements IProductRepository {
  async getAll(params) {
    const { data } = await api.GET('/marketplace/products')
    return this.transformApiResponse(data)
  }
}
```

### 3. Service Layer

Services contain business logic:

```typescript
class CartService {
  constructor(private readonly repository: ICartRepository) {}

  async addToCart(product: Product, quantity: number): Promise<Cart> {
    // Business rule: enforce minimum order
    const validQuantity = Math.max(product.minOrder || 1, quantity)

    const item: CartItem = {
      product,
      quantity: validQuantity,
      subtotal: product.price * validQuantity,
    }

    return this.repository.add(item)
  }
}
```

### 4. Provider Pattern

The provider injects dependencies via React Context:

```tsx
<MarketplaceProvider
  productRepository={new MockProductRepository()}
  catererRepository={new MockCatererRepository()}
  cartRepository={new LocalStorageCartRepository()}
>
  {children}
</MarketplaceProvider>
```

## Usage Examples

### Using the Context Hook

```tsx
import { useMarketplace } from '@/components/domains/marketplace'

function MyComponent() {
  const {
    productService,
    cartService,
    cart,
    filters,
    addToCart,
    removeFromCart,
    updateQuantity,
  } = useMarketplace()

  // Cart state is reactive
  console.log(cart.items, cart.total)

  // Add to cart (enforces min order)
  const handleAdd = () => addToCart(product, 5)

  // Use service methods directly
  const loadProducts = async () => {
    const result = await productService.filterProducts(filters)
    console.log(result.items)
  }
}
```

### Using Custom Hooks

```tsx
import { useProducts } from '@/components/domains/marketplace'

function ProductList() {
  const { data, isLoading, error, refetch } = useProducts({
    page: 1,
    pageSize: 12,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.items.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Grouping Products by Caterer

```tsx
import { useProducts, useCaterers } from '@/components/domains/marketplace'

function CatererView() {
  const { data } = useProducts()
  const caterers = useCaterers(data?.items || [])

  return (
    <div>
      {caterers.map(caterer => (
        <div key={caterer.catererId}>
          <h2>{caterer.catererName}</h2>
          <div>
            {caterer.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Creating Custom Adapters

### Step 1: Implement the Interface

```typescript
import { IProductRepository } from '../repositories/IProductRepository'
import { Product, PaginatedResult } from '../types/domain'

export class MyApiRepository implements IProductRepository {
  constructor(private baseUrl: string, private apiKey: string) {}

  async getAll(params) {
    const response = await fetch(`${this.baseUrl}/products`, {
      headers: { 'X-API-Key': this.apiKey },
    })
    const data = await response.json()

    return {
      items: data.products.map(this.transform),
      total: data.total,
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      totalPages: Math.ceil(data.total / (params?.pageSize || 12)),
    }
  }

  async getById(id: string) {
    const response = await fetch(`${this.baseUrl}/products/${id}`)
    const data = await response.json()
    return this.transform(data)
  }

  private transform(apiProduct: any): Product {
    return {
      id: apiProduct.product_id,
      name: apiProduct.title,
      description: apiProduct.desc,
      price: apiProduct.price_cents / 100,
      currency: apiProduct.currency || 'EUR',
      category: apiProduct.category_name,
      tags: apiProduct.tags || [],
      imageUrl: apiProduct.image_url,
      availability: apiProduct.in_stock ? 'available' : 'out_of_stock',
      stock: apiProduct.stock_quantity,
      minOrder: apiProduct.minimum_order || 1,
      preparationTime: apiProduct.prep_time || '2h',
      leadTime: apiProduct.lead_time || '24h',
      catererId: apiProduct.caterer_id,
      catererName: apiProduct.caterer_name,
      rating: apiProduct.avg_rating,
      reviewCount: apiProduct.num_reviews,
    }
  }

  // Implement other interface methods...
}
```

### Step 2: Use Your Adapter

```tsx
<MarketplaceProvider
  productRepository={new MyApiRepository('https://api.example.com', 'YOUR_API_KEY')}
  catererRepository={new MockCatererRepository()}
  cartRepository={new LocalStorageCartRepository()}
>
  {children}
</MarketplaceProvider>
```

## Data Transformation Strategy

The **Data Layer** is responsible for transforming external data (API responses, database records) into clean **Domain Models**.

### Why Transform?

- API response structure may change → Domain model stays stable
- Multiple APIs may have different formats → One unified model
- Backend uses snake_case → Frontend uses camelCase
- API includes extra fields → Domain model only has what we need

### Example Transformation

```typescript
// API Response (what backend sends)
{
  "product_id": "abc123",
  "title": "Deluxe Burger",
  "price_cents": 1299,
  "caterer_id": "cat456",
  "caterer_name": "Burger House",
  "image_url": "https://...",
  "in_stock": true,
  "avg_rating": 4.5
}

// Domain Model (what our app uses)
{
  id: "abc123",
  name: "Deluxe Burger",
  price: 12.99,
  catererId: "cat456",
  catererName: "Burger House",
  imageUrl: "https://...",
  availability: "available",
  rating: 4.5
}
```

## Available Adapters

### MockProductRepository
- **Purpose**: Development and testing
- **Data Source**: In-memory mock data
- **Use Case**: When backend isn't ready yet

### MockCatererRepository
- **Purpose**: Development and testing
- **Data Source**: Derived from mock products
- **Use Case**: When backend isn't ready yet

### LocalStorageCartRepository
- **Purpose**: Client-side cart persistence
- **Data Source**: Browser localStorage
- **Use Case**: Production (cart data doesn't need server)

### ApiProductRepository (Example)
- **Purpose**: Production
- **Data Source**: Real backend API
- **Use Case**: When backend is ready

## Service Layer API

### ProductService

```typescript
productService.getProducts(params?)
productService.getProductById(id)
productService.searchProducts(query, params?)
productService.filterProducts(filters, params?)
productService.getProductsByCaterer(catererId, params?)
productService.getAvailableCategories()
productService.getAvailableTags()
productService.groupProductsByCaterer(products)
```

### CartService

```typescript
cartService.getCart()
cartService.addToCart(product, quantity)
cartService.removeFromCart(productId)
cartService.updateQuantity(productId, quantity)
cartService.clearCart()
cartService.getItemCount()
cartService.getTotal()
cartService.isProductInCart(cart, productId)
cartService.getProductQuantity(cart, productId)
```

### CatererService

```typescript
catererService.getCaterers(params?)
catererService.getCatererById(id)
catererService.searchCaterers(query, params?)
```

## Type Definitions

### Product

```typescript
interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  tags: string[]
  imageUrl?: string
  availability: 'available' | 'unavailable' | 'out_of_stock'
  stock: number
  minOrder: number
  preparationTime: string
  leadTime: string
  catererId: string
  catererName: string
  rating?: number
  reviewCount?: number
}
```

### Cart

```typescript
interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  taxRate: number
  deliveryFee: number
  total: number
  itemCount: number
}

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}
```

### Filters

```typescript
interface MarketplaceFilters {
  categories: string[]
  tags: string[]
  availability?: 'available' | 'unavailable' | 'out_of_stock'
  minPrice?: number
  maxPrice?: number
  catererId?: string
  searchQuery?: string
}
```

### Pagination

```typescript
interface PaginationParams {
  page: number
  pageSize: number
}

interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

## Advanced Patterns

### Hybrid Data Sources

Mix mock and real data:

```tsx
<MarketplaceProvider
  productRepository={new ApiProductRepository()}        // Real API
  catererRepository={new MockCatererRepository()}       // Mock data
  cartRepository={new LocalStorageCartRepository()}     // localStorage
>
  {children}
</MarketplaceProvider>
```

### Conditional Data Sources

Switch based on environment:

```tsx
const productRepo = process.env.NODE_ENV === 'production'
  ? new ApiProductRepository()
  : new MockProductRepository()

<MarketplaceProvider
  productRepository={productRepo}
  catererRepository={new MockCatererRepository()}
  cartRepository={new LocalStorageCartRepository()}
>
  {children}
</MarketplaceProvider>
```

### Testing with Mocks

```tsx
import { render } from '@testing-library/react'
import { MarketplaceProvider, MockProductRepository } from '@/components/domains/marketplace'

test('displays products', async () => {
  render(
    <MarketplaceProvider
      productRepository={new MockProductRepository()}
      catererRepository={new MockCatererRepository()}
      cartRepository={new LocalStorageCartRepository()}
    >
      <ProductList />
    </MarketplaceProvider>
  )

  // assertions...
})
```

## Migration from Old Store

The old Zustand store (`useMarketplaceStore`) is still available but deprecated.

**Before**:
```tsx
import { useMarketplaceStore } from '@/components/domains/marketplace'

function MyComponent() {
  const { cart, addToCart, filters, setFilters } = useMarketplaceStore()
}
```

**After**:
```tsx
import { useMarketplace } from '@/components/domains/marketplace'

function MyComponent() {
  const { cart, addToCart, filters, setFilters } = useMarketplace()
}
```

The API is intentionally similar to ease migration.

## Best Practices

1. **Always use the Provider**: Wrap your app with `MarketplaceProvider`
2. **Use hooks in components**: `useMarketplace()`, `useProducts()`, etc.
3. **Business logic in services**: Don't duplicate logic in components
4. **Transform data in adapters**: Keep domain models clean
5. **Type everything**: Leverage TypeScript for safety
6. **Test with mocks**: Use MockRepositories for unit tests
7. **Separate concerns**: Respect layer boundaries

## Troubleshooting

### "useMarketplace must be used within MarketplaceProvider"

Ensure your component tree is wrapped with `MarketplaceProvider`.

### Types don't match

Make sure your adapter's `transform` method returns the correct domain model shape.

### Cart not persisting

Check that you're using `LocalStorageCartRepository` and localStorage is available.

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed forms architecture documentation
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
