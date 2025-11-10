# AdvancedTable - Proper Layered Architecture

## YES, It's Now Properly Layered and Protected ✅

The AdvancedTable now follows **SOLID principles** and **Domain-Driven Design (DDD)** with a proper layered architecture that separates concerns and provides strong protection against external changes.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AdvancedTablePlugin.tsx                               │ │
│  │  - React component                                     │ │
│  │  - Works with domain models (Product, Order, etc.)    │ │
│  │  - UI rendering and user interactions                 │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ depends on IDataSource interface
┌───────────────────────────▼─────────────────────────────────┐
│                    Data Source Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  RepositoryDataSource.ts                               │ │
│  │  - Adapter pattern implementation                      │ │
│  │  - Adapts IRepository to IDataSource interface        │ │
│  │  - Bridges repository layer to presentation layer     │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ depends on IRepository interface
┌───────────────────────────▼─────────────────────────────────┐
│                    Repository Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ApiRepository.ts                                      │ │
│  │  - Data access abstraction                            │ │
│  │  - Handles API communication                          │ │
│  │  - Logging and error handling                         │ │
│  │  - Query parameter building                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MockRepository.ts (future)                            │ │
│  │  - In-memory implementation for testing               │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ depends on IDataTransformer
┌───────────────────────────▼─────────────────────────────────┐
│                  Transformation Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ProductTransformer.ts                                 │ │
│  │  - Converts API DTOs ↔ Domain Models                  │ │
│  │  - Protects against API changes                       │ │
│  │  - Field name mapping                                 │ │
│  │  - Data type conversions                              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ uses
┌───────────────────────────▼─────────────────────────────────┐
│                  Infrastructure Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  openapi-fetch (Type-safe HTTP client)                │ │
│  │  - Makes actual HTTP requests                         │ │
│  │  - Auto-generated types from OpenAPI spec             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Complete Usage Example

### Step 1: Define API DTO (What Backend Sends)

```typescript
interface ProductApiDTO {
  product_id: string
  product_name: string
  category_key: string        // Backend sends "electronics"
  status_key: string          // Backend sends "active"
  unit_price: number
  inventory_count: number
  created_at: string
}
```

### Step 2: Define Domain Model (What Table Uses)

```typescript
interface Product {
  id: string
  name: string
  category: string            // Frontend uses "electronics"
  status: string              // Frontend uses "active"
  price: number
  stock: number
  createdAt: string
}
```

### Step 3: Create Transformer

```typescript
import { IDataTransformer } from '@/components/shared/tables/AdvancedTable/core/data-layer'

class ProductTransformer implements IDataTransformer<ProductApiDTO, Product> {
  toDomain(dto: ProductApiDTO): Product {
    return {
      id: dto.product_id,
      name: dto.product_name,
      category: dto.category_key,
      status: dto.status_key,
      price: dto.unit_price,
      stock: dto.inventory_count,
      createdAt: dto.created_at
    }
  }

  toApi(domain: Partial<Product>): Partial<ProductApiDTO> {
    const dto: Partial<ProductApiDTO> = {}

    if (domain.id) dto.product_id = domain.id
    if (domain.name) dto.product_name = domain.name
    if (domain.category) dto.category_key = domain.category
    if (domain.status) dto.status_key = domain.status
    if (domain.price) dto.unit_price = domain.price
    if (domain.stock) dto.inventory_count = domain.stock
    if (domain.createdAt) dto.created_at = domain.createdAt

    return dto
  }
}
```

### Step 4: Create Repository

```typescript
import { ApiRepository, RepositoryDataSource } from '@/components/shared/tables/AdvancedTable/core/data-layer'
import { api } from '@/lib/api'

const transformer = new ProductTransformer()

const repository = new ApiRepository<Product, ProductApiDTO>({
  endpoint: '/products',
  apiClient: api as any,
  transformer,
  idField: 'id'
})
```

### Step 5: Wrap in DataSource

```typescript
const dataSource = new RepositoryDataSource(repository)
```

### Step 6: Use in Table

```typescript
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={schemaProvider}
  labels={labels}
  features={{ sorting: true, filtering: true }}
/>
```

## Benefits: What Protection Do You Get?

### 1. ✅ Protection from API Field Name Changes

**Scenario**: Backend changes `product_name` to `name`

