/**
 * World Contrast — AuthenticityBadge
 * File: frontend/src/components/AuthenticityBadge.tsx
 *
 * Redesenhado como o LACRE DO CARTÓRIO — austero, técnico, definitivo.
 * O botão é propositalmente discreto — não é marketing, é evidência.
 * O modal usa a tríade tipográfica:
 *   - Label → sans (máquina)
 *   - Hash  → mono (prova criptográfica)
 *   - Texto explicativo → sans legível
 */
'use client'

import { useState } from 'react'

interface AuthenticityProps {
  hash: string
  collectedAt: string
  sourceUrl: string
  archiveUrl?: string
  locale?: string
}

const i18n = {
  en: {
    badge:       'Authentic',
    title:       'Verified Data',
    subtitle:    'POCVA-01 · SHA-256',
    labelHash:   'SHA-256 Hash',
    labelDate:   'Collected on',
    labelSource: 'Original source',
    labelArchive:'Immutable archive',
    howTitle:    'How to verify independently',
    howText:     'Download the original page. Run SHA-256 on the raw content. The result must match the hash above character by character.',
    openSource:  'Open-source audit ↗',
    close:       'Close',
  },
  pt: {
    badge:       'Autêntico',
    title:       'Dado Autenticado',
    subtitle:    'POCVA-01 · SHA-256',
    labelHash:   'Hash SHA-256',
    labelDate:   'Coletado em',
    labelSource: 'Fonte original',
    labelArchive:'Arquivo imutável',
    howTitle:    'Como verificar independentemente',
    howText:     'Baixe a página original. Execute SHA-256 sobre o conteúdo bruto. O resultado deve coincidir com o hash acima caractere a caractere.',
    openSource:  'Auditoria open-source ↗',
    close:       'Fechar',
  },
  es: {
    badge:       'Auténtico',
    title:       'Dato Autenticado',
    subtitle:    'POCVA-01 · SHA-256',
    labelHash:   'Hash SHA-256',
    labelDate:   'Recopilado el',
    labelSource: 'Fuente original',
    labelArchive:'Archivo inmutable',
    howTitle:    'Cómo verificar de forma independiente',
    howText:     'Descargue la página original. Ejecute SHA-256 sobre el contenido bruto. El resultado debe coincidir con el hash anterior.',
    openSource:  'Auditoría open-source ↗',
    close:       'Cerrar',
  },
} as Record<string, {
  badge: string; title: string; subtitle: string;
  labelHash: string; labelDate: string; labelSource: string;
  labelArchive: string; howTitle: string; howText: string;
  openSource: string; close: string;
}>

export default function AuthenticityBadge({
  hash, collectedAt, sourceUrl, archiveUrl, locale = 'pt',
}: AuthenticityProps) {
  const [open, setOpen] = useState(false)
  const t = i18n[locale] || i18n.en

  const dateFormatted = collectedAt
    ? new Date(collectedAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—'

  // Exibe o hash truncado no badge para ocupar menos espaço
  const shortHash = hash ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : '—'

  return (
    <>
      {/* BADGE — discreto como um carimbo de cartório */}
      <button
        className="auth-badge"
        onClick={() => setOpen(true)}
        title={t.title}
        id={`auth-badge-${hash?.slice(0, 8)}`}
        aria-haspopup="dialog"
      >
        <LockIcon />
        {t.badge}
        {/* Hash curto visível — prova da prova */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          opacity: 0.5,
          letterSpacing: '0.04em',
        }}>
          {shortHash}
        </span>
      </button>

      {/* MODAL — Cartório Digital */}
      {open && (
        <div
          className="auth-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          onClick={() => setOpen(false)}
        >
          <div
            className="auth-modal"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="auth-modal-header">
              <div className="auth-modal-icon">
                <LockIcon size={16} color="var(--gold)" />
              </div>
              <div>
                <p className="auth-modal-title">{t.title}</p>
                <p className="auth-modal-subtitle">{t.subtitle}</p>
              </div>
            </div>

            {/* Hash — fonte mono = evidência técnica */}
            <div className="auth-field">
              <p className="auth-field-label">{t.labelHash}</p>
              <code className="auth-field-value">
                {hash || '—'}
              </code>
            </div>

            {/* Date — mono porque é dado técnico */}
            <div className="auth-field">
              <p className="auth-field-label">{t.labelDate}</p>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--paper-80)',
              }}>
                {dateFormatted}
              </span>
            </div>

            {/* Source */}
            <div className="auth-field">
              <p className="auth-field-label">{t.labelSource}</p>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="auth-field-link"
              >
                {sourceUrl}
              </a>
            </div>

            {/* Archive */}
            {archiveUrl && (
              <div className="auth-field">
                <p className="auth-field-label">{t.labelArchive}</p>
                <a
                  href={archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="auth-field-link"
                >
                  Wayback Machine ↗
                </a>
              </div>
            )}

            {/* How to verify */}
            <div className="auth-how-to">
              <p className="auth-how-to-label">{t.howTitle}</p>
              <p className="auth-how-to-text">{t.howText}</p>
            </div>

            {/* Footer */}
            <div className="auth-modal-footer">
              <a
                href="https://github.com/worldcontrast/promises"
                target="_blank"
                rel="noopener noreferrer"
                className="auth-open-source"
              >
                {t.openSource}
              </a>
              <button
                className="auth-close-btn"
                onClick={() => setOpen(false)}
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

function LockIcon({ size = 10, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="6" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M3.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="6" cy="9.5" r="1" fill={color}/>
    </svg>
  )
}
