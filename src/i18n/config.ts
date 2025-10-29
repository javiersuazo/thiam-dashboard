/**
 * Internationalization Configuration
 *
 * Supported locales: English (en), Spanish (es), Portuguese (pt)
 */

export const locales = ['en', 'es', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/**
 * Locale display names
 */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
}

/**
 * Locale flags for UI
 */
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇧🇷',
}
