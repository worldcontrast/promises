/**
 * World Contrast — Authenticity Badge
 * File: frontend/src/components/AuthenticityBadge.tsx
 *
 * Exibe o selo de autenticidade ao lado de cada promessa.
 * Ao clicar, abre um painel com hash, data, e link de verificação.
 */

'use client'

import { useState } from 'react'

interface AuthenticityProps {
  hash: string           // SHA-256 do conteúdo da página
  collectedAt: string    // ISO date string
  sourceUrl: string      // URL original do candidato
  archiveUrl?: string    // Wayback Machine URL
  locale?: string
}

const copy = {
  en: {
    verified:     'Verified data',
    hash:         'SHA-256 Hash',
    collected:    'Collected on',
    source:       'Original source',
    archive:      'Immutable archive',
    howto:        'How to verify',
    howtoText:    'Download the original page and run SHA-256. The result must match the hash above exactly.',
    close:        'Close',
    badge:        'Authentic',
    openSource:   'Open-source audit',
  },
  pt: {
    verified:     'Dado autenticado',
    hash:         'Hash SHA-256',
    collected:    'Coletado em',
    source:       'Fonte original',
    archive:      'Arquivo imutável',
    howto:        'Como verificar',
    howtoText:    'Baixe a página original e execute SHA-256. O resultado deve ser idêntico ao hash acima.',
    close:        'Fechar',
    badge:        'Autêntico',
    openSource:   'Auditoria open-source',
  },
}

export default function AuthenticityBadge({
  hash,
  collectedAt,
  sourceUrl,
  archiveUrl,
  locale = 'pt',
}: AuthenticityProps) {
  const [open, setOpen] = useState(false)
  const t = copy[locale as keyof typeof copy] || copy.en
  const shortHash = hash ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : '—'
  const dateFormatted = collectedAt
    ? new Date(collectedAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—'

  return (
    <>
      {/* ── INLINE BADGE ── */}
      <button
        onClick={() => setOpen(true)}
        title={t.verified}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: '0.5px solid rgba(200,169,110,0.4)',
          borderRadius: 3,
          padding: '2px 7px',
          cursor: 'pointer',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color: '#C8A96E',
          transition: 'border-color .2s, background .2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,169,110,0.08)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'none'
        }}
      >
        <LockIcon />
        {t.badge}
      </button>

      {/* ── MODAL OVERLAY ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(11,29,46,0.72)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0B1D2E',
              border: '1px solid rgba(200,169,110,0.25)',
              borderRadius: 4,
              padding: '32px 28px',
              maxWidth: 480,
              width: '100%',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(200,169,110,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LockIcon size={16} color="#C8A96E" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F0E8' }}>
                  {t.verified}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  World Contrast · SHA-256
                </div>
              </div>
            </div>

            {/* Hash */}
            <Row label={t.hash}>
              <code style={{
                fontSize: 11, color: '#C8A96E',
                background: 'rgba(200,169,110,0.08)',
                padding: '4px 8px', borderRadius: 3,
                wordBreak: 'break-all', display: 'block', lineHeight: 1.6,
              }}>
                {hash || '—'}
              </code>
            </Row>

            {/* Date */}
            <Row label={t.collected}>
              <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.7)' }}>
                {dateFormatted}
              </span>
            </Row>

            {/* Source */}
            <Row label={t.source}>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: '#3B82F6', wordBreak: 'break-all' }}
              >
                {sourceUrl}
              </a>
            </Row>

            {/* Archive */}
            {archiveUrl && (
              <Row label={t.archive}>
                <a
                  href={archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#3B82F6' }}
                >
                  Wayback Machine ↗
                </a>
              </Row>
            )}

            {/* How to verify */}
            <div style={{
              marginTop: 20,
              padding: '12px 14px',
              background: 'rgba(245,240,232,0.04)',
              borderLeft: '2px solid rgba(200,169,110,0.3)',
              borderRadius: '0 3px 3px 0',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#C8A96E', marginBottom: 6, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {t.howto}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.5)', lineHeight: 1.7 }}>
                {t.howtoText}
              </p>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <a
                href="https://github.com/worldcontrast/promises"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', textDecoration: 'none', letterSpacing: '0.5px' }}
              >
                {t.openSource} ↗
              </a>
              <button
                onClick={() => setOpen(false)}
                style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '8px 20px',
                  background: 'rgba(245,240,232,0.08)',
                  border: '0.5px solid rgba(245,240,232,0.15)',
                  borderRadius: 3,
                  color: 'rgba(245,240,232,0.7)',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(245,240,232,0.35)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function LockIcon({ size = 10, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="6" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M3.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="6" cy="9.5" r="1" fill={color}/>
    </svg>
  )
}
