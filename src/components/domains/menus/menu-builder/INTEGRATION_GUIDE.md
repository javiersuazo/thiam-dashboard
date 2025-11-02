# Menu Builder - Backend Integration Guide

## 📚 Documentation Overview

This menu builder has **complete documentation** for backend integration. Read documents in this order:

### 1. DATA_CONTRACTS.md ⭐ **START HERE**
**What it covers:**
- Exact JSON structures for all requests and responses
- Field-by-field validation rules
- Data type specifications (string, number, boolean, null handling)
- Edge cases and examples
- Error response formats
- Test cases with expected inputs/outputs

**Why read first:** Prevents 99% of integration issues by specifying exact data formats.

### 2. BACKEND_REQUIREMENTS.md
**What it covers:**
- 7 required API endpoints (GET, POST, PUT, DELETE)
- Database schema (4 tables with SQL CREATE statements)
- Go struct examples with validation tags
- OpenAPI/Swagger spec (ready to copy into your swagger.yaml)
- Performance considerations (caching, pagination, indexing)
- Security considerations (auth, validation, rate limiting)

**When to read:** After understanding data contracts, use this to implement endpoints.

### 3. PAGINATION_AND_FILTERS.md
**What it covers:**
- How frontend filters work (category, dietary tags, search)
- Current: Client-side filtering (frontend fetches all items)
- Future: Server-side filtering (backend supports query params)
- Pagination design (24 items per page)

**When to read:** When implementing the GET /menu-items endpoint with filters.

### 4. DDD_SOLID_REVIEW.md
**What it covers:**
- Frontend architecture analysis
- Why the frontend requires zero refactoring for backend integration
- How layers are separated (Presentation → Business Logic → Data)

**When to read:** If you want to understand the frontend architecture.

---

## 🚀 Quick Start for Backend Developers

### Step 1: Understand the Data (15 minutes)
```bash
# Read this first - it has everything you need
cat DATA_CONTRACTS.md
```

**Key takeaways:**
- All prices are in **cents** (integers): $28.50 = `2850`
- All IDs are **strings**: `"menu_abc123"`, `"item_xyz789"`
- Timestamps are **ISO 8601**: `"2025-06-01T10:30:00Z"`
- Categories are **lowercase**: `"appetizers"`, `"mains"`, `"sides"`, `"desserts"`, `"beverages"`
- `fixedPriceCents` is **required** when `pricingStrategy === "fixed"`

### Step 2: Implement Endpoints (4-8 hours)
```bash
# Reference this for endpoint details
cat BACKEND_REQUIREMENTS.md
```

**7 endpoints to implement:**
1. `GET /accounts/{accountId}/menu-items` - Get available items
2. `GET /accounts/{accountId}/menus` - List menus
3. `GET /accounts/{accountId}/menus/{menuId}` - Get single menu
4. `POST /accounts/{accountId}/menus` - Create menu
5. `PUT /accounts/{accountId}/menus/{menuId}` - Update menu
6. `DELETE /accounts/{accountId}/menus/{menuId}` - Delete menu
7. `POST /accounts/{accountId}/menus/{menuId}/duplicate` - Duplicate menu

### Step 3: Create Database Schema (1-2 hours)
```sql
-- 4 tables needed (see BACKEND_REQUIREMENTS.md for full schema)
CREATE TABLE menu_items (...);
CREATE TABLE menus (...);
CREATE TABLE menu_courses (...);
CREATE TABLE menu_course_items (...);
```

### Step 4: Update OpenAPI Spec (30 minutes)
```bash
# Copy-paste from BACKEND_REQUIREMENTS.md into your swagger.yaml
# Then regenerate API client on frontend
```

### Step 5: Test Integration (1-2 hours)
```bash
# Frontend side:
cd thiam-dashboard
npm run api:update  # Regenerate types from OpenAPI
# Change USE_MOCK_DATA = false in hooks/useMenuBuilder.ts
npm run dev

# Test in browser:
# 1. Browse items
# 2. Create menu
# 3. Save menu
# 4. Reload page (should persist)
# 5. Edit menu
# 6. Delete menu
```

---

## 🎯 Critical Contract Points

### 1. Pricing Strategy Validation
```typescript
// REQUIRED: fixedPriceCents must be present when pricingStrategy is "fixed"
{
  "pricingStrategy": "fixed",
  "fixedPriceCents": 5000  // ✅ Required!
}

// INVALID: Missing fixedPriceCents
{
  "pricingStrategy": "fixed",
  "fixedPriceCents": null  // ❌ Backend must return 400 error
}
```

### 2. Category Values (case-sensitive)
```typescript
// VALID: Lowercase
"category": "appetizers"  ✅
"category": "mains"       ✅
"category": "sides"       ✅
"category": "desserts"    ✅
"category": "beverages"   ✅

// INVALID: Capitalized or different spelling
"category": "Appetizers"  ❌
"category": "main"        ❌ (must be "mains")
```

