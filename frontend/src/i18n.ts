import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// APENAS os idiomas que têm arquivo .json em frontend/messages/
// Adicionar novo idioma aqui EXIGE criar o arquivo messages/XX.json primeiro
export const locales = ['en', 'pt', 'es', 'fr', 'de', 'ar'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'pt'

export const localeConfig: Record<Locale, {
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}> = {
  en: { name: 'English',   nativeName: 'English',   flag: '🇺🇸', dir: 'ltr' },
  pt: { name: 'Português', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  es: { name: 'Español',   nativeName: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français',  nativeName: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch',   nativeName: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
  ar: { name: 'Arabic',    nativeName: 'العربية',   flag: '🇸🇦', dir: 'rtl' },
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!locales.includes(locale as Locale)) notFound()

  return {
    locale,
    // ../messages/ = frontend/messages/ relativo a frontend/src/i18n.ts
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
