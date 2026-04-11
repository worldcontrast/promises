// src/i18n.ts
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'pt', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'hi', 'ru'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'pt'

export const localeConfig: Record<Locale, {
  name: string
  flag: string
  dir: 'ltr' | 'rtl'
  nativeName: string
}> = {
  en: { name: 'English',    nativeName: 'English',    flag: '🇺🇸', dir: 'ltr' },
  pt: { name: 'Português',  nativeName: 'Português',  flag: '🇧🇷', dir: 'ltr' },
  es: { name: 'Español',    nativeName: 'Español',    flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français',   nativeName: 'Français',   flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch',    nativeName: 'Deutsch',    flag: '🇩🇪', dir: 'ltr' },
  ar: { name: 'Arabic',     nativeName: 'العربية',    flag: '🇸🇦', dir: 'rtl' },
  zh: { name: 'Chinese',    nativeName: '中文',        flag: '🇨🇳', dir: 'ltr' },
  ja: { name: 'Japanese',   nativeName: '日本語',      flag: '🇯🇵', dir: 'ltr' },
  hi: { name: 'Hindi',      nativeName: 'हिन्दी',      flag: '🇮🇳', dir: 'ltr' },
  ru: { name: 'Russian',    nativeName: 'Русский',    flag: '🇷🇺', dir: 'ltr' },
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  if (!locales.includes(locale as Locale)) notFound()

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
