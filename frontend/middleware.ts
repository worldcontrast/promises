import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Idiomas suportados
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  // Idioma padrão
  defaultLocale: 'pt',
  // Garante que o /pt ou /en sempre apareça
  localePrefix: 'always'
});

export const config = {
  // Ignora arquivos de sistema e imagens, foca nas páginas
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