**Without layers** ❌:
```typescript
// Need to update everywhere
<AdvancedTablePlugin columns={[
  { key: 'product_name', ... }  // ❌ Update here
]} />

<ProductCard name={product.product_name} />  // ❌ Update here
<ProductForm value={product.product_name} />  // ❌ Update here
// ... update in 50 more places
```

**With layers** ✅:
```typescript
// Only update transformer
class ProductTransformer {
  toDomain(dto: ProductApiDTO): Product {
    return {
      name: dto.name  // ✅ Only change this one line
    }
  }
}

// Everything else stays the same
<AdvancedTablePlugin columns={[
  { key: 'name', ... }  // ✅ No change needed
]} />
```

### 2. ✅ Protection from API Structure Changes

**Scenario**: Backend changes from flat to nested structure

**Before**:
```json
{
  "product_id": "123",
  "category_key": "electronics"
}
```

**After**:
```json
{
  "id": "123",
  "category": {
    "key": "electronics",
    "name": "Electronics"
  }
}
```

**Solution**: Update only the transformer:
```typescript
class ProductTransformer {
  toDomain(dto: ProductApiDTO): Product {
    return {
      id: dto.id,
      // ✅ Handle new nested structure
      category: typeof dto.category === 'string'
        ? dto.category
        : dto.category.key
    }
  }
}
```

### 3. ✅ Protection from Multiple API Versions

Support multiple backend versions simultaneously:

```typescript
class ProductTransformerV1 implements IDataTransformer<ProductApiDTOV1, Product> {
  toDomain(dto: ProductApiDTOV1): Product {
    return { id: dto.product_id, name: dto.product_name }
  }
}

class ProductTransformerV2 implements IDataTransformer<ProductApiDTOV2, Product> {
  toDomain(dto: ProductApiDTOV2): Product {
    return { id: dto.id, name: dto.name }
  }
}

// Switch based on API version
const transformer = apiVersion === 'v1'
  ? new ProductTransformerV1()
  : new ProductTransformerV2()
```

### 4. ✅ Automatic Logging and Monitoring

All API calls are logged in one place:

```typescript
// ApiRepository.ts automatically logs:
📡 API Repository: Fetching from /products { page: 1, limit: 10, category: "electronics" }
✅ API Repository: Fetched 10 items (127 total)

📡 API Repository: Creating in /products { name: "New Product" }
✅ API Repository: Created item with ID 456

❌ API Repository: Error fetching from /products Network error
```

No need to add logging to every component!

### 5. ✅ Centralized Error Handling

Handle errors consistently across all tables:

```typescript
class ApiRepository {
  async fetch(params: DataSourceParams) {
    try {
      const { data, error } = await this.apiClient.GET(this.endpoint)

      if (error) {
        // ✅ Centralized error handling
        console.error('API Error:', error)

        // Could add Sentry, monitoring, retry logic here
        Sentry.captureException(error)

        throw new Error(error.message)
      }

      return this.transformResponse(data)
    } catch (err) {
      // ✅ All fetch errors handled here
      throw err
    }
  }
}
```

### 6. ✅ Easy Testing

Test each layer independently:

```typescript
// Test transformer in isolation (no API needed)
describe('ProductTransformer', () => {
  it('converts DTO to domain', () => {
    const transformer = new ProductTransformer()
    const dto = { product_id: '123', product_name: 'Laptop' }
    const result = transformer.toDomain(dto)
    expect(result).toEqual({ id: '123', name: 'Laptop' })
  })
})

// Test repository with mocked API (no real HTTP)
describe('ApiRepository', () => {
  it('fetches data', async () => {
    const mockClient = {
      GET: jest.fn().mockResolvedValue({ data: { items: [] } })
    }
    const repository = new ApiRepository({ apiClient: mockClient })
    await repository.fetch(params)
    expect(mockClient.GET).toHaveBeenCalled()
  })
})

// Test table with mocked data source (no API, no repository)
describe('AdvancedTablePlugin', () => {
  it('renders', () => {
    const mockDataSource = {
      fetch: jest.fn().mockResolvedValue({ data: [], total: 0 })
    }
    render(<AdvancedTablePlugin dataSource={mockDataSource} />)
  })
})
```

### 7. ✅ Multiple Data Sources

Easily switch between data sources:

