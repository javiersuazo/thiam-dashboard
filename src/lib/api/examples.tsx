/**
 * API Client Examples
 *
 * Copy-paste examples for common use cases.
 * These are ready to use in your components!
 *
 * NOTE: This file is for reference/examples only. ESLint errors are suppressed.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { api } from './index'
import {
  useAccounts,
  useAccount,
  useCreateAccount,
  useRequests,
  useRequest,
  useCreateRequest,
  useOffers,
  useOffer,
  useCreateOffer,
  useAcceptOffer,
  useOrders,
  useOrder,
  useMenus,
  useMenu,
  useCreateMenu,
  useInvoices,
  useInvoice,
} from './hooks'

// =============================================================================
// AUTHENTICATION EXAMPLES
// =============================================================================

/**
 * Login and store auth token
 */
export async function loginExample(email: string, password: string) {
  const { data, error } = await api.POST('/v1/auth/login', {
    body: { email, password },
  })

  if (error) {
    console.error('Login failed:', error)
    return null
  }

  // Store the token
  if (data?.token) {
    // Authentication is now handled via httpOnly cookies
    // setAuthToken(data.token)
  }

  return data
}

/**
 * Logout and clear token
 */
export function logoutExample() {
  // Authentication is now handled via httpOnly cookies
  // setAuthToken(null)
  // Optionally redirect to login
  window.location.href = '/login'
}

// =============================================================================
// ACCOUNT EXAMPLES
// =============================================================================

/**
 * List accounts component
 */
