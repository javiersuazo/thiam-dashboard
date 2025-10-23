# Thiam API Client

Production-ready, type-safe API client for the Thiam API following Next.js 15 best practices.

## 🚀 Features

- ✅ **100% Type Safe** - All endpoints, requests, and responses are fully typed
- ✅ **Auto-Generated** - Types are generated directly from the API's OpenAPI spec
- ✅ **Auto-Complete** - Full IDE autocomplete for all API operations
- ✅ **React Query Integration** - Pre-built hooks with smart caching
- ✅ **Server & Client Support** - Works in Server Components, Server Actions, and Client Components
- ✅ **Authentication** - Built-in auth with httpOnly cookies (secure)
- ✅ **Error Handling** - Automatic retry, 401 redirect, error formatting
- ✅ **Middleware** - Logging, request IDs, content-type handling
- ✅ **Always in Sync** - Regenerate types anytime the API changes

## 📦 What's Included

```
src/lib/api/
├── generated/
│   └── schema.ts          # Auto-generated types (451KB) - DO NOT EDIT
├── index.ts               # Main API client (client & server)
├── server.ts              # Server-side utilities (cookies, auth)
├── provider.tsx           # React Query provider
├── middleware.ts          # Request/response interceptors
├── utils.ts               # Helper functions
├── hooks.ts               # React Query hooks
└── README.md              # This file
```

## 🎯 Quick Start

### 1. Client-Side (Browser) - Direct API Calls

```tsx
'use client'

import { api } from '@/lib/api'

// GET request with full type safety
async function fetchAccounts() {
  const { data, error } = await api.GET('/accounts', {
    params: {
      query: { limit: 10, offset: 0 }
    }
  })

  if (error) {
    console.error(error)
    return
  }

  // data is fully typed!
  console.log(data) // Account[]
}

// POST request
async function createAccount() {
  const { data, error } = await api.POST('/accounts', {
    body: {
      name: 'My Company',
      type: 'caterer',
      email: 'contact@company.com'
    }
  })

  if (error) throw error
  return data // Fully typed Account object
}
```

### 2. Server-Side (Server Components)

```tsx
import { createServerClient } from '@/lib/api/server'
import { redirect } from 'next/navigation'

export default async function AccountsPage() {
  // Get authenticated API client
  const api = await createServerClient()

  if (!api) {
    redirect('/signin')
  }

  // Fetch data server-side
  const { data: accounts, error } = await api.GET('/accounts')

  if (error) {
    return <div>Error loading accounts</div>
  }

  return (
    <div>
      {accounts?.map(account => (
        <div key={account.id}>{account.name}</div>
      ))}
    </div>
  )
}
```

### 3. Server Actions

```tsx
'use server'

import { createServerClient } from '@/lib/api/server'
import { revalidatePath } from 'next/cache'

export async function createAccountAction(formData: FormData) {
  const api = await createServerClient()

  if (!api) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await api.POST('/accounts', {
    body: {
      name: formData.get('name') as string,
      type: 'caterer',
      email: formData.get('email') as string,
    }
  })

  if (error) {
    throw new Error('Failed to create account')
  }

  revalidatePath('/accounts')
  return data
}
```

### React Query Hooks (Recommended)

The easiest way to use the API in React components:

```tsx
import {
  useAccounts,
  useAccount,
  useCreateAccount,
  useRequests,
  useCreateRequest
} from '@/lib/api/hooks'

// List accounts with auto-caching and refetching
function AccountsList() {
  const { data, isLoading, error, refetch } = useAccounts({
    limit: 10,
    offset: 0
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {data?.map(account => (
        <div key={account.id}>
          {account.name}
        </div>
      ))}
    </div>
  )
}

// Get single account
function AccountDetail({ accountId }: { accountId: string }) {
  const { data, isLoading } = useAccount(accountId)

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  )
}

// Create account with mutation
function CreateAccountForm() {
  const createAccount = useCreateAccount({
    onSuccess: (newAccount) => {
      console.log('Created:', newAccount)
      // Optionally invalidate queries to refetch
    },
    onError: (error) => {
      console.error('Failed:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const account = await createAccount.mutateAsync({
        name: 'New Company',
        type: 'caterer',
        email: 'new@company.com'
      })
      console.log('Created:', account)
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button
        type="submit"
        disabled={createAccount.isPending}
      >
        {createAccount.isPending ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  )
}
```

## 🔑 Authentication

### Login (Server Action)

```tsx
'use server'

import { setServerAuthToken } from '@/lib/api/server'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'

export async function loginAction(email: string, password: string) {
  // Call login endpoint (this is unauthenticated)
  const { data, error } = await api.POST('/auth/login', {
    body: { email, password }
  })

  if (error || !data?.token) {
    return { error: 'Invalid credentials' }
  }

  // Store token in httpOnly cookie (secure!)
  await setServerAuthToken(data.token)

  // Redirect to dashboard
  redirect('/dashboard')
}
```

