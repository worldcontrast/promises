import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // Isso obriga o site a sempre mostrar /pt ou /en
});

export const config = {
  // Captura absolutamente tudo, exceto arquivos internos
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
