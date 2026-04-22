/**
 * World Contrast — Compare Page v2.0
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * ARCHITECTURE: N-candidate matrix scroll
 * - Horizontal scroll: overflow-x + scroll-snap
 * - Each column: min-width 340px (mobile) / 400px (desktop)
 * - Candidate header: position sticky top (never lost on vertical scroll)
 * - Round segmented control (1st / 2nd round)
 * - Design System: Onyx/Platinum/Gold — identical to homepage + enterprise
 *
 * SCALABILITY: Works for 2 candidates (Brazil 2026 current)
 * and for 10+ candidates (first-round multiparty elections)
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection, getComparisonData, getLocalised } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'
import AuthenticityBadge from '@/components/AuthenticityBadge'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string; electionId: string }>
  searchParams: Promise<{ category?: string; round?: string }>
}

export async function generateStaticParams() { return [] }

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  const { category, round } = await searchParams
  const cat   = category as Category | undefined
  const activeRound = round || '1'

  const election = await getElection(electionId)
  if (!election) notFound()

  // N-candidate support: all candidates, randomised order each load
  const candidates = [...election.candidates].sort(() => Math.random() - 0.5)

  // Build comparison data for all N candidates against each other
  // getComparisonData returns rows per category; we call it once per candidate
  // and zip the results into column-indexed rows.
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]

  // For N candidates: build { category → { rows: Array<{[candidateId]: promise}> } }
  const matrixData = buildMatrix(election, candidates, cat)

  const isRTL = locale === 'ar'

  const L: Record<string, Record<string, string>> = {
    back:         { en: '← All countries', pt: '← Todos os países', es: '← Todos los países', fr: '← Tous les pays', de: '← Alle Länder', ar: 'جميع البلدان ←' },
    officialOnly: { en: 'Official sources', pt: 'Fontes oficiais', es: 'Fuentes oficiales', fr: 'Sources officielles', de: 'Offizielle Quellen', ar: 'مصادر رسمية' },
    updated:      { en: 'Updated', pt: 'Atualizado', es: 'Actualizado', fr: 'Mis à jour', de: 'Aktualisiert', ar: 'محدّث' },
    all:          { en: 'All', pt: 'Todos', es: 'Todos', fr: 'Tous', de: 'Alle', ar: 'الكل' },
    officialSrc:  { en: 'Official filing ↗', pt: 'Ficha oficial ↗', es: 'Ficha oficial ↗', fr: 'Dossier officiel ↗', de: 'Offizielle Akte ↗', ar: 'الملف الرسمي ↗' },
    noPromise:    { en: 'No commitment found in official sources.', pt: 'Nenhum compromisso encontrado nas fontes oficiais.', es: 'Ningún compromiso en fuentes oficiales.', fr: 'Aucun engagement trouvé.', de: 'Kein Versprechen gefunden.', ar: 'لم يتم العثور على التزامات رسمية.' },
    archive:      { en: 'Archive ↗', pt: 'Arquivo ↗', es: 'Archivo ↗', fr: 'Archive ↗', de: 'Archiv ↗', ar: 'أرشيف ↗' },
    entries:      { en: 'records', pt: 'registros', es: 'registros', fr: 'entrées', de: 'Einträge', ar: 'سجلات' },
    round1:       { en: '1st Round', pt: '1º Turno', es: '1ª Vuelta', fr: '1er Tour', de: '1. Runde', ar: 'الجولة الأولى' },
    round2:       { en: '2nd Round', pt: '2º Turno', es: '2ª Vuelta', fr: '2e Tour', de: '2. Runde', ar: 'الجولة الثانية' },
    footer:       { en: 'Zero bias · Official sources only', pt: 'Zero viés · Apenas fontes oficiais', es: 'Cero sesgo · Solo fuentes oficiales', fr: 'Zéro biais · Sources officielles uniquement', de: 'Null Voreingenommenheit · Nur offizielle Quellen', ar: 'صفر تحيز · المصادر الرسمية فقط' },
    disclaimer:   { en: 'Candidate column order is randomized on each load to prevent semiotic positioning bias.', pt: 'A ordem das colunas é randomizada a cada carregamento para anular viés semiótico de posicionamento.', es: 'El orden de candidatos se aleatoriza en cada carga para evitar sesgo semiótico.', fr: "L'ordre des candidats est aléatoire à chaque chargement pour éviter tout biais sémiotique.", de: 'Die Kandidatenreihenfolge wird bei jedem Laden zufällig bestimmt.', ar: 'يتم تعيين ترتيب المرشحين عشوائياً في كل تحميل لمنع التحيز.' },
    scrollHint:   { en: 'Scroll → to see all candidates', pt: 'Deslize → para ver todos os candidatos', es: 'Deslice → para ver todos', fr: 'Faites défiler → pour voir tous', de: 'Scrollen → für alle Kandidaten', ar: 'اسحب ← لرؤية جميع المرشحين' },
  }
  function t(k: string) { return L[k]?.[locale] ?? L[k]?.['en'] ?? k }

  const candidateCount = candidates.length
  const hasMultipleRounds = (election as any).hasRounds ?? false
  
  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           COMPARE PAGE v2 — DESIGN SYSTEM SYNC
           Onyx / Platinum / Gold — identical to homepage
           N-Candidate Matrix Scroll Architecture
           ═══════════════════════════════════════════════════ */

        :root {
          /* Core tokens — must match homepage/enterprise exactly */
          --onyx:         #0A0A0B;
          --onyx-2:       #111113;
          --onyx-3:       #18181B;
          --onyx-4:       #27272A;
          --onyx-5:       #3F3F46;
          --platinum:     #E4E4E7;
          --plat-muted:   #71717A;
          --plat-faint:   #3F3F46;
          --gold:         #C8A96E;
          --gold-dim:     rgba(200,169,110,0.10);
          --gold-bdr:     rgba(200,169,110,0.25);
          --emerald:      #10B981;
          --emerald-dim:  rgba(16,185,129,0.10);
          --rule:         rgba(255,255,255,0.06);
          --rule-faint:   rgba(255,255,255,0.04);
          --rule-gold:    rgba(200,169,110,0.15);

          /* Typography */
          --font-d: 'IBM Plex Sans', system-ui, sans-serif;
          --font-m: 'IBM Plex Mono', 'Courier New', monospace;

          /* Column geometry — responsive */
          --col-min:  340px;  /* mobile: narrow enough for thumb scroll */
          --col-max:  480px;  /* desktop: max column width */
          --col-w:    clamp(var(--col-min), 30vw, var(--col-max));

          /* Header height layers — for sticky calc */
          --nav-h:      60px;  /* fixed site header */
          --elect-h:    88px;  /* election title + meta + rounds */
          --filter-h:   52px;  /* category filter bar */
          --cand-stick: calc(var(--nav-h) + var(--elect-h));
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-root {
          font-family: var(--font-d);
          background: var(--onyx);
          color: var(--platinum);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* ── PAGE HEADER ─────────────────────────────────── */
        /* Fix 1: title scrolls away — frees vertical space for data */
        .cp-page-header {
          position: relative;
          background: var(--onyx);
          border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
        }

        .cp-breadcrumb {
          padding-top: 14px;
          padding-bottom: 4px;
        }
        .cp-breadcrumb a {
          font-family: var(--font-m);
          font-size: 12px; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--plat-muted);
          text-decoration: none; transition: color 0.18s;
        }
        .cp-breadcrumb a:hover { color: var(--platinum); }

        .cp-election-title {
          font-size: clamp(18px, 3vw, 28px);
          font-weight: 700; color: var(--platinum);
          letter-spacing: -0.5px;
          padding: 4px 0 2px;
        }

        .cp-meta {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-muted);
          letter-spacing: 0.3px; padding-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap;
        }
        .cp-meta a {
          color: var(--gold); text-decoration: none;
          transition: opacity 0.18s;
        }
        .cp-meta a:hover { opacity: 0.75; }
        .cp-meta-sep { color: var(--plat-faint); }

        /* ── ROUND SEGMENTED CONTROL ─────────────────────── */
        /* iOS-style pill toggle — Quiet Luxury version */
        .cp-rounds {
          display: flex;
          align-items: center;
          padding: 8px 0 12px;
          gap: 0;
        }
        .cp-rounds-track {
          display: inline-flex;
          background: var(--onyx-3);
          border: 1px solid var(--rule);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .cp-round-btn {
          font-family: var(--font-m);
          font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 7px 20px;
          border-radius: 6px;
          border: none; cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: background 0.18s, color 0.18s;
          color: var(--plat-muted);
          background: transparent;
          white-space: nowrap;
        }
        .cp-round-btn.active {
          background: var(--gold-dim);
          color: var(--gold);
          border: 1px solid var(--gold-bdr);
        }
        .cp-round-btn:not(.active):hover {
          color: var(--platinum);
          background: rgba(255,255,255,0.04);
        }

        /* ── SCROLL HINT — shown only when N > 2 ────────── */
        .cp-scroll-hint {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-muted);
          letter-spacing: 1px;
          padding: 6px clamp(16px,4vw,48px);
          background: var(--onyx);
          display: flex; align-items: center; gap: 6px;
          animation: fade-out 4s ease forwards;
          animation-delay: 3s;
        }
        @keyframes fade-out { to { opacity: 0; pointer-events: none; } }
        .cp-scroll-arrow { color: var(--gold); font-size: 14px; }

        /* ── CATEGORY FILTER BAR ─────────────────────────── */
        /* Fix 2a: filter bar — first sticky layer, always visible */
        .cp-filter-bar {
          position: sticky;
          top: 60px;           /* exactly: global nav height */
          z-index: 100;
          background: #0A0A0B; /* solid — no opacity gaps that break layering */
          border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .cp-filter-bar::-webkit-scrollbar { display: none; }
        .cp-filter-bar-inner {
          display: flex; gap: 4px;
          padding: 10px 0;
          min-width: max-content;
        }
        .cp-filter-pill {
          font-family: var(--font-m);
          font-size: 12px; font-weight: 400;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 6px 14px;
          border: 1px solid var(--rule);
          border-radius: 2px;
          color: var(--plat-muted);
          background: transparent;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .cp-filter-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-filter-pill.active {
          background: var(--gold-dim);
          color: var(--gold);
          border-color: var(--gold-bdr);
        }
        .cp-filter-emoji { font-size: 13px; }

        /* ── RESET MARGIN/PADDING TOP ────────────────────── */
        /* Mata qualquer "buraco" entre filtros e cabeçalhos */
        main,
        .cp-matrix-outer,
        .cp-matrix-inner,
        .cp-col {
          margin-top: 0;
          padding-top: 0;
        }

        /* ── MATRIX SCROLL CONTAINER ─────────────────────── */
        /* The outer wrapper clips; inner scrolls horizontally */
        .cp-matrix-outer {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          /* Hide scrollbar — touch + mouse still work */
          scrollbar-width: none;
        }
        .cp-matrix-outer::-webkit-scrollbar { display: none; }

        /* Inner table: N columns side by side */
        .cp-matrix-inner {
          display: flex;
          width: max-content;
          min-width: 100%;
        }

        /* One column per candidate */
        .cp-col {
          width: var(--col-w);
          min-width: var(--col-min);
          flex-shrink: 0;
          scroll-snap-align: start;
          border-right: 1px solid var(--rule-faint);
          display: flex;
          flex-direction: column;
        }
        .cp-col:last-child { border-right: none; }

        /* Fix 2b: candidate header — second sticky layer, slides under filter bar */
        .cp-cand-header {
          position: sticky;
          top: 112px;          /* 60px nav + 52px filter bar */
          z-index: 90;
          background: #111113; /* solid onyx-2 — no gaps */
          border-bottom: 1px solid var(--rule-gold);
          padding: 20px 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          /* Heavy shadow — content scrolls invisibly underneath */
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }

        .cp-cand-identity { display: flex; align-items: center; gap: 12px; }

        .cp-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: var(--onyx);
          flex-shrink: 0;
          overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.12);
        }
        .cp-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .cp-cand-name {
          font-size: 15px; font-weight: 700;
          color: var(--platinum); line-height: 1.25;
          letter-spacing: -0.2px;
        }
        .cp-cand-party {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-muted);
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        /* Official filing button — Quiet Luxury style */
        .cp-official-btn {
          font-family: var(--font-m);
          font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--gold);
          border: 1px solid var(--gold-bdr);        /* subtle, not heavy */
          background: var(--gold-dim);
          padding: 5px 12px; border-radius: 2px;
          text-decoration: none;
          display: inline-flex; align-items: center;
          align-self: flex-start;
          transition: background 0.18s, border-color 0.18s;
        }
        .cp-official-btn:hover {
          background: rgba(200,169,110,0.18);
          border-color: rgba(200,169,110,0.45);
        }

        /* Wrapper for column content to prevent overlapping and allow Flexbox fill */
        .cp-col-content {
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          flex: 1; /* Preenche toda a altura restante da coluna */
        }

        /* ── CATEGORY HEADER ROW ─────────────────────────── */
        /* Repeats per column, aligned via grid inside each section */
        .cp-cat-header {
          padding: 12px 24px 8px;
          border-bottom: 1px solid var(--rule-faint);
          border-top: 1px solid var(--rule);
          background: var(--onyx-3);
          display: flex; align-items: center; gap: 8px;
        }
        .cp-cat-dot {
          width: 6px; height: 6px; border-radius: 50%;
          flex-shrink: 0;
        }
        .cp-cat-label {
          font-family: var(--font-m);
          font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--plat-muted);
        }
        .cp-cat-count {
          font-family: var(--font-m);
          font-size: 10px; color: var(--plat-faint);
          margin-left: auto;
        }

        /* ── PROMISE CARD ────────────────────────────────── */
        /* "Lacrado" document aesthetic — generous negative space */
        .cp-promise {
          padding: 28px 24px 24px;
          border-bottom: 1px solid var(--rule-faint);
          display: flex; flex-direction: column; gap: 14px;
          /* Min height ensures columns stay in sync visually */
          min-height: 180px;
        }
        .cp-promise--empty {
          padding: 28px 24px;
          border-bottom: 1px solid var(--rule-faint);
          min-height: 120px;
          display: flex; align-items: center;
        }

        /* Category tag inside card */
        .cp-cat-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-m);
          font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 9px; border-radius: 2px;
          align-self: flex-start;
        }

        /* Promise text — the FACT */
        .cp-promise-text {
          font-size: 15px; font-weight: 400;
          color: var(--platinum);
          line-height: 1.75;
          letter-spacing: 0.01em;
        }

        /* Verbatim quote — the RAW FACT */
        .cp-promise-quote {
          font-size: 13px; font-style: italic; font-weight: 300;
          color: var(--plat-muted);
          line-height: 1.7;
          padding-left: 14px;
          border-left: 2px solid var(--rule-gold);
          margin-left: 0;
        }

        /* Empty state */
        .cp-promise-empty {
          font-family: var(--font-m);
          font-size: 12px; font-style: italic;
          color: var(--plat-faint); letter-spacing: 0.3px;
        }

        /* Provenance row — MONO = PROOF */
        .cp-provenance {
          display: flex; align-items: center;
          gap: 6px; flex-wrap: wrap;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--rule-faint);
        }
        .cp-prov-src {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-faint);
          letter-spacing: 0.3px;
        }
        .cp-prov-date {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-faint);
        }
        .cp-prov-sep { color: var(--plat-faint); font-size: 10px; }
        .cp-prov-archive {
          font-family: var(--font-m);
          font-size: 12px; color: var(--gold);
          text-decoration: none; opacity: 0.8;
          transition: opacity 0.15s;
        }
        .cp-prov-archive:hover { opacity: 1; }

        /* AUTÊNTICO badge — Lacre do Cartório (light touch) */
        .cp-authentic {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: var(--font-m);
          font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
          color: var(--emerald);
          border: 1px solid rgba(200,169,110,0.25); /* gold-bdr — not heavy */
          background: var(--emerald-dim);
          padding: 3px 8px; border-radius: 2px;
          margin-left: auto;
        }
        .cp-authentic-icon { font-size: 13px; }

        /* ── SOURCES FOOTER ROW ──────────────────────────── */
        .cp-sources-row {
          padding: 24px;
          border-top: 1px solid var(--rule);
          background: var(--onyx-3);
          margin-top: auto; /* Ancorado à base absoluta do card (graças ao flex: 1 no content) */
        }
        .cp-sources-title {
          font-family: var(--font-m);
          font-size: 12px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--gold);
          opacity: 0.7; margin-bottom: 12px;
        }
        .cp-social-links {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .cp-social-pill {
          font-family: var(--font-m);
          font-size: 12px; letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 10px; border-radius: 2px;
          text-decoration: none;
          border: 1px solid var(--rule);
          color: var(--plat-muted);
          transition: all 0.15s;
        }
        .cp-social-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-social-pill.official {
          color: var(--gold);
          border: 1px solid var(--gold-bdr);
          background: var(--gold-dim);
        }
        .cp-social-pill.official:hover {
          background: rgba(200,169,110,0.18);
        }

        /* ── PAGE FOOTER ─────────────────────────────────── */
        .cp-footer {
          padding: 32px clamp(16px, 4vw, 48px);
          border-top: 1px solid var(--rule-faint);
          display: flex; flex-direction: column; gap: 10px;
        }
        .cp-footer-row {
          display: flex; align-items: center;
          gap: 16px; flex-wrap: wrap;
        }
        .cp-footer-text {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-muted);
          letter-spacing: 0.03em;
        }
        .cp-footer-link {
          font-family: var(--font-m);
          font-size: 12px; color: var(--gold);
          text-decoration: none; opacity: 0.75;
          transition: opacity 0.15s;
        }
        .cp-footer-link:hover { opacity: 1; }
        .cp-disclaimer {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-faint);
          line-height: 1.7; max-width: 680px;
          letter-spacing: 0.02em;
        }

        /* ── RESPONSIVE ──────────────────────────────────── */
        @media(max-width: 640px) {
          :root {
            --col-min: 300px;
            --col-max: 340px;
            --nav-h: 56px;
          }
          
          /* Ajuste do top com a nav mobile menor */
          .cp-filter-bar {
            top: 56px;
          }
          .cp-cand-header {
            /* Enxugar padding e recalcular top (56 + 52) */
            padding: 12px 16px 10px;
            top: 108px;
          }
          .cp-avatar {
            width: 36px; height: 36px; font-size: 12px;
          }
          
          .cp-promise { padding: 20px 16px 18px; }
          .cp-promise--empty { padding: 20px 16px; }
          .cp-cat-header { padding: 10px 16px 6px; }
          .cp-sources-row { padding: 18px 16px; }
        }
      `}</style>

      <div className="cp-root" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── STICKY PAGE HEADER ───────────────────────── */}
        <div className="cp-page-header">
          <div className="cp-breadcrumb">
            <Link href={`/${locale}`}>{t('back')}</Link>
          </div>

          <h1 className="cp-election-title">
            <span aria-hidden="true">{election.flag} </span>
            {getLocalised(election.electionName, locale)}
          </h1>

          <p className="cp-meta">
            <span>{t('officialOnly')}</span>
            <span className="cp-meta-sep">·</span>
            <span>{t('updated')}: </span>
            <time dateTime={election.lastUpdated}>
              {election.lastUpdated.slice(0, 10)}
            </time>
            <span className="cp-meta-sep">·</span>
            <a
              href={election.tribunal.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {election.tribunal.name} ↗
            </a>
          </p>

          {/* ── ROUND SEGMENTED CONTROL ────────────────── */}
          {hasMultipleRounds && (
            <div className="cp-rounds">
              <div className="cp-rounds-track" role="tablist" aria-label="Round selection">
                <Link
                  href={`/${locale}/compare/${electionId}${cat ? `?category=${cat}&round=1` : '?round=1'}`}
                  className={`cp-round-btn${activeRound === '1' ? ' active' : ''}`}
                  role="tab"
                  aria-selected={activeRound === '1'}
                >
                  {t('round1')}
                </Link>
                <Link
                  href={`/${locale}/compare/${electionId}${cat ? `?category=${cat}&round=2` : '?round=2'}`}
                  className={`cp-round-btn${activeRound === '2' ? ' active' : ''}`}
                  role="tab"
                  aria-selected={activeRound === '2'}
                >
                  {t('round2')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── CATEGORY FILTER BAR ──────────────────────── */}
        <nav className="cp-filter-bar" aria-label="Category filter">
          <div className="cp-filter-bar-inner">
            <Link
              href={`/${locale}/compare/${electionId}${hasMultipleRounds ? `?round=${activeRound}` : ''}`}
              className={`cp-filter-pill${!cat ? ' active' : ''}`}
            >
              {t('all')}
            </Link>
            {allCats.map(c => {
              const cfg = CATEGORY_CONFIG[c]
              return (
                <Link
                  key={c}
                  href={`/${locale}/compare/${electionId}?category=${c}${hasMultipleRounds ? `&round=${activeRound}` : ''}`}
                  className={`cp-filter-pill${cat === c ? ' active' : ''}`}
                >
                  <span className="cp-filter-emoji" aria-hidden="true">{cfg.emoji}</span>
                  {cfg.label[locale] || cfg.label['en']}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Scroll hint — only shown when N > 2 */}
        {candidateCount > 2 && (
          <div className="cp-scroll-hint" aria-live="polite">
            <span className="cp-scroll-arrow" aria-hidden="true">
              {isRTL ? '←' : '→'}
            </span>
            {t('scrollHint')} ({candidateCount})
          </div>
        )}

        {/* ── N-CANDIDATE MATRIX ───────────────────────── */}
        <main>
          <div
            className="cp-matrix-outer"
            role="region"
            aria-label={getLocalised(election.electionName, locale)}
          >
            <div className="cp-matrix-inner">

              {candidates.map((cand) => {
                const candRows = matrixData[cand.id] ?? []
                return (
                  <div key={cand.id} className="cp-col">

                    {/* ── STICKY CANDIDATE HEADER ──── */}
                    <div className="cp-cand-header">
                      <div className="cp-cand-identity">
                        <div
                          className="cp-avatar"
                          style={{ background: cand.color }}
                          aria-hidden="true"
                        >
                          {cand.photoUrl
                            ? <img src={cand.photoUrl} alt={cand.displayName} />
                            : cand.initials}
                        </div>
                        <div>
                          <p className="cp-cand-name">{cand.fullName}</p>
                          <p className="cp-cand-party">
                            {cand.party}
                            {cand.electoralNumber && (
                              <span style={{ opacity: 0.5 }}> · No. {cand.electoralNumber}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {cand.sources?.electoralFiling && (
                        <a
                          href={cand.sources.electoralFiling}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cp-official-btn"
                        >
                          {t('officialSrc')}
                        </a>
                      )}
                    </div>

                    {/* ── WRAPPER DE CONTEÚDO (Evita colapso no mobile) ── */}
                    <div className="cp-col-content">
                      {/* ── PROMISE CARDS PER CATEGORY ── */}
                      {candRows.map((section: any) => {
                        const cfg = CATEGORY_CONFIG[section.category as Category]
                        return (
                          <div key={section.category}>
                            {/* Category label header */}
                            <div className="cp-cat-header">
                              <div
                                className="cp-cat-dot"
                                style={{ background: cfg.color }}
                                aria-hidden="true"
                              />
                              <span className="cp-cat-label">
                                <span aria-hidden="true">{cfg.emoji} </span>
                                {cfg.label[locale] || cfg.label['en']}
                              </span>
                              <span className="cp-cat-count">
                                {section.promises.length} {t('entries')}
                              </span>
                            </div>

                            {/* Individual promise cards */}
                            {section.promises.length === 0 ? (
                              <div className="cp-promise--empty">
                                <p className="cp-promise-empty">{t('noPromise')}</p>
                              </div>
                            ) : section.promises.map((p: any, idx: number) => (
                              <PromiseCard
                                key={idx}
                                p={p}
                                cfg={cfg}
                                locale={locale}
                                t={t}
                              />
                            ))}
                          </div>
                        )
                      })}

                      {/* Sources footer per column */}
                      <div className="cp-sources-row">
                        <p className="cp-sources-title">
                          {locale === 'pt' ? 'Fontes Verificadas' : 'Verified Sources'}
                        </p>
                        <SocialLinks sources={cand.sources} t={t} />
                      </div>
                    </div>

                  </div>
                )
              })}

            </div>
          </div>
        </main>

        {/* ── PAGE FOOTER ──────────────────────────────── */}
        <footer className="cp-footer">
          <div className="cp-footer-row">
            <p className="cp-footer-text">
              World Contrast · {t('footer')}
            </p>
            <a
              href="https://github.com/worldcontrast/promises"
              target="_blank"
              rel="noopener noreferrer"
              className="cp-footer-link"
            >
              GitHub ↗
            </a>
          </div>
          <p className="cp-disclaimer">{t('disclaimer')}</p>
        </footer>

      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   HELPER: Build matrix data for N candidates
   Returns: { [candidateId]: Array<{ category, promises[] }> }
   ═══════════════════════════════════════════════════════ */
function buildMatrix(
  election: any,
  candidates: any[],
  filterCat: Category | undefined,
): Record<string, Array<{ category: string; promises: any[] }>> {
  const result: Record<string, Array<{ category: string; promises: any[] }>> = {}
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]
  const cats = filterCat ? [filterCat] : allCats

  for (const cand of candidates) {
    result[cand.id] = cats.map(cat => {
      const promises = (election.promises ?? []).filter(
        (p: any) => p.candidateId === cand.id && p.category === cat
      )
      return { category: cat, promises }
    })
    // Remove empty categories only when no filter is active
    if (!filterCat) {
      result[cand.id] = result[cand.id].filter(s => s.promises.length > 0)
    }
  }

  return result
}

/* ═══════════════════════════════════════════════════════
   COMPONENT: Single promise card
   ═══════════════════════════════════════════════════════ */
function PromiseCard({
  p, cfg, locale, t,
}: {
  p: any; cfg: any; locale: string; t: (k: string) => string
}) {
  const getHost = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  return (
    <article className="cp-promise">

      {/* Category tag */}
      <span
        className="cp-cat-tag"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <span aria-hidden="true">{cfg.emoji}</span>
        {cfg.label[locale] || cfg.label['en']}
      </span>

      {/* Promise text */}
      <p className="cp-promise-text">
        {p.text?.[locale] || p.text?.['en'] || ''}
      </p>

      {/* Verbatim quote */}
      {p.quote && (
        <blockquote className="cp-promise-quote">
          {p.quote?.[locale] || p.quote?.['en'] || ''}
        </blockquote>
      )}

      {/* Provenance + authenticity seal */}
      <div className="cp-provenance">
        <span className="cp-prov-src">
          {getHost(p.sourceUrl || '')}
        </span>

        {p.collectedAt && (
          <>
            <span className="cp-prov-sep" aria-hidden="true">·</span>
            <time className="cp-prov-date" dateTime={p.collectedAt}>
              {p.collectedAt.slice(0, 10)}
            </time>
          </>
        )}

        {p.archiveUrl && (
          <>
            <span className="cp-prov-sep" aria-hidden="true">·</span>
            <a
              href={p.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-prov-archive"
            >
              {t('archive')}
            </a>
          </>
        )}

        {/* Autenticidade — light touch, not heavy border */}
        {p.contentHash && (
          <span className="cp-authentic" title={`SHA-256: ${p.contentHash}`}>
            <span className="cp-authentic-icon" aria-hidden="true">🔒</span>
            {locale === 'pt' ? 'Autêntico' : locale === 'es' ? 'Auténtico' : 'Authentic'}
          </span>
        )}
      </div>

    </article>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENT: Social links per candidate
   ═══════════════════════════════════════════════════════ */
function SocialLinks({ sources, t }: { sources: any; t: (k: string) => string }) {
  if (!sources) return null

  const links = [
    sources.officialSite && { key: 'Site',      url: sources.officialSite },
    sources.instagram    && { key: 'Instagram', url: sources.instagram },
    sources.twitter      && { key: 'X',         url: sources.twitter },
    sources.facebook     && { key: 'Facebook',  url: sources.facebook },
    sources.youtube      && { key: 'YouTube',   url: sources.youtube },
    sources.tiktok       && { key: 'TikTok',    url: sources.tiktok },
  ].filter(Boolean) as { key: string; url: string }[]

  return (
    <div className="cp-social-links">
      {sources.electoralFiling && (
        <a
          href={sources.electoralFiling}
          target="_blank"
          rel="noopener noreferrer"
          className="cp-social-pill official"
        >
          {t('officialSrc')}
        </a>
      )}
      {links.map(l => (
        <a
          key={l.key}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cp-social-pill"
        >
          {l.key} ↗
        </a>
      ))}
    </div>
  )
}
