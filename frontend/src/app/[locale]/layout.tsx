import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, localeConfig, type Locale } from '@/i18n'
import Navbar from '@/components/layout/Navbar'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'World Contrast', template: '%s — World Contrast' },
  description: 'Compare political campaign promises side by side. Official sources. Zero bias.',
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as Locale)) notFound()
  const messages = await getMessages()
  const dir = localeConfig[locale as Locale]?.dir || 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
