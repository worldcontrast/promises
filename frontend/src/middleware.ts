import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'pt', 'es', 'fr', 'de', 'ar'],
  defaultLocale: 'pt'
});

export const config = {
  // Matcher padrão que a Vercel entende perfeitamente
  matcher: ['/', '/(de|en|es|fr|pt|ar)/:path*']
};
