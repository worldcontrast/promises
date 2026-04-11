// src/middleware.ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'hi', 'ru'],
  defaultLocale: 'pt',
  localePrefix: 'always',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