### Logout (Server Action)

```tsx
'use server'

import { clearServerAuthToken } from '@/lib/api/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  // Clear auth cookie
  await clearServerAuthToken()

  // Redirect to login
  redirect('/signin')
}
```

### Client-Side Token Management (Less Secure - Use Server Actions Instead!)

```tsx
import { setAuthToken, logout } from '@/lib/api'

// After login (in client component)
function handleLogin(token: string) {
  setAuthToken(token) // Stores in sessionStorage

  // Now all API calls will include the token
  api.GET('/accounts') // Authenticated request
}

// Logout
function handleLogout() {
  logout() // Clears token and redirects
}
```

**⚠️ Note:** For production, use server-side authentication with httpOnly cookies (see Login/Logout Server Actions above). Client-side tokens are less secure.

## 🔄 Updating API Types

When the API changes (new endpoints, modified responses, etc.), regenerate the types:

```bash
# Convert Swagger 2.0 to OpenAPI 3.0 and generate types
npm run api:update

# Or run steps individually:
npm run api:convert   # Convert swagger.yaml to openapi.yaml
npm run api:generate  # Generate TypeScript types

# Watch mode (auto-regenerate on API changes)
npm run api:watch
```

**Important:** The `generated/schema.ts` file is auto-generated. Never edit it manually!

## 📝 Available Endpoints

The API client provides full type safety for all endpoints. Here are some key ones:

### Accounts
- `GET /accounts` - List accounts
- `GET /accounts/{id}` - Get account
- `POST /accounts` - Create account
- `PUT /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account

### Requests (Catering Requests)
- `GET /requests` - List requests
- `GET /requests/{id}` - Get request
- `POST /requests` - Create request
- `PUT /requests/{id}` - Update request

### Offers
- `GET /offers` - List offers
- `GET /offers/{id}` - Get offer
- `POST /offers` - Create offer
- `POST /offers/{id}/accept` - Accept offer
- `POST /offers/{id}/reject` - Reject offer

### Orders
- `GET /orders` - List orders
- `GET /orders/{id}` - Get order
- `PUT /orders/{id}/status` - Update order status

### Menus
- `GET /menus` - List menus
- `GET /menus/{id}` - Get menu
- `POST /menus` - Create menu
- `PUT /menus/{id}` - Update menu
- `POST /menus/{id}/publish` - Publish menu

### Invoices
- `GET /invoices` - List invoices
- `GET /invoices/{id}` - Get invoice
- `GET /invoices/{id}/pdf` - Download invoice PDF

### Users
- `GET /users` - List users
- `GET /users/{id}` - Get user
- `POST /users` - Create user
- `PUT /users/{id}` - Update user

**...and many more!** All endpoints have full TypeScript support with autocomplete.

## 🎨 IDE Autocomplete

The best part about this setup is the autocomplete:

```tsx
import { api } from '@/lib/api'

// Type "/" and your IDE will show all available endpoints
api.GET('/')
       ↑ Full autocomplete of all paths

// Type "params" and see what parameters are available
api.GET('/accounts', {
  params: {
    query: {
      // IDE autocompletes: limit, offset
    }
  }
})

// Response data is fully typed
const { data } = await api.GET('/accounts')
// data is Account[] - hover to see structure
```

## 🛠️ Advanced Usage

### Error Handling Utilities

Use the built-in utility functions for better error handling:

```tsx
import { formatApiError, unwrapResponse, hasError, hasData } from '@/lib/api/utils'

// Format errors for display
const { error } = await api.GET('/accounts')
if (error) {
  toast.error(formatApiError(error))
}

// Type guards
const response = await api.GET('/accounts')
if (hasError(response)) {
  // TypeScript knows response.error exists
  console.error(response.error)
}

if (hasData(response)) {
  // TypeScript knows response.data exists
  console.log(response.data)
}

// Unwrap responses (throws on error)
const data = unwrapResponse(await api.GET('/accounts'))
// data is guaranteed to exist, or an error is thrown
```

### Pagination Helper

```tsx
import { getPaginationParams, getTotalPages } from '@/lib/api/utils'

