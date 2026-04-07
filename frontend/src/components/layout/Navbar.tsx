'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { locales, localeConfig, type Locale } from '@/i18n'

export default function Navbar() {
  const [open, setOpen] = useState(false)
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
    setOpen(false)
    router.push(newPath || '/')
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>

      <Link href="/" style={{ fontSize: 17, fontWeight: 800, color: '#0B1D2E', textDecoration: 'none', letterSpacing: -0.5 }}>
        World<span style={{ color: '#C8A96E' }}>Contrast</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link href="/compare/brazil-2026" style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', padding: '6px 12px', textDecoration: 'none' }}>Compare</Link>
        <Link href="/" style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', padding: '6px 12px', textDecoration: 'none' }}>Countries</Link>
        <a href="https://github.com/worldcontrast/promises" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', padding: '6px 12px', textDecoration: 'none' }}>GitHub ↗</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', background: '#F3F4F6', border: 'none', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {cfg.flag} {currentLocale.toUpperCase()} ▾
          </button>

          {open && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 8, zIndex: 20, minWidth: 160, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {locales.map(l => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', background: l === currentLocale ? '#F9FAFB' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: l === currentLocale ? 700 : 500, color: '#374151' }}
                  >
                    <span style={{ fontSize: 18 }}>{localeConfig[l].flag}</span>
                    {localeConfig[l].name}
                    {l === currentLocale && <span style={{ marginLeft: 'auto', color: '#C8A96E' }}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Link href="/compare/brazil-2026" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#0B1D2E', padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>
          Compare now
        </Link>
      </div>
    </nav>
  )
}
