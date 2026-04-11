/**
 * World Contrast — Authenticity Badge v2.0
 * File: frontend/src/components/AuthenticityBadge.tsx
 *
 * Selo de autenticidade SHA-256 — "Lacre do Cartório Digital"
 * Suporta: en, pt, es, fr, de, ar, zh, ja, hi, ru
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

// ─── TRADUÇÕES COMPLETAS ───────────────────────────────────────
const COPY: Record<string, {
  badge: string; title: string; subtitle: string; hash: string
  collected: string; source: string; archive: string
  howto: string; howtoText: string; close: string; openSource: string
}> = {
  en: {
    badge:      'Authentic',
    title:      'Verified data',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'SHA-256 Hash',
    collected:  'Collected on',
    source:     'Original source',
    archive:    'Immutable archive',
    howto:      'How to verify',
    howtoText:  'Download the original page and run SHA-256. The result must match the hash above exactly.',
    close:      'Close',
    openSource: 'Open-source audit ↗',
  },
  pt: {
    badge:      'Autêntico',
    title:      'Dado autenticado',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'Hash SHA-256',
    collected:  'Coletado em',
    source:     'Fonte original',
    archive:    'Arquivo imutável',
    howto:      'Como verificar',
    howtoText:  'Baixe a página original e execute SHA-256. O resultado deve ser idêntico ao hash acima.',
    close:      'Fechar',
    openSource: 'Auditoria open-source ↗',
  },
  es: {
    badge:      'Auténtico',
    title:      'Dato autenticado',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'Hash SHA-256',
    collected:  'Recopilado el',
    source:     'Fuente original',
    archive:    'Archivo inmutable',
    howto:      'Cómo verificar',
    howtoText:  'Descargue la página original y ejecute SHA-256. El resultado debe coincidir exactamente con el hash anterior.',
    close:      'Cerrar',
    openSource: 'Auditoría open-source ↗',
  },
  fr: {
    badge:      'Authentique',
    title:      'Donnée authentifiée',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'Hash SHA-256',
    collected:  'Collecté le',
    source:     'Source originale',
    archive:    'Archive immuable',
    howto:      'Comment vérifier',
    howtoText:  'Téléchargez la page originale et exécutez SHA-256. Le résultat doit correspondre exactement au hash ci-dessus.',
    close:      'Fermer',
    openSource: 'Audit open-source ↗',
  },
  de: {
    badge:      'Authentisch',
    title:      'Verifizierte Daten',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'SHA-256-Hash',
    collected:  'Erfasst am',
    source:     'Originalquelle',
    archive:    'Unveränderliches Archiv',
    howto:      'So verifizieren',
    howtoText:  'Laden Sie die Originalseite herunter und führen Sie SHA-256 aus. Das Ergebnis muss genau mit dem obigen Hash übereinstimmen.',
    close:      'Schließen',
    openSource: 'Open-Source-Prüfung ↗',
  },
  ar: {
    badge:      'موثّق',
    title:      'بيانات موثّقة',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'تجزئة SHA-256',
    collected:  'تم جمعه في',
    source:     'المصدر الأصلي',
    archive:    'أرشيف غير قابل للتغيير',
    howto:      'كيفية التحقق',
    howtoText:  'قم بتنزيل الصفحة الأصلية وتشغيل SHA-256. يجب أن تتطابق النتيجة بالضبط مع التجزئة أعلاه.',
    close:      'إغلاق',
    openSource: 'تدقيق مفتوح المصدر ↗',
  },
  zh: {
    badge:      '已验证',
    title:      '数据已认证',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'SHA-256 哈希值',
    collected:  '采集于',
    source:     '原始来源',
    archive:    '不可变档案',
    howto:      '如何验证',
    howtoText:  '下载原始页面并运行 SHA-256。结果必须与上方哈希值完全一致。',
    close:      '关闭',
    openSource: '开源审计 ↗',
  },
  ja: {
    badge:      '認証済み',
    title:      '認証されたデータ',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'SHA-256ハッシュ',
    collected:  '収集日',
    source:     '元のソース',
    archive:    '不変アーカイブ',
    howto:      '検証方法',
    howtoText:  '元のページをダウンロードしてSHA-256を実行してください。結果は上記のハッシュと完全に一致する必要があります。',
    close:      '閉じる',
    openSource: 'オープンソース監査 ↗',
  },
  hi: {
    badge:      'प्रामाणिक',
    title:      'सत्यापित डेटा',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'SHA-256 हैश',
    collected:  'एकत्र किया गया',
    source:     'मूल स्रोत',
    archive:    'अपरिवर्तनीय संग्रह',
    howto:      'कैसे सत्यापित करें',
    howtoText:  'मूल पृष्ठ डाउनलोड करें और SHA-256 चलाएं। परिणाम ऊपर दिए गए हैश से बिल्कुल मेल खाना चाहिए।',
    close:      'बंद करें',
    openSource: 'ओपन-सोर्स ऑडिट ↗',
  },
  ru: {
    badge:      'Подлинно',
    title:      'Данные верифицированы',
    subtitle:   'World Contrast · SHA-256 · POCVA-01',
    hash:       'Хеш SHA-256',
    collected:  'Собрано',
    source:     'Исходный источник',
    archive:    'Неизменяемый архив',
    howto:      'Как проверить',
    howtoText:  'Скачайте исходную страницу и запустите SHA-256. Результат должен точно совпадать с хешем выше.',
    close:      'Закрыть',
    openSource: 'Аудит с открытым кодом ↗',
  },
}

export default function AuthenticityBadge({
  hash,
  collectedAt,
  sourceUrl,
  archiveUrl,
  locale = 'en',
}: AuthenticityProps) {
  const [open, setOpen] = useState(false)

  // Fallback seguro para locale não suportado
  const t = COPY[locale] ?? COPY['en']

  const dateFormatted = collectedAt
    ? (() => {
        try {
          return new Date(collectedAt).toLocaleDateString(
            locale === 'ar' ? 'ar-SA'
            : locale === 'zh' ? 'zh-CN'
            : locale === 'ja' ? 'ja-JP'
            : locale === 'hi' ? 'hi-IN'
            : locale === 'ru' ? 'ru-RU'
            : locale === 'de' ? 'de-DE'
            : locale === 'fr' ? 'fr-FR'
            : locale === 'es' ? 'es-ES'
            : locale === 'pt' ? 'pt-BR'
            : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )
        } catch {
          return collectedAt.slice(0, 10)
        }
      })()
    : '—'

  const isRTL = locale === 'ar'

  return (
    <>
      {/* ── BADGE INLINE ── */}
      <button
        onClick={() => setOpen(true)}
        className="auth-badge"
        title={t.title}
        aria-label={t.title}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <LockIcon />
        {t.badge}
      </button>

      {/* ── MODAL ── */}
      {open && (
        <div
          className="auth-modal-overlay"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <div
            className="auth-modal"
            onClick={e => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
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

            {/* Hash */}
            <div className="auth-field">
              <p className="auth-field-label">{t.hash}</p>
              <code className="auth-field-value">{hash || '—'}</code>
            </div>

            {/* Data */}
            <div className="auth-field">
              <p className="auth-field-label">{t.collected}</p>
              <p className="auth-field-value" style={{ color: 'var(--paper-60)' }}>
                {dateFormatted}
              </p>
            </div>

            {/* Fonte */}
            <div className="auth-field">
              <p className="auth-field-label">{t.source}</p>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="auth-field-link"
              >
                {sourceUrl}
              </a>
            </div>

            {/* Arquivo */}
            {archiveUrl && (
              <div className="auth-field">
                <p className="auth-field-label">{t.archive}</p>
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

            {/* Como verificar */}
            <div className="auth-how-to">
              <p className="auth-how-to-label">{t.howto}</p>
              <p className="auth-how-to-text">{t.howtoText}</p>
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
                onClick={() => setOpen(false)}
                className="auth-close-btn"
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
      <rect x="1" y="6" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.2" />
      <path d="M3.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="9.5" r="1" fill={color} />
    </svg>
  )
}
