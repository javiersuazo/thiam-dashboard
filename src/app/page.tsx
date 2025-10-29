import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

/**
 * Root Page - Redirects to default locale
 *
 * With localePrefix: 'always', all routes must have a locale prefix.
 * This page redirects root path (/) and any non-localized paths
 * to the default locale.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`)
}