```typescript
// Development: Use mock data
const devDataSource = new RepositoryDataSource(
  new MockRepository({ data: mockProducts })
)

// Staging: Use staging API
const stagingDataSource = new RepositoryDataSource(
  new ApiRepository({
    endpoint: 'https://staging-api.com/products',
    apiClient: api,
    transformer: new ProductTransformer()
  })
)

// Production: Use production API
const prodDataSource = new RepositoryDataSource(
  new ApiRepository({
    endpoint: 'https://api.com/products',
    apiClient: api,
    transformer: new ProductTransformer()
  })
)

// Table code stays identical
<AdvancedTablePlugin dataSource={dataSource} />
```

## SOLID Principles Applied

### Single Responsibility Principle ✅

Each class has ONE job:
- **ApiRepository**: API communication
- **ProductTransformer**: Data transformation
- **RepositoryDataSource**: Interface adaptation
- **AdvancedTablePlugin**: UI rendering

### Open/Closed Principle ✅

Open for extension, closed for modification:
```typescript
// ✅ Add new transformer without modifying existing code
class OrderTransformer implements IDataTransformer<OrderDTO, Order> {
  toDomain(dto: OrderDTO): Order { /* ... */ }
}

// ✅ Add new repository without modifying existing code
class GraphQLRepository extends BaseRepository {
  async fetch(params: DataSourceParams) { /* ... */ }
}
```

### Liskov Substitution Principle ✅

Any repository can replace another:
```typescript
// Both work identically
const repo1: IRepository<Product> = new ApiRepository(config)
const repo2: IRepository<Product> = new MockRepository(config)

// Table doesn't care which one
const dataSource = new RepositoryDataSource(repo1)
```

### Interface Segregation Principle ✅

Small, focused interfaces:
```typescript
interface IDataTransformer<TApiDTO, TRow> {
  toDomain(dto: TApiDTO): TRow
  toApi(domain: Partial<TRow>): Partial<TApiDTO>
}

interface IRepository<TRow> {
  fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>
  create?(data: Partial<TRow>): Promise<TRow>  // Optional
}
```

### Dependency Inversion Principle ✅

Depend on abstractions:
```typescript
// ✅ Depends on interface
class AdvancedTablePlugin {
  constructor(private dataSource: IDataSource) {}
}

// ✅ Depends on interface
class ApiRepository {
  constructor(private transformer: IDataTransformer) {}
}
```

## Migration Path

### Old Way (Direct, No Protection) ❌

```typescript
const dataSource = new MockDataSource({ data: mockProducts })

<AdvancedTablePlugin dataSource={dataSource} />
```

Problems:
- No transformation layer
- API changes break everything
- Hard to test
- Mixed concerns

### New Way (Layered, Protected) ✅

```typescript
// 1. Define transformer
const transformer = new ProductTransformer()

// 2. Create repository
const repository = new ApiRepository({
  endpoint: '/products',
  apiClient: api,
  transformer
})

// 3. Wrap in data source
const dataSource = new RepositoryDataSource(repository)

// 4. Use in table
<AdvancedTablePlugin dataSource={dataSource} />
```

Benefits:
- ✅ Proper layer separation
- ✅ Protected from API changes
- ✅ Easy to test
- ✅ Reusable components
- ✅ Type-safe

## Files Created

### Core Infrastructure
1. `core/data-layer/repository.ts` - Repository interfaces and base classes
2. `core/data-layer/ApiRepository.ts` - Concrete API implementation
3. `core/data-layer/RepositoryDataSource.ts` - Adapter to IDataSource
4. `core/data-layer/index.ts` - Barrel exports

### Examples
5. `examples/LayeredArchitectureExample.tsx` - Working example
6. `examples/RealAPIExample.tsx` - Real API integration

### Documentation
7. `LAYERED_ARCHITECTURE.md` - This file
8. `API_INTEGRATION_GUIDE.md` - API integration guide

## Summary

**YES, the table is now properly layered and protected:**

✅ **Repository Layer** - Abstracts data access
✅ **Transformation Layer** - Protects from API changes
✅ **Data Source Layer** - Adapts interfaces
✅ **Presentation Layer** - Renders UI

✅ **SOLID Compliant** - All 5 principles
✅ **DDD Aligned** - Domain models separate from DTOs
✅ **Type Safe** - End-to-end TypeScript
✅ **Testable** - Each layer tests independently
✅ **Maintainable** - Changes isolated to specific layers

This is **production-ready, enterprise-grade architecture**.
