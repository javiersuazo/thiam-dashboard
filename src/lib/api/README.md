# Thiam API Client

Type-safe, auto-generated API client for the Thiam API. Provides full TypeScript autocomplete for all endpoints, requests, and responses.

## 🚀 Features

- ✅ **100% Type Safe** - All endpoints, requests, and responses are fully typed
- ✅ **Auto-Generated** - Types are generated directly from the API's OpenAPI spec
- ✅ **Auto-Complete** - Full IDE autocomplete for all API operations
- ✅ **React Query Integration** - Pre-built hooks for common operations
- ✅ **Always in Sync** - Regenerate types anytime the API changes

## 📦 What's Included

```
src/lib/api/
├── generated/
│   └── schema.ts          # Auto-generated types (451KB) - DO NOT EDIT
├── index.ts               # Main API client
├── hooks.ts               # React Query hooks
└── README.md              # This file
```

## 🎯 Quick Start

### Basic Usage (Direct API Calls)

```tsx
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

// PUT request
async function updateAccount(id: string) {
  const { data, error } = await api.PUT('/accounts/{id}', {
    params: {
      path: { id }
    },
    body: {
      name: 'Updated Name'
    }
  })

  if (error) throw error
  return data
}

// DELETE request
async function deleteAccount(id: string) {
  const { error } = await api.DELETE('/accounts/{id}', {
    params: {
      path: { id }
    }
  })

  if (error) throw error
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

### Client-Side (Browser)

```tsx
import { setAuthToken, api } from '@/lib/api'

// After login, set the token
function handleLogin(token: string) {
  setAuthToken(token)

  // Now all API calls will include the token
  api.GET('/accounts') // Authenticated request
}

// Clear token on logout
function handleLogout() {
  setAuthToken(null)
}
```

### Server-Side (Next.js Server Components/API Routes)

```tsx
import { createAuthenticatedClient } from '@/lib/api'

// In a server component or API route
export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Create authenticated client for this request
  const authenticatedApi = createAuthenticatedClient(token)

  const { data, error } = await authenticatedApi.GET('/accounts')

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json(data)
}
```

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

### Custom Error Handling

Add global error handling in `src/lib/api/index.ts`:

```ts
const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }

    if (response.status >= 500) {
      // Track error in analytics
      trackError('API Error', response.status)
    }

    return response
  },
}
```

### Custom Hooks

Create your own hooks following the same pattern:

```ts
// src/lib/api/hooks.ts

export function useMyCustomHook(params: any) {
  return useQuery({
    queryKey: ['my-custom-key', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/my-endpoint', {
        params: { query: params }
      })
      if (error) throw error
      return data!
    },
  })
}
```

### Type Exports

Access all types directly:

```ts
import type { paths, components } from '@/lib/api'

// Use component types
type Account = components['schemas']['response.Account']
type CreateAccountRequest = components['schemas']['request.CreateAccount']

// Use path types
type AccountsResponse = paths['/accounts']['get']['responses']['200']['content']['application/json']
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
