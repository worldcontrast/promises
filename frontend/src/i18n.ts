import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Definição estrita dos idiomas ativos para garantir o sucesso do build
export const locales = ['en', 'pt', 'es', 'fr', 'de', 'ar'] as const
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
}

export default getRequestConfig(async ({locale}) => {
  // Bloqueio de segurança: se o idioma não estiver na lista, para a execução
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
