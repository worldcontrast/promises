import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'pt', 'es', 'fr', 'de', 'ar'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

export const localeConfig: Record<Locale, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English',   flag: '🇺🇸', dir: 'ltr' },
  pt: { name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  es: { name: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
  ar: { name: 'العربية',   flag: '🇸🇦', dir: 'rtl' },
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
