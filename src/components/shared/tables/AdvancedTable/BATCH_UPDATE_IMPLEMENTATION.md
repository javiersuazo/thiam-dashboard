# Batch Update Implementation

## Overview
Added `batchUpdate` method to `ApiRepository` to support bulk updating of multiple rows in a single API call. This completes the full CRUD + bulk operations support in the AdvancedTable component.

## Implementation

### ApiRepository.batchUpdate()

**Location**: `/src/components/shared/tables/AdvancedTable/core/data-layer/ApiRepository.ts` (lines 165-204)

**Method Signature**:
```typescript
async batchUpdate(
  updates: Record<string, Partial<TRow>>
): Promise<BulkOperationResult>
```

**Parameters**:
- `updates`: Object mapping row IDs to their partial update data
  - Example: `{ "1": { name: "New Name" }, "2": { price: 99.99 } }`

**Returns**:
```typescript
interface BulkOperationResult {
  success: boolean
  affected: number
  errors?: Array<{ id: string; message: string }>
}
```

### How It Works

1. **Transform Updates**: Converts domain model updates to API DTOs using the transformer
   ```typescript
   const transformedUpdates = Object.entries(updates).map(([id, changes]) => ({
     id,
     changes: this.transformer.toApi(changes)
   }))
   ```

2. **API Call**: Makes a single `PATCH /api/v1/{resource}/bulk` request
   ```typescript
   const { data, error } = await this.apiClient.PATCH(`${this.endpoint}/bulk`, {
     body: { updates: transformedUpdates }
   })
   ```

3. **Fallback on Error**: If the bulk endpoint fails, automatically falls back to individual updates
   ```typescript
   const results = await Promise.allSettled(
     Object.entries(updates).map(([id, changes]) => this.update(id, changes))
   )
   ```

4. **Error Collection**: Tracks which individual updates failed and returns error details
   ```typescript
   const errors = results
     .filter(r => r.status === 'rejected')
     .map(({ result, id }) => ({ id, message: result.reason?.message }))
   ```

## API Specification

### Request Format

**Endpoint**: `PATCH /api/v1/{resource}/bulk`

**Body**:
```json
{
  "updates": [
    {
      "id": "prod_123",
      "changes": {
        "product_name": "Updated Name",
        "unit_price": 99.99
      }
    },
    {
      "id": "prod_456",
      "changes": {
        "inventory_count": 50
      }
    }
  ]
}
```

### Response Format

**Success**:
```json
{
  "affected": 2
}
```

**Partial Success**:
```json
{
  "affected": 1,
  "errors": [
    {
      "id": "prod_456",
      "message": "Insufficient permissions"
    }
  ]
}
```

## Usage Example

### With ApiRepository

```typescript
import { ApiRepository } from '@/components/shared/tables/AdvancedTable/core/data-layer'
import { api } from '@/lib/api'
import { ProductTransformer } from './ProductTransformer'

const repository = new ApiRepository({
  endpoint: '/products',
  apiClient: api,
  transformer: new ProductTransformer(),
})

const result = await repository.batchUpdate({
  'prod_123': { name: 'Updated Product', price: 99.99 },
  'prod_456': { stock: 50 },
  'prod_789': { inStock: false },
})

console.log(`Updated ${result.affected} products`)
if (result.errors) {
  console.error('Some updates failed:', result.errors)
}
```

### With RepositoryDataSource

```typescript
import { RepositoryDataSource } from '@/components/shared/tables/AdvancedTable/core/data-layer'

const dataSource = new RepositoryDataSource(repository)

const result = await dataSource.batchUpdate({
  'prod_123': { name: 'Updated Product', price: 99.99 },
  'prod_456': { stock: 50 },
})
```

## Comparison with Other Data Sources

### MockDataSource
**Implementation**: Lines 160-177 in `MockDataSource.ts`
- Iterates through in-memory data array
- Updates matching rows directly
- No API calls, instant updates

### LocalStorageDataSource
**Implementation**: Line 150 in `LocalStorageDataSource.ts`
- Similar to MockDataSource but persists to localStorage
- Updates in-memory then saves to storage

### ApiRepository
**Implementation**: Lines 165-204 in `ApiRepository.ts`
- Makes HTTP PATCH request to bulk endpoint
- Transforms data to API format
- Automatic fallback to individual updates
- Error tracking and reporting

## Features

### ✅ Data Transformation
- Automatically converts domain models to API DTOs using the provided transformer
- Each update goes through `transformer.toApi()` before sending to the API

### ✅ Fallback Strategy
- If the bulk endpoint fails, automatically retries with individual `update()` calls
- Ensures maximum success rate even if bulk operations aren't supported

### ✅ Error Tracking
- Collects errors from failed individual updates
- Returns detailed error information (ID + message) for each failure
- Allows partial success scenarios

### ✅ Logging
- Debug logs for API calls: `📡 API Repository: Batch updating N items`
- Success logs: `✅ API Repository: Batch updated N items`
- Error logs: `❌ API Repository: Error batch updating`

## Performance

### Single API Call
When the bulk endpoint succeeds, only **1 HTTP request** is made regardless of the number of updates.

**Example**: Updating 100 rows
- **Without batchUpdate**: 100 individual PATCH requests
- **With batchUpdate**: 1 bulk PATCH request

### Fallback Performance
If the bulk endpoint fails:
- Falls back to individual updates
- Uses `Promise.allSettled()` to run updates in parallel
- Still faster than sequential updates

## Error Handling

### Scenario 1: Bulk Endpoint Succeeds
```typescript
// All updates successful
{
  success: true,
  affected: 3
}
```

### Scenario 2: Bulk Endpoint Fails, Fallback Succeeds
```typescript
// 2 out of 3 updates succeeded via fallback
{
  success: true,
  affected: 2,
  errors: [
    { id: "prod_789", message: "Not found" }
  ]
}
```

### Scenario 3: All Fallback Updates Fail
```typescript
// All updates failed
{
  success: false,
  affected: 0,
  errors: [
    { id: "prod_123", message: "Validation error" },
    { id: "prod_456", message: "Unauthorized" }
  ]
}
```

## Integration with AdvancedTable

The `batchUpdate` method integrates with the table's bulk editing features:

1. User selects multiple rows
2. User applies changes (e.g., via bulk edit dialog)
3. Table calls `dataSource.batchUpdate(updates)`
4. ApiRepository handles the API call and fallback
5. Table refreshes to show updated data

## Testing

The implementation has been verified to:
- ✅ Compile without TypeScript errors
- ✅ Match the `IDataSource` interface signature
- ✅ Follow the same pattern as `bulkDelete`
- ✅ Include proper error handling and logging

## Compatibility

### Backend Requirements
The backend API should implement:
```
PATCH /api/v1/{resource}/bulk
```

**If the endpoint doesn't exist**, the fallback mechanism ensures the feature still works by making individual update calls.

### No Breaking Changes
- Existing code continues to work
- Feature is optional (only used when calling `batchUpdate()`)
- Backward compatible with all existing data sources

## Summary

The `batchUpdate` implementation:
- ✅ Completes the full CRUD + bulk operations API
- ✅ Follows SOLID principles (matches existing patterns)
- ✅ Includes automatic fallback for resilience
- ✅ Provides detailed error reporting
- ✅ Uses data transformers for API compatibility
- ✅ Supports partial success scenarios
- ✅ No breaking changes

The AdvancedTable component now supports **all major data operations**:
- Single CRUD: create, read, update, delete
- Bulk operations: batchUpdate, bulkDelete
- Advanced queries: pagination, sorting, filtering, search