export function AccountsListExample() {
  const { data: accounts, isLoading, error } = useAccounts({ limit: 20, offset: 0 })

  if (isLoading) return <div>Loading accounts...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Accounts ({accounts?.length})</h2>
      {accounts?.map((account) => (
        <div key={account.id}>
          <h3>{account.name}</h3>
          <p>{account.type}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Single account detail component
 */
export function AccountDetailExample({ accountId }: { accountId: string }) {
  const { data: account, isLoading } = useAccount(accountId)

  if (isLoading) return <div>Loading...</div>
  if (!account) return <div>Account not found</div>

  return (
    <div>
      <h1>{account.name}</h1>
      <p>Type: {account.type}</p>
      <p>Email: {account.email}</p>
    </div>
  )
}

/**
 * Create account form
 */
export function CreateAccountFormExample() {
  const createAccount = useCreateAccount({
    onSuccess: (newAccount) => {
      console.log('Account created:', newAccount)
      alert(`Account "${newAccount.name}" created successfully!`)
    },
    onError: (error) => {
      console.error('Failed to create account:', error)
      alert('Failed to create account')
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await createAccount.mutateAsync({
      name: formData.get('name') as string,
      type: formData.get('type') as 'caterer' | 'customer',
      email: formData.get('email') as string,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Account Name" required />
      <select name="type" required>
        <option value="caterer">Caterer</option>
        <option value="customer">Customer</option>
      </select>
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={createAccount.isPending}>
        {createAccount.isPending ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  )
}

// =============================================================================
// REQUEST EXAMPLES (Customer creates catering request)
// =============================================================================

/**
 * List catering requests
 */
export function RequestsListExample() {
  const { data: requests, isLoading } = useRequests({ limit: 10, offset: 0 })

  if (isLoading) return <div>Loading requests...</div>

  return (
    <div>
      <h2>Catering Requests</h2>
      {requests?.map((request) => (
        <div key={request.id}>
          <h3>{request.title}</h3>
          <p>Status: {request.status}</p>
          <p>Event Date: {request.event_date}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Filter requests by status
 */
export function FilteredRequestsExample({ status }: { status: string }) {
  const { data: requests, isLoading } = useRequests({ status })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2>{status} Requests</h2>
      {requests?.map((request) => (
        <div key={request.id}>{request.title}</div>
      ))}
    </div>
  )
}

/**
 * Create new catering request
 */
export function CreateRequestFormExample() {
  const createRequest = useCreateRequest({
    onSuccess: () => alert('Request created!'),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await createRequest.mutateAsync({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      event_date: formData.get('event_date') as string,
      guest_count: parseInt(formData.get('guest_count') as string),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Event Title" required />
      <textarea name="description" placeholder="Description" required />
      <input name="event_date" type="date" required />
      <input name="guest_count" type="number" placeholder="Number of guests" required />
      <button type="submit" disabled={createRequest.isPending}>
        {createRequest.isPending ? 'Creating...' : 'Create Request'}
      </button>
    </form>
  )
}

// =============================================================================
// OFFER EXAMPLES (Caterer submits offer to request)
// =============================================================================

/**
 * List offers for a request
 */
export function OffersForRequestExample({ requestId }: { requestId: string }) {
  const { data: offers, isLoading } = useOffers({ request_id: requestId })

  if (isLoading) return <div>Loading offers...</div>

  return (
    <div>
      <h2>Offers ({offers?.length})</h2>
      {offers?.map((offer) => (
        <div key={offer.id}>
          <h3>Offer from {offer.caterer_name}</h3>
          <p>Price: ${offer.total_price}</p>
          <p>Status: {offer.status}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Accept an offer
 */
export function AcceptOfferButtonExample({ offerId }: { offerId: string }) {
  const acceptOffer = useAcceptOffer({
    onSuccess: () => {
      alert('Offer accepted! Order created.')
    },
  })

  return (
    <button
      onClick={() => acceptOffer.mutate(offerId)}
      disabled={acceptOffer.isPending}
    >
      {acceptOffer.isPending ? 'Accepting...' : 'Accept Offer'}
    </button>
  )
}

/**
 * Caterer creates offer for a request
 */
export function CreateOfferFormExample({ requestId }: { requestId: string }) {
  const createOffer = useCreateOffer({
    onSuccess: () => alert('Offer submitted!'),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await createOffer.mutateAsync({
      request_id: requestId,
      total_price: parseFloat(formData.get('total_price') as string),
      description: formData.get('description') as string,
      menu_items: [], // Add menu items
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="total_price" type="number" step="0.01" placeholder="Total Price" required />
      <textarea name="description" placeholder="Offer Description" required />
      <button type="submit" disabled={createOffer.isPending}>
        {createOffer.isPending ? 'Submitting...' : 'Submit Offer'}
      </button>
    </form>
  )
}

// =============================================================================
// ORDER EXAMPLES
// =============================================================================

/**
 * List orders with status filter
 */
export function OrdersListExample({ status }: { status?: string }) {
  const { data: orders, isLoading } = useOrders({ status })

  if (isLoading) return <div>Loading orders...</div>

  return (
    <div>
      <h2>Orders</h2>
      {orders?.map((order) => (
        <div key={order.id}>
          <h3>Order #{order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Order detail with all information
 */
export function OrderDetailExample({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId)

  if (isLoading) return <div>Loading order...</div>
  if (!order) return <div>Order not found</div>

  return (
    <div>
      <h1>Order #{order.id}</h1>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total}</p>
      <p>Customer: {order.customer_name}</p>
      <p>Caterer: {order.caterer_name}</p>

      <h2>Items</h2>
      {order.items?.map((item: any) => (
        <div key={item.id}>
          <p>{item.name} x {item.quantity}</p>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MENU EXAMPLES
// =============================================================================

/**
 * List menus for a caterer
 */
export function MenusListExample({ accountId }: { accountId?: string }) {
  const { data: menus, isLoading } = useMenus({ account_id: accountId })

  if (isLoading) return <div>Loading menus...</div>

  return (
    <div>
      <h2>Menus</h2>
      {menus?.map((menu) => (
        <div key={menu.id}>
          <h3>{menu.name}</h3>
          <p>{menu.description}</p>
          <p>Price: ${menu.price_per_person}/person</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Menu detail with items
 */
export function MenuDetailExample({ menuId }: { menuId: string }) {
  const { data: menu, isLoading } = useMenu(menuId)

  if (isLoading) return <div>Loading menu...</div>
  if (!menu) return <div>Menu not found</div>

  return (
    <div>
      <h1>{menu.name}</h1>
      <p>{menu.description}</p>
      <p>${menu.price_per_person} per person</p>

      <h2>Menu Items</h2>
      {menu.items?.map((item: any) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Create new menu
 */
export function CreateMenuFormExample() {
  const createMenu = useCreateMenu({
    onSuccess: () => alert('Menu created!'),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await createMenu.mutateAsync({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price_per_person: parseFloat(formData.get('price_per_person') as string),
      type: formData.get('type') as string,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Menu Name" required />
      <textarea name="description" placeholder="Description" required />
      <input name="price_per_person" type="number" step="0.01" placeholder="Price per person" required />
      <select name="type" required>
        <option value="buffet">Buffet</option>
        <option value="plated">Plated</option>
        <option value="boxed">Boxed Lunch</option>
      </select>
      <button type="submit" disabled={createMenu.isPending}>
        {createMenu.isPending ? 'Creating...' : 'Create Menu'}
      </button>
    </form>
  )
}

// =============================================================================
// INVOICE EXAMPLES
// =============================================================================

/**
 * List invoices
 */
export function InvoicesListExample() {
  const { data: invoices, isLoading } = useInvoices()

  if (isLoading) return <div>Loading invoices...</div>

  return (
    <div>
      <h2>Invoices</h2>
      {invoices?.map((invoice) => (
        <div key={invoice.id}>
          <h3>Invoice #{invoice.invoice_number}</h3>
          <p>Amount: ${invoice.total}</p>
          <p>Status: {invoice.status}</p>
          <p>Due: {invoice.due_date}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Invoice detail with PDF download
 */
export function InvoiceDetailExample({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading } = useInvoice(invoiceId)

  if (isLoading) return <div>Loading invoice...</div>
  if (!invoice) return <div>Invoice not found</div>

  // NOTE: PDF download endpoint not available in current API schema
  // const downloadPDF = async () => {
  //   const { data, error } = await api.GET('/invoices/{id}/pdf', {
  //     params: { path: { id: invoiceId } },
  //   })
  //   if (error) {
  //     alert('Failed to download PDF')
  //     return
  //   }
  //   // Handle PDF download
  // }

  return (
    <div>
      <h1>Invoice #{invoice.invoice_number}</h1>
      <p>Total: ${invoice.total}</p>
      <p>Status: {invoice.status}</p>
      <p>Due Date: {invoice.due_date}</p>

      {/* <button onClick={downloadPDF}>Download PDF</button> */}

      <h2>Line Items</h2>
      {invoice.items?.map((item: any) => (
        <div key={item.id}>
          <p>{item.description}</p>
          <p>${item.amount}</p>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// ADVANCED EXAMPLES
// =============================================================================

/**
 * Pagination example
 */
export function PaginatedListExample() {
  const [page, setPage] = React.useState(0)
  const limit = 10

  const { data, isLoading } = useAccounts({
    limit,
    offset: page * limit,
  })

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {data?.map((account) => (
            <div key={account.id}>{account.name}</div>
          ))}
        </div>
      )}

      <button onClick={() => setPage(page - 1)} disabled={page === 0}>
        Previous
      </button>
      <span>Page {page + 1}</span>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  )
}

/**
 * Auto-refetch on interval
 */
export function AutoRefetchExample() {
  const { data: orders } = useOrders(
    { status: 'pending' },
    {
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  )

  return (
    <div>
      <h2>Pending Orders (auto-refreshes)</h2>
      {orders?.map((order) => (
        <div key={order.id}>{order.id}</div>
      ))}
    </div>
  )
}

/**
 * Optimistic update example
 */
export function OptimisticUpdateExample() {
  const queryClient = useQueryClient()

  const acceptOffer = useAcceptOffer({
    // Optimistically update UI before server responds
    onMutate: async (offerId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['offers', offerId] })

      // Snapshot previous value
      const previousOffer = queryClient.getQueryData(['offers', offerId])

      // Optimistically update
      queryClient.setQueryData(['offers', offerId], (old: any) => ({
        ...old,
        status: 'accepted',
      }))

      return { previousOffer }
    },
    // If mutation fails, rollback
    onError: (err, offerId, context: any) => {
      queryClient.setQueryData(['offers', offerId], context?.previousOffer)
    },
    // Always refetch after error or success
    onSettled: (data, error, offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offers', offerId] })
    },
  })

  return <button onClick={() => acceptOffer.mutate('offer-id')}>Accept</button>
}

// Add React import for examples that use hooks
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
