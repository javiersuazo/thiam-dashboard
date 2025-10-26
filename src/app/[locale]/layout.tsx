/**
 * Locale Layout
 *
 * Provides i18n context for all pages within a locale.
 * Wraps children with NextIntlClientProvider for client components.
 */

import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Outfit } from 'next/font/google'
import '@/app/globals.css'
import 'swiper/swiper-bundle.css'
import 'simplebar-react/dist/simplebar.min.css'
import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Providers } from '@/components/providers'

const outfit = Outfit({
  subsets: ['latin'],
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Providers>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}
