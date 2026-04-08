import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt',
  localePrefix: 'always'
});

export const config = {
  // Garante que o middleware ignore arquivos e foque nas páginas
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