function AccountsList({ page = 1, pageSize = 10 }) {
  const { data } = useAccounts(getPaginationParams(page, pageSize))

  // Calculate total pages
  const totalPages = getTotalPages(data?.total || 0, pageSize)

  return (
    <div>
      {/* ... render accounts ... */}
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
```

### Custom React Query Hooks

Create domain-specific hooks:

```ts
// src/components/domains/accounts/hooks/useAccountFilters.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { buildQueryParams } from '@/lib/api/utils'

export function useFilteredAccounts(filters: {
  type?: 'caterer' | 'customer'
  status?: 'active' | 'inactive'
  search?: string
}) {
  return useQuery({
    queryKey: ['accounts', 'filtered', filters],
    queryFn: async () => {
      const { data, error } = await api.GET('/accounts', {
        params: { query: buildQueryParams(filters) }
      })
      if (error) throw error
      return data!
    },
  })
}
```

### Optimistic Updates

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await api.PUT('/accounts/{id}', {
        params: { path: { id } },
        body: updates
      })
      if (error) throw error
      return data
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['accounts', variables.id] })

      // Snapshot previous value
      const previous = queryClient.getQueryData(['accounts', variables.id])

      // Optimistically update
      queryClient.setQueryData(['accounts', variables.id], variables)

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['accounts', variables.id], context?.previous)
    },
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.id] })
    },
  })
}
```

### Type Exports

Access all types directly:

```ts
import type { paths, components } from '@/lib/api'
import type { ApiResponse, ApiRequestBody } from '@/lib/api/utils'

// Use component types
type Account = components['schemas']['response.Account']
type CreateAccountRequest = components['schemas']['request.CreateAccount']

// Use helper types
type AccountsResponse = ApiResponse<'/accounts', 'get'>
type CreateAccountBody = ApiRequestBody<'/accounts', 'post'>
```

## 🎯 Best Practices

### 1. Use Server Components for Initial Data

Fetch data server-side when possible for better performance:

```tsx
// ✅ Good - Server Component
export default async function Page() {
  const api = await createServerClient()
  const { data } = await api.GET('/accounts')
  return <AccountsList initialData={data} />
}

// ❌ Avoid - Client Component for initial load
'use client'
export default function Page() {
  const { data } = useAccounts() // Fetches client-side
  return <AccountsList data={data} />
}
```

### 2. Use React Query for Interactive Features

Use hooks for data that updates frequently or needs caching:

```tsx
// ✅ Good - Interactive list with filters
'use client'
export function AccountsList() {
  const [filters, setFilters] = useState({})
  const { data, refetch } = useAccounts(filters)

  return <div>{/* Interactive UI */}</div>
}
```

### 3. Handle Errors Gracefully

```tsx
// ✅ Good - User-friendly error handling
const { data, error } = await api.GET('/accounts')
if (error) {
  toast.error(formatApiError(error))
  return <ErrorState message="Failed to load accounts" retry={refetch} />
}

// ❌ Avoid - Silent failures
const { data } = await api.GET('/accounts')
// What if there's an error? User sees nothing!
```

### 4. Use Server Actions for Mutations

```tsx
// ✅ Good - Server Action with validation
'use server'
export async function createAccount(formData: FormData) {
  const api = await requireServerAuth()
  // Validation, authorization, etc.
  const { data, error } = await api.POST('/accounts', { body: validated })
  if (error) throw error
  revalidatePath('/accounts')
  return data
}

// ❌ Avoid - Client-side mutations (less secure)
'use client'
function createAccount() {
  const { data } = await api.POST('/accounts', { body })
}
```

### 5. Always Validate User Input

```tsx
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export async function createAccount(formData: FormData) {
  // Validate before sending to API
  const validated = schema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  const api = await requireServerAuth()
  return api.POST('/accounts', { body: validated })
}
```

### 6. Use Proper Query Keys

```tsx
// ✅ Good - Descriptive, hierarchical keys
queryKey: ['accounts', 'list', { status: 'active', page: 1 }]
queryKey: ['accounts', accountId]
queryKey: ['accounts', accountId, 'offers']

// ❌ Avoid - Generic or flat keys
queryKey: ['data']
queryKey: ['list']
```

## ❓ FAQ

### Q: Do I need to manually update types when the API changes?

**A:** Just run `npm run api:update` and the types will regenerate automatically. Takes ~130ms.

### Q: Can I use this without React Query?

**A:** Yes! Use the `api` client directly (see Basic Usage above). React Query hooks are optional.

### Q: What if the API is down during development?

**A:** The types are generated locally, so you can still develop with full type safety even if the API is offline.

### Q: Can I add custom endpoints not in the API?

**A:** Yes, but they won't be type-safe. Better to add them to the API spec first.

### Q: How do I handle file uploads?

**A:** Use the media endpoints:

```ts
const { data } = await api.POST('/media', {
  body: formData, // multipart/form-data
})
```

## 📚 Resources

- [OpenAPI Fetch Docs](https://openapi-ts.pages.dev/openapi-fetch/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Thiam API Swagger](../../../thiam-api/docs/swagger.yaml)

## 🎉 That's It!

You now have a fully type-safe API client that stays in sync with your backend automatically. Happy coding! 🚀
