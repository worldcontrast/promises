/**
 * World Contrast — Navbar Institucional
 * File: frontend/src/components/layout/Navbar.tsx
 *
 * Design: autoridade de documento soberano.
 * Sem hamburger menu em desktop. Sem sombra pesada.
 * O brand usa serif (fato instucional) — os links usam sans (máquina).
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { locales, localeConfig, type Locale } from '@/i18n'

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = (
    locales.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) || 'en'
  ) as Locale

  const cfg = localeConfig[currentLocale]

  function switchLocale(l: Locale) {
    const seg = pathname.split('/')
    const hasLocale = locales.includes(seg[1] as Locale)
    const rest = hasLocale ? seg.slice(2).join('/') : seg.slice(1).join('/')
    const newPath = l === 'en' ? `/${rest}` : `/${l}/${rest}`
    setLangOpen(false)
    router.push(newPath || '/')
  }

  const navLinks = [
    { href: `/${currentLocale}/compare/brazil-2026`, label: { en: 'Compare', pt: 'Comparar', es: 'Comparar', fr: 'Comparer', ar: 'مقارنة', zh: '比较' } },
    { href: `/${currentLocale}`, label: { en: 'Countries', pt: 'Países', es: 'Países', fr: 'Pays', ar: 'الدول', zh: '国家' } },
    { href: 'https://github.com/worldcontrast/promises', label: { en: 'GitHub ↗', pt: 'GitHub ↗', es: 'GitHub ↗', fr: 'GitHub ↗', ar: 'GitHub ↗', zh: 'GitHub ↗' }, external: true },
  ]

  const loc = currentLocale as string

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">

      {/* Brand — serif = documento oficial */}
      <Link href={`/${currentLocale}`} className="navbar-brand" id="navbar-brand">
        World<em>Contrast</em>
      </Link>

      {/* Nav links — sans = máquina */}
      <div className="navbar-nav" role="list">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="navbar-link"
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {(link.label as Record<string, string>)[loc] || link.label.en}
          </Link>
        ))}
      </div>

      {/* Right actions */}
      <div className="navbar-actions">

        {/* Language switcher */}
        <div style={{ position: 'relative' }}>
          <button
            id="lang-switcher-btn"
            onClick={() => setLangOpen(!langOpen)}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-3xs)',
              fontWeight: 500,
              letterSpacing: '0.10em',
              color: 'var(--ink-60)',
              background: 'var(--ink-06)',
              border: '1px solid var(--rule)',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textTransform: 'uppercase' as const,
            }}
          >
            <span aria-hidden="true">{cfg.flag}</span>
            {currentLocale.toUpperCase()}
            <span aria-hidden="true" style={{ opacity: 0.5, fontSize: 8 }}>▾</span>
          </button>

          {langOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setLangOpen(false)}
                aria-hidden="true"
              />
              <div
                role="listbox"
                id="lang-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--paper)',
                  border: '1px solid var(--rule)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px',
                  zIndex: 20,
                  minWidth: 160,
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                {locales.map(l => (
                  <button
                    key={l}
                    role="option"
                    aria-selected={l === currentLocale}
                    onClick={() => switchLocale(l)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '7px 10px',
                      background: l === currentLocale ? 'var(--ink-06)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: l === currentLocale ? 600 : 400,
                      color: 'var(--ink)',
                      textAlign: 'left' as const,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{localeConfig[l].flag}</span>
                    {localeConfig[l].name}
                    {l === currentLocale && (
                      <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: 10 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/${currentLocale}/compare/brazil-2026`}
          className="navbar-cta"
          id="navbar-compare-cta"
        >
          {currentLocale === 'pt' ? 'Comparar' : currentLocale === 'es' ? 'Comparar' : 'Compare'}
        </Link>
      </div>
    </nav>
  )
}
