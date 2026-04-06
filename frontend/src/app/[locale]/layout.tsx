// ============================================================
// World Contrast — Root Layout
// File: src/app/[locale]/layout.tsx
// ============================================================

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, localeConfig, type Locale } from '@/i18n'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

// Generate metadata per locale
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    title: {
      default: t('homeTitle'),
      template: `%s — World Contrast`,
    },
    description: t('homeDescription'),
    metadataBase: new URL('https://worldcontrast.org'),
    openGraph: {
      siteName: 'World Contrast',
      locale,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  // Validate locale
  if (!locales.includes(locale)) notFound()

  // Load messages for this locale
  const messages = await getMessages()

  const dir = localeConfig[locale]?.dir || 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body className={font.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