### 3. Price Format (cents, not dollars)
```typescript
// CORRECT: Integer cents
"priceCents": 2850  // $28.50 ✅
"priceCents": 500   // $5.00 ✅
"priceCents": 0     // Free ✅

// INCORRECT: Decimal dollars
"priceCents": 28.50  ❌ Must be integer
"priceCents": "2850" ❌ Must be number, not string
"priceCents": -100   ❌ Cannot be negative
```

### 4. Timestamp Format (ISO 8601)
```typescript
// CORRECT: ISO 8601 with timezone
"createdAt": "2025-06-01T10:30:00Z"       ✅ UTC
"createdAt": "2025-06-01T10:30:00+00:00"  ✅ UTC with offset
"createdAt": "2025-06-01T06:30:00-04:00"  ✅ EDT

// INCORRECT: Other formats
"createdAt": "2025-06-01 10:30:00"  ❌ Missing 'T'
"createdAt": "06/01/2025"           ❌ Not ISO 8601
```

### 5. Foreign Key Validation
```typescript
// Backend MUST validate that menuItemId exists
{
  "menuItemId": "item_abc123"  // Must exist in menu_items table
}

// If not found, return 400 error:
{
  "error": {
    "code": "INVALID_MENU_ITEM",
    "message": "Menu item 'item_abc123' does not exist"
  }
}
```

### 6. Empty Arrays vs Null
```typescript
// VALID: Empty arrays are allowed
"dietaryTags": []   ✅
"tags": []          ✅
"courses[].items": []  ✅ Empty course is valid

// ALSO VALID: Null or omitted
"dietaryTags": null  ✅
// Field omitted entirely  ✅

// INVALID: Empty string where array expected
"dietaryTags": ""  ❌
```

---

## 🧪 Testing Checklist

### Backend Unit Tests
- [ ] Create menu with minimal fields (name + 1 course + pricingStrategy)
- [ ] Create menu with all optional fields populated
- [ ] Create fixed-price menu (validate fixedPriceCents is required)
- [ ] Create menu with invalid menuItemId (should return 400)
- [ ] Create menu with duplicate positions in course items (should return 400)
- [ ] Update existing menu
- [ ] Update menu with wrong ID in body (should return 400)
- [ ] Delete menu
- [ ] Delete menu that's in use (should return 422)
- [ ] Get menu items with category filter
- [ ] Get menu items with search filter
- [ ] Get menu items with dietary tag filter
- [ ] Pagination (limit=24, offset=0, offset=24)

### Integration Tests
- [ ] Frontend can browse all items
- [ ] Frontend can filter by category
- [ ] Frontend can filter by dietary tags
- [ ] Frontend can search by name/description
- [ ] Frontend can create menu
- [ ] Frontend can save menu (persists in database)
- [ ] Frontend can reload page and see saved menu
- [ ] Frontend can edit menu
- [ ] Frontend can delete menu
- [ ] Frontend shows correct error messages on validation failures

### Manual Testing Scenarios
1. **Create simple menu**
   - Add 3 items from different categories
   - Use "sum-of-items" pricing
   - Save → Should persist

2. **Create fixed-price menu**
   - Add 5 items
   - Use "fixed" pricing with $50 price
   - Save → Should persist with fixed price

3. **Edit existing menu**
   - Remove 1 item
   - Add 2 new items
   - Change pricing strategy
   - Save → Should update correctly

4. **Test filters**
   - Filter by "Mains" → Should show only mains
   - Select "Vegetarian" tag → Should show only vegetarian items
   - Search "chicken" → Should show items with "chicken" in name or description
   - Combine filters → Should apply all filters together

5. **Test pagination**
   - Browse modal should show 24 items per page
   - Click Next → Should show items 25-48
   - Click Prev → Should show items 1-24
   - Go to last page → Should show remaining items

---

## 🔧 Common Integration Issues & Solutions

### Issue 1: Frontend shows "Failed to fetch menu items"
**Cause:** Backend not returning correct JSON structure

**Solution:** Verify response matches `MenuItem[]` structure:
```json
[
  {
    "id": "string",
    "name": "string",
    "category": "appetizers" | "mains" | "sides" | "desserts" | "beverages",
    "priceCents": 1000,  // number, not string
    "currency": "USD",
    "isAvailable": true  // boolean, not 1
  }
]
```

### Issue 2: Menu saves but doesn't persist after reload
**Cause:** Backend not storing data in database (returning success but not saving)

**Solution:** Ensure POST/PUT endpoints actually write to database and return saved data with IDs

### Issue 3: Frontend shows "Invalid pricing strategy"
**Cause:** Backend returning wrong pricing strategy value

**Solution:** Only use `"fixed"` or `"sum-of-items"` (lowercase, with hyphen)

