/**
 * World Contrast — Election Grid + Bottom Sheet Filters
 * File: frontend/src/components/ElectionGrid.tsx
 *
 * Client Component. Recebe elections[] do servidor.
 * Filtro de busca + Bottom Sheet para mobile (Thumb Zone).
 * Design: "Quiet Luxury" — documento limpo, hierarquia clara.
 * Scaffolded for Vaul/Radix replacement when ready.
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { ElectionSummary } from '@/lib/data'

// ── i18n strings ──────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  searchPlaceholder: {
    pt: 'Buscar país ou eleição...',
    en: 'Search country or election...',
    es: 'Buscar país o elección...',
    fr: 'Rechercher pays ou élection...',
    de: 'Land oder Wahl suchen...',
    ar: 'البحث عن دولة أو انتخابات...',
  },
  filtersBtn: {
    pt: 'Filtros', en: 'Filters', es: 'Filtros',
    fr: 'Filtres', de: 'Filter', ar: 'تصفية',
  },
  statusAll: {
    pt: 'Todos os status', en: 'All statuses', es: 'Todos los estados',
    fr: 'Tous les statuts', de: 'Alle Status', ar: 'جميع الحالات',
  },
  statusLive: {
    pt: 'Ao vivo', en: 'Live', es: 'En vivo',
    fr: 'En direct', de: 'Live', ar: 'مباشر',
  },
  statusScheduled: {
    pt: 'Agendado', en: 'Scheduled', es: 'Programado',
    fr: 'Planifié', de: 'Geplant', ar: 'مجدول',
  },
  statusClosed: {
    pt: 'Encerrado', en: 'Closed', es: 'Cerrado',
    fr: 'Terminé', de: 'Abgeschlossen', ar: 'مغلق',
  },
  candidates: {
    pt: 'candidatos', en: 'candidates', es: 'candidatos',
    fr: 'candidats', de: 'Kandidaten', ar: 'مرشحون',
  },
  records: {
    pt: 'registros SHA-256', en: 'SHA-256 records', es: 'registros SHA-256',
    fr: 'enregistrements SHA-256', de: 'SHA-256 Datensätze', ar: 'سجلات',
  },
  accessBtn: {
    pt: 'Acessar Registro', en: 'Access Registry', es: 'Acceder al Registro',
    fr: 'Accéder au Registre', de: 'Register aufrufen', ar: 'الوصول إلى السجل',
  },
  apply: {
    pt: 'Aplicar', en: 'Apply', es: 'Aplicar',
    fr: 'Appliquer', de: 'Anwenden', ar: 'تطبيق',
  },
  noResults: {
    pt: 'Nenhuma jurisdição encontrada.', en: 'No jurisdictions found.',
    es: 'No se encontraron jurisdicciones.', fr: 'Aucune juridiction trouvée.',
    de: 'Keine Zuständigkeiten gefunden.', ar: 'لم يتم العثور على ولايات قضائية.',
  },
}

function t(key: string, locale: string): string {
  return i18n[key]?.[locale] ?? i18n[key]?.['en'] ?? key
}

// ── Normalization for accent-insensitive search ───────────
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ── Election name extractor ───────────────────────────────
function getElectionName(e: ElectionSummary, locale: string): string {
  if (typeof e.electionName === 'object') {
    return e.electionName[locale]
      || e.electionName['en']
      || e.electionName['pt']
      || Object.values(e.electionName)[0]
      || ''
  }
  return String(e.electionName)
}

// ── Fake SHA-256 preview (deterministic from id) ──────────
function hashPreview(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i)
    h |= 0
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0')
  return `${hex}...${hex.split('').reverse().join('')}`
}

// ── Props ─────────────────────────────────────────────────
interface Props {
  elections: ElectionSummary[]
  locale: string
}

export default function ElectionGrid({ elections, locale }: Props) {
  const [query, setQuery]         = useState('')
  const [statusFilter, setStatus] = useState<'all' | 'live' | 'scheduled' | 'closed'>('all')
  const [sheetOpen, setSheet]     = useState(false)
  const [isMobile, setMobile]     = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close sheet on backdrop click
  useEffect(() => {
    if (!sheetOpen) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setSheet(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sheetOpen])

  // Lock body scroll when sheet open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  // Filter logic
  const filtered = elections.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (!query.trim()) return true
    const q = normalize(query)
    const name = normalize(getElectionName(e, locale))
    const country = normalize(e.country || '')
    const flag = e.flag || ''
    const countryNames = typeof e.countryName === 'object'
      ? Object.values(e.countryName).map(normalize)
      : []
    return (
      name.includes(q) ||
      country.includes(q) ||
      flag.includes(q) ||
      countryNames.some(n => n.includes(q))
    )
  })

  const StatusFilter = () => (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap',
    }}>
      {(['all', 'live', 'scheduled', 'closed'] as const).map(s => {
        const label = s === 'all'
          ? t('statusAll', locale)
          : t(`status${s.charAt(0).toUpperCase() + s.slice(1)}`, locale)
        const active = statusFilter === s
        return (
          <button
            key={s}
            onClick={() => { setStatus(s); setSheet(false) }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9, letterSpacing: 2,
              textTransform: 'uppercase',
              padding: '7px 14px',
              border: `1px solid ${active ? 'var(--gold-bdr)' : 'var(--rule-soft)'}`,
              background: active ? 'var(--gold-dim)' : 'transparent',
              color: active ? 'var(--gold)' : 'var(--plat-muted)',
              borderRadius: 2, cursor: 'pointer',
              transition: 'all 0.18s',
              minHeight: 36,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      {/* ── Inline styles ─────────────────────────────── */}
      <style>{`
        .eg-wrap { position: relative; }

        /* Search bar */
        .eg-search-row {
          display: flex; gap: 10px; align-items: center;
          margin-bottom: 40px;
        }
        .eg-search {
          flex: 1;
          padding: 14px 18px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--platinum);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--rule-soft);
          outline: none;
          transition: border-color 0.2s;
          letter-spacing: 0.04em;
        }
        .eg-search::placeholder { color: var(--plat-muted); }
        .eg-search:focus { border-bottom-color: var(--gold-bdr); }

        .eg-filter-btn {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 2px;
          text-transform: uppercase;
          padding: 10px 16px;
          border: 1px solid var(--rule-soft);
          background: transparent;
          color: var(--plat-muted);
          border-radius: 2px; cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          transition: all 0.18s; min-height: 44px;
          white-space: nowrap;
        }
        .eg-filter-btn:hover { border-color: var(--gold-bdr); color: var(--gold); }
        .eg-filter-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--emerald);
          display: none;
        }
        .eg-filter-dot.active { display: block; }

        /* Desktop filters row */
        .eg-desktop-filters {
          margin-bottom: 40px;
        }
        @media(max-width: 768px) {
          .eg-desktop-filters { display: none; }
        }

        /* Grid */
        .eg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1px;
          background: var(--rule-soft);
        }
        @media(max-width: 560px) {
          .eg-grid { grid-template-columns: 1fr; }
        }

        /* Election card — "legal document" style */
        .eg-card {
          background: var(--onyx);
          padding: 32px 28px;
          display: flex; flex-direction: column;
          gap: 0;
          text-decoration: none; color: inherit;
          transition: background 0.2s;
          position: relative;
        }
        .eg-card:hover { background: var(--onyx-hover); }

        .eg-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .eg-flag {
          font-size: 32px; line-height: 1;
        }
        .eg-status {
          font-family: var(--font-mono);
          font-size: 8px; letter-spacing: 2px;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 5px;
        }
        .eg-status.live { color: var(--emerald); }
        .eg-status.scheduled { color: var(--plat-muted); }
        .eg-status.closed { color: var(--plat-faint); }
        .eg-status-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: currentColor;
        }
        .eg-status.live .eg-status-dot {
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* Document title */
        .eg-name {
          font-family: var(--font-display);
          font-size: 20px; font-weight: 700;
          color: var(--platinum);
          line-height: 1.25; letter-spacing: -0.3px;
          margin-bottom: 8px;
        }

        /* Jurisdiction line */
        .eg-jurisdiction {
          font-family: var(--font-mono);
          font-size: 10px; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--plat-muted);
          margin-bottom: 32px;
        }

        /* SHA preview — the "document seal" */
        .eg-hash-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px;
          padding: 10px 0;
          border-top: 1px solid var(--rule-faint);
          border-bottom: 1px solid var(--rule-faint);
        }
        .eg-hash-icon { color: var(--emerald); font-size: 11px; }
        .eg-hash {
          font-family: var(--font-mono);
          font-size: 9px; color: var(--plat-faint);
          letter-spacing: 0.5px;
        }

        /* Meta row */
        .eg-meta {
          display: flex; justify-content: space-between;
          align-items: baseline;
        }
        .eg-counts {
          font-family: var(--font-mono);
          font-size: 9px; color: var(--plat-muted);
          letter-spacing: 0.5px;
        }
        .eg-arrow {
          font-family: var(--font-mono);
          font-size: 10px; letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--plat-faint);
          transition: color 0.2s;
        }
        .eg-card:hover .eg-arrow { color: var(--gold); }

        /* No results */
        .eg-empty {
          padding: 80px 28px;
          font-family: var(--font-mono);
          font-size: 11px; color: var(--plat-faint);
          letter-spacing: 1px; text-align: center;
          grid-column: 1 / -1;
          background: var(--onyx);
        }

        /* ── BOTTOM SHEET ─────────────────────────────── */
        .eg-sheet-backdrop {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.25s;
          pointer-events: none;
        }
        .eg-sheet-backdrop.open {
          opacity: 1; pointer-events: all;
        }
        .eg-sheet {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 401;
          background: var(--onyx-sheet);
          border-top: 1px solid var(--rule-soft);
          border-radius: 16px 16px 0 0;
          padding: 0 24px 40px;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          max-height: 70svh;
          overflow-y: auto;
        }
        .eg-sheet.open { transform: translateY(0); }

        .eg-sheet-handle {
          width: 36px; height: 4px;
          border-radius: 2px;
          background: var(--rule-soft);
          margin: 14px auto 28px;
        }
        .eg-sheet-title {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--plat-muted);
          margin-bottom: 20px;
        }
        .eg-sheet-options {
          display: flex; flex-direction: column; gap: 2px;
        }
        .eg-sheet-opt {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--rule-faint);
          font-size: 15px; color: var(--platinum);
          cursor: pointer; background: none; border-left: none;
          border-right: none; border-top: none;
          font-family: var(--font-display);
          width: 100%; text-align: left;
          transition: color 0.15s;
        }
        .eg-sheet-opt:last-child { border-bottom: none; }
        .eg-sheet-opt.active { color: var(--gold); }
        .eg-sheet-opt-check {
          font-size: 14px; opacity: 0;
          color: var(--gold); transition: opacity 0.15s;
        }
        .eg-sheet-opt.active .eg-sheet-opt-check { opacity: 1; }

        /* Thumb-zone FAB for mobile */
        .eg-fab {
          display: none;
          position: fixed;
          bottom: 28px; left: 50%;
          transform: translateX(-50%);
          z-index: 300;
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 2px;
          text-transform: uppercase;
          background: var(--onyx-3);
          color: var(--platinum);
          border: 1px solid var(--rule-soft);
          padding: 12px 24px;
          border-radius: 24px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          display: none; align-items: center; gap: 8px;
          min-height: 48px;
          white-space: nowrap;
        }
        @media(max-width: 768px) {
          .eg-fab { display: flex; }
        }
      `}</style>

      <div className="eg-wrap">

        {/* ── Search + desktop filter btn ───────────────── */}
        <div className="eg-search-row">
          <input
            className="eg-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder', locale)}
            aria-label={t('searchPlaceholder', locale)}
            autoComplete="off"
            spellCheck={false}
          />
          {/* Desktop: filter button inline */}
          {!isMobile && (
            <button
              className="eg-filter-btn"
              onClick={() => setSheet(s => !s)}
              aria-expanded={sheetOpen}
            >
              <span
                className={`eg-filter-dot ${statusFilter !== 'all' ? 'active' : ''}`}
              />
              {t('filtersBtn', locale)}
            </button>
          )}
        </div>

        {/* ── Desktop filter row ───────────────────────── */}
        {!isMobile && (
          <div className="eg-desktop-filters">
            <StatusFilter />
          </div>
        )}

        {/* ── Election cards ───────────────────────────── */}
        <div className="eg-grid" role="list">
          {filtered.length === 0 ? (
            <div className="eg-empty">{t('noResults', locale)}</div>
          ) : filtered.map(election => {
            const name   = getElectionName(election, locale)
            const isLive = election.status === 'live'
            const hash   = hashPreview(election.id)
            const statusKey = election.status === 'live'
              ? 'statusLive'
              : election.status === 'scheduled'
              ? 'statusScheduled'
              : 'statusClosed'

            return (
              <Link
                key={election.id}
                href={`/${locale}/compare/${election.id}`}
                className="eg-card"
                role="listitem"
                aria-label={name}
              >
                {/* Top row: flag + live status */}
                <div className="eg-card-top">
                  <span className="eg-flag" aria-hidden="true">{election.flag}</span>
                  <span className={`eg-status ${election.status}`}>
                    <span className="eg-status-dot" aria-hidden="true" />
                    {t(statusKey, locale)}
                  </span>
                </div>

                {/* Document title */}
                <h3 className="eg-name">{name}</h3>

                {/* Jurisdiction + date */}
                <p className="eg-jurisdiction">
                  {election.country} · {election.electionDate}
                </p>

                {/* SHA seal */}
                <div className="eg-hash-row">
                  <span className="eg-hash-icon" aria-hidden="true">🔒</span>
                  <code className="eg-hash">SHA-256: {hash}</code>
                </div>

                {/* Meta + arrow */}
                <div className="eg-meta">
                  <span className="eg-counts">
                    {election.candidateCount} {t('candidates', locale)}
                    {' · '}
                    {election.promiseCount} {t('records', locale)}
                  </span>
                  <span className="eg-arrow" aria-hidden="true">
                    {locale === 'ar' ? '←' : '→'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Mobile FAB (Thumb Zone) ───────────────────── */}
        {isMobile && (
          <button
            className="eg-fab"
            onClick={() => setSheet(true)}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <span
              className={`eg-filter-dot ${statusFilter !== 'all' ? 'active' : ''}`}
            />
            {t('filtersBtn', locale)}
          </button>
        )}

        {/* ── Bottom Sheet ─────────────────────────────── */}
        <div
          className={`eg-sheet-backdrop ${sheetOpen ? 'open' : ''}`}
          aria-hidden="true"
          onClick={() => setSheet(false)}
        />
        <div
          ref={sheetRef}
          className={`eg-sheet ${sheetOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={t('filtersBtn', locale)}
        >
          <div className="eg-sheet-handle" aria-hidden="true" />
          <p className="eg-sheet-title">Status</p>
          <div className="eg-sheet-options" role="radiogroup">
            {(['all', 'live', 'scheduled', 'closed'] as const).map(s => {
              const label = s === 'all'
                ? t('statusAll', locale)
                : t(`status${s.charAt(0).toUpperCase() + s.slice(1)}`, locale)
              return (
                <button
                  key={s}
                  role="radio"
                  aria-checked={statusFilter === s}
                  className={`eg-sheet-opt ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => { setStatus(s); setSheet(false) }}
                >
                  {label}
                  <span className="eg-sheet-opt-check" aria-hidden="true">✓</span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </>
  )
}
