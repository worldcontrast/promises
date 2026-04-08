import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  // Redireciona a raiz pura para a página principal em português
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/pt/compare/brazil-2026', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
