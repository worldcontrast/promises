import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, localeConfig, type Locale } from '@/i18n'
import Navbar from '@/components/layout/Navbar'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'World Contrast — Contraste & Registro Histórico Certificado', template: '%s — World Contrast' },
  description: 'Contraste & Registro Histórico Certificado de promessas políticas. Fontes oficiais. Zero viés.',
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // CORREÇÃO: Habilitando a renderização estática para o next-intl
  setRequestLocale(locale)

  if (!locales.includes(locale as Locale)) notFound()
  const messages = await getMessages()
  const dir = localeConfig[locale as Locale]?.dir || 'ltr'

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.setAttribute('data-theme', theme);
              
              const font = localStorage.getItem('font-scale') || 'normal';
              if (font !== 'normal') document.documentElement.classList.add('font-' + font);
            } catch (e) {}
          })()
        `}} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