### Issue 4: Prices showing incorrectly
**Cause:** Backend storing prices as dollars instead of cents

**Solution:** Multiply dollar amount by 100 before storing: $28.50 → 2850 cents

### Issue 5: Filters not working
**Cause:** Backend not supporting query parameters

**Solution:** Implement query parameter support in GET /menu-items:
```
GET /menu-items?category=mains&search=salmon&dietaryTags=vegan
```

### Issue 6: CORS errors
**Cause:** Backend not allowing frontend origin

**Solution:** Add CORS headers:
```go
// Go example
w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
```

### Issue 7: 401 Unauthorized on all requests
**Cause:** Frontend not sending auth token or backend rejecting valid tokens

**Solution:** Verify:
- Frontend sends `Authorization: Bearer {token}` header
- Backend validates token correctly
- Token has necessary permissions for account

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FastMenuBuilder.tsx (Presentation Layer)                   │
│    │                                                         │
│    ├─ Renders UI, handles user interactions                 │
│    └─ Calls business logic hook ↓                           │
│                                                              │
│  useMenuBuilderState.ts (Business Logic Layer)              │
│    │                                                         │
│    ├─ Menu state management                                 │
│    ├─ Add/remove/move items                                 │
│    ├─ Calculate totals                                      │
│    └─ Pure domain logic ↓                                   │
│                                                              │
│  useMenuBuilder.ts (Data Layer)                             │
│    │                                                         │
│    ├─ React Query hooks                                     │
│    ├─ Caching                                               │
│    ├─ USE_MOCK_DATA flag ← CHANGE THIS TO FALSE            │
│    └─ Calls API service ↓                                   │
│                                                              │
│  menuBuilder.service.ts (API Service)                       │
│    │                                                         │
│    └─ HTTP calls with openapi-fetch ↓                       │
│                                                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP (JSON)
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Go)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP Handlers                                              │
│    │                                                         │
│    ├─ GET /menu-items → ListMenuItems()                    │
│    ├─ POST /menus → CreateMenu()                           │
│    ├─ GET /menus/:id → GetMenu()                           │
│    ├─ PUT /menus/:id → UpdateMenu()                        │
│    └─ DELETE /menus/:id → DeleteMenu()                     │
│                                                              │
│  Business Logic                                             │
│    │                                                         │
│    ├─ Validate pricing strategy                             │
│    ├─ Check foreign keys (menuItemId exists)                │
│    └─ Enforce business rules                                │
│                                                              │
│  Database Layer (PostgreSQL)                                │
│    │                                                         │
│    ├─ menu_items table                                      │
│    ├─ menus table                                           │
│    ├─ menu_courses table                                    │
│    └─ menu_course_items table                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 Success Criteria

Your integration is **complete** when:

✅ Frontend can browse all available menu items
✅ Frontend can filter items by category
✅ Frontend can filter items by dietary tags
✅ Frontend can search items by name/description
✅ Frontend can create a new menu
✅ Frontend can save menu to backend
✅ Menu persists after page reload
✅ Frontend can edit existing menu
✅ Frontend can delete menu
✅ All validation errors show user-friendly messages
✅ Pagination works (24 items per page)
✅ Fixed-price menus work correctly
✅ Sum-of-items menus work correctly

---

## 📞 Support

If you encounter issues:

1. **Check DATA_CONTRACTS.md** - 90% of issues are data format mismatches
2. **Check BACKEND_REQUIREMENTS.md** - Verify endpoint implementation
3. **Check browser Network tab** - Inspect actual request/response JSON
4. **Check backend logs** - Look for validation errors
5. **Compare with examples** - DATA_CONTRACTS.md has complete examples

---

## 🚢 Deployment Checklist

Before going to production:

- [ ] All 7 endpoints implemented and tested
- [ ] Database tables created with indexes
- [ ] OpenAPI spec updated and types regenerated
- [ ] `USE_MOCK_DATA = false` in production build
- [ ] Error handling for all edge cases
- [ ] Authentication/authorization working
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Performance tested with 1000+ items
- [ ] Load tested with concurrent users

---

## 📈 Future Enhancements (Not Required Now)

These can be added later without frontend changes:

- Server-side pagination for 10,000+ items
- Full-text search with Elasticsearch
- Image upload/CDN integration
- Menu versioning (track changes over time)
- Menu templates (pre-built menus)
- Nutritional information
- Allergen warnings
- Multi-language support
- Menu analytics (most popular items)
- Pricing history

The frontend architecture supports all these features without refactoring! 🎯

---

**Total estimated implementation time: 8-16 hours**

- Database schema: 1-2 hours
- Endpoint implementation: 4-8 hours
- OpenAPI spec update: 30 minutes
- Testing: 2-4 hours
- Bug fixes: 1-2 hours

Good luck! The frontend is ready and waiting. 🚀
