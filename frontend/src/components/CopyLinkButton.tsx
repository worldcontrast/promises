/**
 * World Contrast — Copy Link Button
 * File: frontend/src/components/CopyLinkButton.tsx
 *
 * Permite que jornalistas e pesquisadores copiem o link
 * direto para uma promessa específica via âncora (#id).
 */
'use client'

import { useState } from 'react'

const LABELS: Record<string, { copy: string; done: string }> = {
  en: { copy: 'Copy link', done: 'Copied!' },
  pt: { copy: 'Copiar link', done: 'Copiado!' },
  es: { copy: 'Copiar enlace', done: '¡Copiado!' },
  fr: { copy: 'Copier le lien', done: 'Copié !' },
  de: { copy: 'Link kopieren', done: 'Kopiert!' },
  ar: { copy: 'نسخ الرابط', done: 'تم النسخ!' },
  zh: { copy: '复制链接', done: '已复制！' },
  ja: { copy: 'リンクをコピー', done: 'コピーしました！' },
  hi: { copy: 'लिंक कॉपी करें', done: 'कॉपी हो गया!' },
  ru: { copy: 'Скопировать ссылку', done: 'Скопировано!' },
}

interface Props {
  promiseId: string
  locale: string
}

export default function CopyLinkButton({ promiseId, locale }: Props) {
  const [copied, setCopied] = useState(false)
  const t = LABELS[locale] ?? LABELS['en']

  async function handleCopy() {
    try {
      const base = window.location.href.split('#')[0]
      await navigator.clipboard.writeText(`${base}#${promiseId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback para browsers sem clipboard API
      const input = document.createElement('input')
      input.value = `${window.location.href.split('#')[0]}#${promiseId}`
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`copy-link-btn${copied ? ' copied' : ''}`}
      aria-label={t.copy}
      title={t.copy}
    >
      {copied ? t.done : '⌗'}
    </button>
  )
}
