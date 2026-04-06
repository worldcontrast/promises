import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Supported locales — add new languages here
export const locales = ['en', 'pt', 'es', 'fr', 'de', 'ar'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'en'

// Locale metadata (for language selector)
export const localeConfig: Record<Locale, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English',    flag: '🇺🇸', dir: 'ltr' },
  pt: { name: 'Português',  flag: '🇧🇷', dir: 'ltr' },
  es: { name: 'Español',    flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français',   flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch',    flag: '🇩🇪', dir: 'ltr' },
  ar: { name: 'العربية',    flag: '🇸🇦', dir: 'rtl' },
}

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!locales.includes(locale as Locale)) notFound()

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
