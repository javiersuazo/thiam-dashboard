/**
 * next-intl routing configuration
 *
 * Defines how locale routing should work.
 */

import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always prefix locale in URLs for consistency
  // This ensures all URLs have locale: /en/signin, /es/signin, /pt/signin
  localePrefix: 'always',
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
