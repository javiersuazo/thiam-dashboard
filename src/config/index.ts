/**
 * Application Configuration
 *
 * Centralized configuration for the application
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 30000,
  retries: 3,
} as const

/**
 * Feature Flags
 * Enable/disable features without code changes
 */
export const FEATURES = {
  chat: process.env.NEXT_PUBLIC_FEATURE_CHAT === 'true',
  aiSuggestions: process.env.NEXT_PUBLIC_FEATURE_AI === 'true',
  marketplace: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE === 'true',
  dailyLunch: process.env.NEXT_PUBLIC_FEATURE_DAILY_LUNCH === 'true',
  impersonation: process.env.NEXT_PUBLIC_FEATURE_IMPERSONATION === 'true',
} as const

/**
 * App Constants
 */
export const CONSTANTS = {
  APP_NAME: 'Thiam',
  APP_VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

/**
 * Route Definitions
 */
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',

  // Customer routes
  CUSTOMER_DASHBOARD: '/dashboard',
  REQUESTS: '/requests',
  REQUEST_DETAIL: (id: string) => `/requests/${id}`,
  REQUEST_NEW: '/requests/new',

  // Caterer routes
  CATERER_DASHBOARD: '/caterer/dashboard',
  MENUS: '/caterer/menus',
  MENU_DETAIL: (id: string) => `/caterer/menus/${id}`,

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,

  // Invoices
  INVOICES: '/invoices',
  INVOICE_DETAIL: (id: string) => `/invoices/${id}`,

  // Admin
  ADMIN_USERS: '/admin/users',
  ADMIN_ACCOUNTS: '/admin/accounts',
} as const

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const
