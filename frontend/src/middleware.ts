import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt',
  localePrefix: 'always'
});

export const config = {
  // Essa linha diz para o servidor ignorar arquivos e focar só nas páginas
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
