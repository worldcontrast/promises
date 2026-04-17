import createMiddleware from 'next-intl/middleware'

// Deve ser idêntico ao array locales em src/i18n.ts
export default createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt',
  localePrefix: 'always',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
