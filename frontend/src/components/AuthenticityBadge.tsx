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
  zh: {
    badge:       '正品',
    title:       '已验证数据',
    subtitle:    'POCVA-01 · SHA-256',
    labelHash:   'SHA-256 哈希',
    labelDate:   '收集日期',
    labelSource: '原始来源',
    labelArchive:'不可变存档',
    howTitle:    '如何独立验证',
    howText:     '下载原始页面。在原始内容上运行 SHA-256。结果必须与上面的哈希逐字符匹配。',
    openSource:  '开源审计 ↗',
    close:       '关闭',
  },
  ru: {
    badge:       'Подлинно',
    title:       'Проверенные данные',
    subtitle:    'POCVA-01 · SHA-256',
    labelHash:   'Хэш SHA-256',
    labelDate:   'Собрано',
    labelSource: 'Оригинальный источник',
    labelArchive:'Неизменяемый архив',
    howTitle:    'Как проверить самостоятельно',
    howText:     'Загрузите оригинальную страницу. Запустите SHA-256 для необработанного содержимого. Результат должен посимвольно совпадать с указанным выше хэшем.',
    openSource:  'Open-source аудит ↗',
    close:       'Закрыть',
  },
  hi: {
    badge:       'प्रमाणित',
    title:       'सत्यापित डेटा',
    subtitle:    'POCVA-01 · SHA-256',
    labelHash:   'SHA-256 हैश',
    labelDate:   'संग्रह की तारीख',
    labelSource: 'आधिकारिक स्रोत',
    labelArchive:'अपरिवर्तनीय संग्रह',
    howTitle:    'स्वतंत्र रूप से कैसे सत्यापित करें',
    howText:     'मूल पेज डाउनलोड करें। कच्चे कंटेंट पर SHA-256 चलाएं। परिणाम ऊपर दिए गए हैश से मेल खाना चाहिए।',
    openSource:  'ओपन-सोर्स ऑडिट ↗',
    close:       'बंद करें',
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
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: 'var(--ink-12)',
          border: '1px solid var(--rule)',
          borderRadius: '4px',
          padding: 0,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--digital-blue)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--rule)')}
      >
        {/* Glow Icon Section */}
        <div style={{
          background: 'var(--ink)',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--rule)',
          filter: 'drop-shadow(0 0 4px var(--digital-blue-20))'
        }}>
          <LockIcon size={14} color="var(--digital-blue)" />
        </div>

        {/* Label Section */}
        <div style={{
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--ink)',
          }}>
            {t.badge}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--ink-60)',
            background: 'var(--ink-06)',
            padding: '2px 6px',
            borderRadius: '2px',
            letterSpacing: '0.02em',
          }}>
            {shortHash}
          </span>
        </div>
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
              <div className="auth-modal-icon" style={{ background: 'var(--digital-blue-20)', border: '1px solid var(--digital-blue)' }}>
                <LockIcon size={18} color="var(--digital-blue)" />
              </div>
              <div>
                <p className="auth-modal-title" style={{ color: 'var(--digital-blue)', letterSpacing: '0.05em' }}>{t.title}</p>
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
