'use client'
// ============================================================
// World Contrast — Navbar Component
// File: src/components/layout/Navbar.tsx
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { locales, localeConfig, type Locale } from '@/i18n'

export default function Navbar() {
  const t = useTranslations('nav')
  const tLang = useTranslations('language')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [langOpen, setLangOpen] = useState(false)

  const currentLocaleConfig = localeConfig[locale]

  function switchLocale(newLocale: Locale) {
    // Replace the locale prefix in the current pathname
    const segments = pathname.split('/')
    // If current path has a locale prefix, replace it; otherwise prepend
    const isDefaultLocale = !locales.some(l => segments[1] === l)

    let newPath: string
    if (isDefaultLocale) {
      newPath = newLocale === 'en' ? pathname : `/${newLocale}${pathname}`
    } else {
      segments[1] = newLocale === 'en' ? '' : newLocale
      newPath = segments.filter(Boolean).join('/')
      if (!newPath.startsWith('/')) newPath = '/' + newPath
    }

    setLangOpen(false)
    router.push(newPath)
  }

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href={`/${locale === 'en' ? '' : locale}`} style={{
        fontSize: '17px',
        fontWeight: 800,
        color: '#0B1D2E',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
      }}>
        World<span style={{ color: '#C8A96E' }}>Contrast</span>
      </Link>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <NavLink href={`/countries`} locale={locale}>{t('countries')}</NavLink>
        <NavLink href={`/manifesto`} locale={locale}>{t('manifesto')}</NavLink>
        <NavLink href={`/audit`} locale={locale}>{t('audit')}</NavLink>
        <a
          href="https://github.com/worldcontrast/promises"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', padding: '6px 12px', textDecoration: 'none' }}
        >
          {t('github')} ↗
        </a>
      </div>

      {/* Right: Language + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Language selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#6B7280',
              background: '#F3F4F6',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'inherit',
            }}
          >
            {currentLocaleConfig?.flag} {currentLocaleConfig?.name.slice(0, 2).toUpperCase()} ▾
          </button>

          {langOpen && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setLangOpen(false)}
              />
              {/* Dropdown */}
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '8px',
                zIndex: 20,
                minWidth: '180px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', padding: '4px 8px 8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {tLang('select')}
                </div>
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 10px',
                      background: l === locale ? '#F9FAFB' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      fontWeight: l === locale ? 700 : 500,
                      color: l === locale ? '#0B1D2E' : '#374151',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{localeConfig[l].flag}</span>
                    {localeConfig[l].name}
                    {l === locale && <span style={{ marginLeft: 'auto', color: '#C8A96E', fontSize: '12px' }}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Compare CTA */}
        <Link
          href={`/compare/brazil-2026`}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            background: '#0B1D2E',
            padding: '9px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          {t('compare')}
        </Link>
      </div>
    </nav>
  )
}

function NavLink({
  href,
  locale,
  children,
}: {
  href: string
  locale: Locale
  children: React.ReactNode
}) {
  const prefix = locale === 'en' ? '' : `/${locale}`
  return (
    <Link
      href={`${prefix}${href}`}
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#6B7280',
        padding: '6px 12px',
        textDecoration: 'none',
        borderRadius: '6px',
        transition: 'color 0.15s',
      }}
    >
      {children}
    </Link>
  )
}
