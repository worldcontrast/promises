import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  // Redireciona a raiz pura para a página inicial real (lista de países)
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/pt', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
