import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // Mantendo apenas os idiomas com suporte real no momento
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt',
  localePrefix: 'always',
})

export const config = {
  // Protege as rotas internas e arquivos estáticos
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
