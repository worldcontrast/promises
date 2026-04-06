// ============================================================
// World Contrast — Middleware (locale routing)
// File: middleware.ts
//
// Handles automatic locale detection from browser preferences.
// A user visiting worldcontrast.org from Brazil automatically
// gets the Portuguese version. From France → French. Etc.
// ============================================================

import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n'

export default createMiddleware({
  // Supported locales
  locales,

  // Default locale (used when no locale is detected)
  defaultLocale,

  // Locale detection strategy:
  // 1. URL prefix (/pt/compare, /es/compare)
  // 2. Accept-Language header (browser preference)
  // 3. Default locale
  localeDetection: true,

  // URL structure: /en/compare, /pt/compare, etc.
  // The default locale (en) has no prefix: /compare
  localePrefix: 'as-needed',
})

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
