/**
 * World Contrast — Navbar Institucional
 * File: frontend/src/components/layout/Navbar.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { locales, localeConfig, type Locale } from '@/i18n'

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontScale, setFontScale] = useState<'small' | 'normal' | 'large'>('normal')
  
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    const savedFont = localStorage.getItem('font-scale') as any
    if (savedFont) {
      setFontScale(savedFont)
      if (savedFont !== 'normal') document.documentElement.classList.add(`font-${savedFont}`)
    }
  }, [])

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  function cycleFont() {
    const scales: ('small' | 'normal' | 'large')[] = ['small', 'normal', 'large']
    const next = scales[(scales.indexOf(fontScale) + 1) % scales.length]
    document.documentElement.classList.remove('font-small', 'font-large')
    if (next !== 'normal') document.documentElement.classList.add(`font-${next}`)
    setFontScale(next)
    localStorage.setItem('font-scale', next)
  }

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

  const loc = currentLocale as string

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      
      {/* ── LEFT: BRAND + TOOLBAR — Garante visibilidade absoluta ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href={`/${currentLocale}`} className="navbar-brand" id="navbar-brand">
          World<em>Contrast</em>
        </Link>

        {/* TOOLBAR — Tema e Fonte sempre visíveis */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            id="theme-toggle"
            title="Mudar Tema"
            style={{
              background: 'var(--ink-06)', border: '1px solid var(--rule)', cursor: 'pointer',
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', fontSize: '14px'
            }}
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
          <button
            onClick={cycleFont}
            id="font-cycle"
            title="Tamanho do Texto"
            style={{
              background: 'var(--ink-06)', border: '1px solid var(--rule)', cursor: 'pointer',
              padding: '0 8px', height: 32, borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800
            }}
          >
            {fontScale === 'small' ? 'A-' : fontScale === 'large' ? 'A+' : 'A'}
          </button>
        </div>
      </div>

      {/* ── CENTER: NAVIGATION (Hidden on very small screens if needed) ── */}
      <div className="navbar-nav hidden-mobile">
        <Link href={`/${currentLocale}/compare/brazil-2026`} className="navbar-link">
          {loc === 'pt' ? 'Comparar' : 'Compare'}
        </Link>
      </div>

      {/* ── RIGHT: LANGUAGE + CTA ── */}
      <div className="navbar-actions">
        {/* Language switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
              color: 'var(--ink-60)', background: 'var(--ink-06)', border: '1px solid var(--rule)',
              padding: '6px 10px', borderRadius: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <span>{cfg.flag}</span> {currentLocale.toUpperCase()}
          </button>

          {langOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--paper)', border: '1px solid var(--rule)',
              borderRadius: '6px', padding: '6px', zIndex: 100, minWidth: 140,
              boxShadow: 'var(--shadow-soft)'
            }}>
              {locales.map(l => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 12px', background: 'transparent', border: 'none',
                    borderRadius: '4px', cursor: 'pointer', color: 'var(--ink)',
                    fontSize: '13px', textAlign: 'left'
                  }}
                >
                  <span>{localeConfig[l].flag}</span> {localeConfig[l].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
