/**
 * World Contrast — Compare Page v3.0 · Smoke Index
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * NEW IN v3:
 *   - `view` searchParam: 'promises' (default) | 'rhetoric'
 *   - buildMatrix now filters by accountability_score
 *   - PromiseCard bifurcates on view + isRejection flag
 *   - New CSS classes: .cp-view-*, .cp-metric-tag, .cp-smoke-tag
 *   - Full i18n for all new strings (6 locales)
 *
 * ARCHITECTURE CONTRACT (unchanged):
 *   - Pure Server Component — no 'use client'
 *   - State = URL searchParams (view, category, round)
 *   - Viewport Canvas Mode: cp-root width:max-content; headers sticky left:0
 *   - Design tokens: --onyx / --platinum / --gold / --emerald (unchanged)
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection, getLocalised } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

// ── View param type ────────────────────────────────────────────────────────
type ViewMode = 'promises' | 'rhetoric'

// ── searchParams now includes `view` ──────────────────────────────────────
interface Props {
  params: Promise<{ locale: string; electionId: string }>
  searchParams: Promise<{ category?: string; round?: string; view?: string }>
}

export async function generateStaticParams() { return [] }

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  const { category, round, view } = await searchParams
  const cat         = category as Category | undefined
  const activeRound = round || '1'
  const activeView  = (view === 'rhetoric' ? 'rhetoric' : 'promises') as ViewMode

  const election = await getElection(electionId)
  if (!election) notFound()

  const candidates = [...election.candidates].sort(() => Math.random() - 0.5)
  const allCats    = Object.keys(CATEGORY_CONFIG) as Category[]

  // Pass activeView into buildMatrix so filtering is applied server-side
  const matrixData = buildMatrix(election, candidates, cat, activeView)

  const isRTL          = locale === 'ar'
  const candidateCount = candidates.length
  const hasMultipleRounds = (election as any).hasRounds ?? false

  // ── i18n dictionary ──────────────────────────────────────────────────────
  const L: Record<string, Record<string, string>> = {
    back:           { en:'← All countries', pt:'← Todos os países', es:'← Todos los países', fr:'← Tous les pays', de:'← Alle Länder', ar:'جميع البلدان ←' },
    officialOnly:   { en:'Official sources', pt:'Fontes oficiais', es:'Fuentes oficiales', fr:'Sources officielles', de:'Offizielle Quellen', ar:'مصادر رسمية' },
    updated:        { en:'Updated', pt:'Atualizado', es:'Actualizado', fr:'Mis à jour', de:'Aktualisiert', ar:'محدّث' },
    all:            { en:'All', pt:'Todos', es:'Todos', fr:'Tous', de:'Alle', ar:'الكل' },
    officialSrc:    { en:'Official filing ↗', pt:'Ficha oficial ↗', es:'Ficha oficial ↗', fr:'Dossier officiel ↗', de:'Offizielle Akte ↗', ar:'الملف الرسمي ↗' },
    noPromise:      { en:'No commitment found in official sources.', pt:'Nenhum compromisso encontrado nas fontes oficiais.', es:'Ningún compromiso en fuentes oficiales.', fr:'Aucun engagement trouvé.', de:'Kein Versprechen gefunden.', ar:'لم يتم العثور على التزامات رسمية.' },
    archive:        { en:'Archive ↗', pt:'Arquivo ↗', es:'Archivo ↗', fr:'Archive ↗', de:'Archiv ↗', ar:'أرشيف ↗' },
    entries:        { en:'records', pt:'registros', es:'registros', fr:'entrées', de:'Einträge', ar:'سجلات' },
    round1:         { en:'1st Round', pt:'1º Turno', es:'1ª Vuelta', fr:'1er Tour', de:'1. Runde', ar:'الجولة الأولى' },
    round2:         { en:'2nd Round', pt:'2º Turno', es:'2ª Vuelta', fr:'2e Tour', de:'2. Runde', ar:'الجولة الثانية' },
    footer:         { en:'Zero bias · Official sources only', pt:'Zero viés · Apenas fontes oficiais', es:'Cero sesgo · Solo fuentes oficiales', fr:'Zéro biais · Sources officielles uniquement', de:'Null Voreingenommenheit · Nur offizielle Quellen', ar:'صفر تحيز · المصادر الرسمية فقط' },
    disclaimer:     { en:'Candidate column order is randomized on each load to prevent semiotic positioning bias.', pt:'A ordem das colunas é randomizada a cada carregamento para anular viés semiótico de posicionamento.', es:'El orden de candidatos se aleatoriza en cada carga para evitar sesgo semiótico.', fr:"L'ordre des candidats est aléatoire à chaque chargement pour éviter tout biais sémiotique.", de:'Die Kandidatenreihenfolge wird bei jedem Laden zufällig bestimmt.', ar:'يتم تعيين ترتيب المرشحين عشوائياً في كل تحميل لمنع التحيز.' },
    scrollHint:     { en:'Scroll → to see all candidates', pt:'Deslize → para ver todos os candidatos', es:'Deslice → para ver todos', fr:'Faites défiler → pour voir tous', de:'Scrollen → für alle Kandidaten', ar:'اسحب ← لرؤية جميع المرشحين' },

    // ── NEW: Smoke Index strings ───────────────────────────────────────────
    viewPromises:   { en:'Concrete Promises', pt:'Promessas Concretas', es:'Promesas Concretas', fr:'Promesses Concrètes', de:'Konkrete Versprechen', ar:'الوعود الملموسة' },
    viewRhetoric:   { en:'Rhetoric Index', pt:'Índice de Retórica', es:'Índice de Retórica', fr:'Indice de Rhétorique', de:'Rhetorik-Index', ar:'مؤشر البلاغة' },
    viewPromisesDesc: { en:'Verifiable, measurable commitments · score ≥ 3', pt:'Compromissos verificáveis e mensuráveis · pontuação ≥ 3', es:'Compromisos verificables y medibles · puntuación ≥ 3', fr:'Engagements vérifiables et mesurables · score ≥ 3', de:'Überprüfbare, messbare Verpflichtungen · Wert ≥ 3', ar:'التزامات قابلة للتحقق والقياس · درجة ≥ 3' },
    viewRhetoricDesc: { en:'Low-traceability declarations · score < 3', pt:'Declarações de baixa rastreabilidade · pontuação < 3', es:'Declaraciones de baja trazabilidad · puntuación < 3', fr:'Déclarations à faible traçabilité · score < 3', de:'Erklärungen mit niedriger Rückverfolgbarkeit · Wert < 3', ar:'تصريحات منخفضة إمكانية التتبع · درجة < 3' },
    metrics:        { en:'Metrics', pt:'Métricas', es:'Métricas', fr:'Métriques', de:'Kennzahlen', ar:'المقاييس' },
    deadline:       { en:'Deadline', pt:'Prazo', es:'Plazo', fr:'Échéance', de:'Frist', ar:'الموعد النهائي' },
    verification:   { en:'Criteria', pt:'Critérios', es:'Criterios', fr:'Critères', de:'Kriterien', ar:'المعايير' },
    accountScore:   { en:'Score', pt:'Pontuação', es:'Puntuación', fr:'Score', de:'Bewertung', ar:'الدرجة' },
    lowTrace:       { en:'Low traceability', pt:'Baixa rastreabilidade', es:'Baja trazabilidad', fr:'Faible traçabilité', de:'Niedrige Rückverfolgbarkeit', ar:'إمكانية تتبع منخفضة' },
    rejected:       { en:'Filtered', pt:'Filtrado', es:'Filtrado', fr:'Filtré', de:'Gefiltert', ar:'مُرشَّح' },
    rejectionReason: { en:'Reason', pt:'Motivo', es:'Motivo', fr:'Motif', de:'Grund', ar:'السبب' },
    smokeNote:      { en:'This declaration did not meet the POCVA-01 measurability threshold.', pt:'Esta declaração não atingiu o limiar de mensurabilidade do protocolo POCVA-01.', es:'Esta declaración no alcanzó el umbral de mensurabilidad del protocolo POCVA-01.', fr:"Cette déclaration n'a pas atteint le seuil de mesurabilité du protocole POCVA-01.", de:'Diese Erklärung hat den Messbarkeits-Schwellenwert des POCVA-01-Protokolls nicht erfüllt.', ar:'لم يستوفِ هذا التصريح عتبة قابلية القياس لبروتوكول POCVA-01.' },
  }
  function t(k: string) { return L[k]?.[locale] ?? L[k]?.['en'] ?? k }

  // ── URL builder: preserves all active params ──────────────────────────────
  function buildHref(overrides: Record<string, string | undefined>): string {
    const base: Record<string, string | undefined> = {
      view:     activeView === 'promises' ? undefined : activeView, // omit default
      category: cat,
      round:    hasMultipleRounds ? activeRound : undefined,
    }
    const merged = { ...base, ...overrides }
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `/${locale}/compare/${electionId}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           COMPARE PAGE v3 — SMOKE INDEX EDITION
           Viewport Canvas Mode — sticky left:0 architecture
           Design tokens: --onyx / --platinum / --gold / --emerald
           ═══════════════════════════════════════════════════ */

        :root {
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

          /* NEW: Rhetoric / smoke amber — warm but not alarm-red */
          --smoke:        #D4A257;          /* muted amber — near gold but distinct */
          --smoke-dim:    rgba(212,162,87,0.10);
          --smoke-bdr:    rgba(212,162,87,0.25);

          --font-d: 'IBM Plex Sans', system-ui, sans-serif;
          --font-m: 'IBM Plex Mono', 'Courier New', monospace;

          --col-min:  340px;
          --col-max:  480px;
          --col-w:    clamp(var(--col-min), 30vw, var(--col-max));
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── VIEWPORT CANVAS ─────────────────────────────── */
        .cp-root {
          font-family: var(--font-d);
          background: var(--onyx);
          color: var(--platinum);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          width: max-content;
          min-width: 100vw;
        }

        /* In rhetoric mode, the whole root gets a very subtle warm tint */
        .cp-root.rhetoric-mode {
          background: #0B0A08; /* barely warmer than pure onyx */
        }

        /* ── PAGE HEADER ─────────────────────────────────── */
        .cp-page-header {
          position: sticky;
          left: 0;
          width: 100vw;
          box-sizing: border-box;
          background: var(--onyx);
          border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .cp-root.rhetoric-mode .cp-page-header {
          background: #0B0A08;
          border-bottom-color: var(--smoke-bdr);
        }

        .cp-breadcrumb { padding-top: 14px; padding-bottom: 4px; }
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
          letter-spacing: -0.5px; padding: 4px 0 2px;
        }

        .cp-meta {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-muted);
          letter-spacing: 0.3px; padding-bottom: 10px;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .cp-meta a { color: var(--gold); text-decoration: none; transition: opacity 0.18s; }
        .cp-meta a:hover { opacity: 0.75; }
        .cp-meta-sep { color: var(--plat-faint); }

        /* ── CONTROLS ROW: rounds + view toggle ──────────── */
        /* Flexbox row so both controls sit on the same baseline */
        .cp-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0 12px;
          flex-wrap: wrap;
        }

        /* ── ROUND SEGMENTED CONTROL (unchanged) ─────────── */
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
          padding: 7px 20px; border-radius: 6px;
          border: none; cursor: pointer;
          text-decoration: none; display: inline-block;
          transition: background 0.18s, color 0.18s;
          color: var(--plat-muted); background: transparent;
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

        /* ── VIEW TOGGLE — Promises vs Rhetoric ──────────── */
        /* Same visual language as cp-rounds-track, distinct semantic */
        .cp-view-track {
          display: inline-flex;
          background: var(--onyx-3);
          border: 1px solid var(--rule);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .cp-view-btn {
          font-family: var(--font-m);
          font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 7px 18px; border-radius: 6px;
          border: none; cursor: pointer;
          text-decoration: none; display: inline-flex;
          align-items: center; gap: 6px;
          transition: background 0.2s, color 0.2s;
          color: var(--plat-muted); background: transparent;
          white-space: nowrap;
        }
        /* Promises active: gold accent (same as round-btn) */
        .cp-view-btn.active-promises {
          background: var(--gold-dim);
          color: var(--gold);
          border: 1px solid var(--gold-bdr);
        }
        /* Rhetoric active: smoke amber — different from gold, no alarm-red */
        .cp-view-btn.active-rhetoric {
          background: var(--smoke-dim);
          color: var(--smoke);
          border: 1px solid var(--smoke-bdr);
        }
        .cp-view-btn:not(.active-promises):not(.active-rhetoric):hover {
          color: var(--platinum);
          background: rgba(255,255,255,0.04);
        }
        .cp-view-icon { font-size: 13px; line-height: 1; }

        /* Contextual descriptor — appears under the toggle */
        .cp-view-desc {
          font-family: var(--font-m);
          font-size: 11px; color: var(--plat-faint);
          letter-spacing: 0.5px;
          padding: 0 0 8px;
        }

        /* ── SCROLL HINT ─────────────────────────────────── */
        .cp-scroll-hint {
          font-family: var(--font-m);
          font-size: 12px; color: var(--plat-muted);
          letter-spacing: 1px;
          padding: 6px clamp(16px,4vw,48px);
          background: var(--onyx);
          display: flex; align-items: center; gap: 6px;
          animation: fade-out 4s ease forwards;
          animation-delay: 3s;
          position: sticky; left: 0; width: 100vw;
          box-sizing: border-box;
        }
        @keyframes fade-out { to { opacity: 0; pointer-events: none; } }
        .cp-scroll-arrow { color: var(--gold); font-size: 14px; }

        /* ── CATEGORY FILTER BAR ─────────────────────────── */
        .cp-filter-bar {
          position: sticky; top: 60px; left: 0;
          width: 100vw; box-sizing: border-box;
          z-index: 100; background: #0A0A0B;
          border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
          display: flex; gap: 4px;
          overflow-x: auto; scrollbar-width: none;
        }
        .cp-filter-bar::-webkit-scrollbar { display: none; }
        .cp-root.rhetoric-mode .cp-filter-bar { background: #0B0A08; }
        .cp-filter-bar-inner {
          display: flex; gap: 4px;
          padding: 10px 0; min-width: max-content;
        }
        .cp-filter-pill {
          font-family: var(--font-m);
          font-size: 12px; font-weight: 400;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 6px 14px; border: 1px solid var(--rule);
          border-radius: 2px; color: var(--plat-muted);
          background: transparent; text-decoration: none;
          white-space: nowrap; transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .cp-filter-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-filter-pill.active {
          background: var(--gold-dim); color: var(--gold);
          border-color: var(--gold-bdr);
        }
        .cp-filter-emoji { font-size: 13px; }

        /* ── MATRIX ──────────────────────────────────────── */
        main, .cp-matrix-outer, .cp-matrix-inner, .cp-col {
          margin-top: 0; padding-top: 0;
        }
        .cp-matrix-outer { width: 100%; }
        .cp-matrix-inner { display: flex; width: max-content; min-width: 100%; }

        .cp-col {
          width: var(--col-w); min-width: var(--col-min);
          flex-shrink: 0; scroll-snap-align: start;
          border-right: 1px solid var(--rule-faint);
          display: flex; flex-direction: column;
        }
        .cp-col:last-child { border-right: none; }

        /* ── STICKY CANDIDATE HEADER ─────────────────────── */
        .cp-cand-header {
          position: sticky; top: 112px; z-index: 90;
          background: #111113;
          border-bottom: 1px solid var(--rule-gold);
          padding: 20px 24px 16px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        /* In rhetoric mode, header gets a very faint amber tint on the border */
        .cp-root.rhetoric-mode .cp-cand-header {
          border-bottom-color: var(--smoke-bdr);
        }

        .cp-cand-identity { display: flex; align-items: center; gap: 12px; }
        .cp-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: var(--onyx);
          flex-shrink: 0; overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.12);
        }
        .cp-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .cp-cand-name {
          font-size: 15px; font-weight: 700;
          color: var(--platinum); line-height: 1.25; letter-spacing: -0.2px;
        }
        .cp-cand-party {
          font-family: var(--font-m); font-size: 12px;
          color: var(--plat-muted); letter-spacing: 0.5px; margin-top: 2px;
        }
        .cp-official-btn {
          font-family: var(--font-m); font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold);
          border: 1px solid var(--gold-bdr); background: var(--gold-dim);
          padding: 5px 12px; border-radius: 2px; text-decoration: none;
          display: inline-flex; align-items: center; align-self: flex-start;
          transition: background 0.18s, border-color 0.18s;
        }
        .cp-official-btn:hover {
          background: rgba(200,169,110,0.18);
          border-color: rgba(200,169,110,0.45);
        }

        /* Per-candidate smoke summary pill (rhetoric mode only) */
        .cp-smoke-count {
          display: flex; align-items: center; gap: 5px;
          font-family: var(--font-m); font-size: 11px;
          color: var(--smoke); letter-spacing: 0.5px;
        }
        .cp-smoke-count-icon { font-size: 13px; }

        .cp-col-content {
          padding-top: 16px; display: flex;
          flex-direction: column; flex: 1;
        }

        /* ── CATEGORY HEADER ─────────────────────────────── */
        .cp-cat-header {
          padding: 12px 24px 8px;
          border-bottom: 1px solid var(--rule-faint);
          border-top: 1px solid var(--rule);
          background: var(--onyx-3);
          display: flex; align-items: center; gap: 8px;
        }
        .cp-cat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .cp-cat-label {
          font-family: var(--font-m); font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase; color: var(--plat-muted);
        }
        .cp-cat-count {
          font-family: var(--font-m); font-size: 10px;
          color: var(--plat-faint); margin-left: auto;
        }

        /* ── PROMISE CARD — base ─────────────────────────── */
        .cp-promise {
          padding: 28px 24px 24px;
          border-bottom: 1px solid var(--rule-faint);
          display: flex; flex-direction: column; gap: 14px;
          min-height: 180px;
          transition: background 0.2s;
        }
        .cp-promise--empty {
          padding: 28px 24px;
          border-bottom: 1px solid var(--rule-faint);
          min-height: 120px; display: flex; align-items: center;
        }

        /* ── PROMISE CARD — rhetoric variant ────────────── */
        /* Muted, not alarming — reads as "low signal" not "error" */
        .cp-promise.rhetoric {
          background: rgba(212,162,87,0.03); /* barely-there amber wash */
        }

        /* Category tag (solid, inside card) */
        .cp-cat-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-m); font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 9px; border-radius: 2px; align-self: flex-start;
        }

        /* Promise text */
        .cp-promise-text {
          font-size: 15px; font-weight: 400; color: var(--platinum);
          line-height: 1.75; letter-spacing: 0.01em;
        }
        /* In rhetoric mode: text opacity reduced to signal lower reliability */
        .cp-promise.rhetoric .cp-promise-text {
          opacity: 0.60;
        }

        /* Verbatim quote */
        .cp-promise-quote {
          font-size: 13px; font-style: italic; font-weight: 300;
          color: var(--plat-muted); line-height: 1.7;
          padding-left: 14px; border-left: 2px solid var(--rule-gold);
          margin-left: 0;
        }

        /* Empty state */
        .cp-promise-empty {
          font-family: var(--font-m); font-size: 12px; font-style: italic;
          color: var(--plat-faint); letter-spacing: 0.3px;
        }

        /* ── NEW: Metric tags (promises mode) ────────────── */
        /* Outlined / ghost style — minimal footprint */
        .cp-metric-row {
          display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
        }
        .cp-metric-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: var(--font-m); font-size: 11px; font-weight: 400;
          letter-spacing: 0.8px; text-transform: uppercase;
          padding: 3px 8px; border-radius: 2px;
          /* Ghost: border only, no fill — preserves Quiet Luxury */
          border: 1px solid var(--rule);
          color: var(--plat-muted);
          background: transparent;
        }
        .cp-metric-tag.has-value {
          /* When there's a concrete value, elevate slightly */
          border-color: rgba(200,169,110,0.20);
          color: var(--gold);
        }
        .cp-metric-tag-key {
          color: var(--plat-faint);
          font-size: 10px;
        }

        /* Accountability score bar — 5 pips */
        .cp-score {
          display: inline-flex; align-items: center; gap: 3px;
          margin-left: auto;
        }
        .cp-score-pip {
          width: 5px; height: 14px; border-radius: 1px;
          background: var(--rule); flex-shrink: 0;
        }
        .cp-score-pip.filled { background: var(--emerald); }

        /* ── NEW: Smoke tag (rhetoric mode) ─────────────── */
        /* Warm amber — "caution" without "danger" */
        .cp-smoke-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-m); font-size: 11px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 9px; border-radius: 2px;
          border: 1px solid var(--smoke-bdr);
          color: var(--smoke);
          background: var(--smoke-dim);
          align-self: flex-start;
        }
        .cp-smoke-icon { font-size: 12px; }
        .cp-smoke-reason {
          font-family: var(--font-m); font-size: 11px;
          color: var(--plat-muted); line-height: 1.6;
          font-style: italic;
          padding: 6px 10px; border-radius: 2px;
          background: rgba(255,255,255,0.02);
          border-left: 2px solid var(--smoke-bdr);
        }
        .cp-smoke-note {
          font-family: var(--font-m); font-size: 11px;
          color: var(--plat-faint); line-height: 1.7;
        }

        /* ── PROVENANCE ──────────────────────────────────── */
        .cp-provenance {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
          margin-top: auto; padding-top: 10px;
          border-top: 1px solid var(--rule-faint);
        }
        .cp-prov-src {
          font-family: var(--font-m); font-size: 12px;
          color: var(--plat-faint); letter-spacing: 0.3px;
        }
        .cp-prov-date {
          font-family: var(--font-m); font-size: 12px; color: var(--plat-faint);
        }
        .cp-prov-sep { color: var(--plat-faint); font-size: 10px; }
        .cp-prov-archive {
          font-family: var(--font-m); font-size: 12px; color: var(--gold);
          text-decoration: none; opacity: 0.8; transition: opacity 0.15s;
        }
        .cp-prov-archive:hover { opacity: 1; }

        /* Authenticity badge */
        .cp-authentic {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: var(--font-m); font-size: 12px;
          letter-spacing: 1px; text-transform: uppercase;
          color: var(--emerald);
          border: 1px solid rgba(200,169,110,0.25);
          background: var(--emerald-dim);
          padding: 3px 8px; border-radius: 2px; margin-left: auto;
        }
        .cp-authentic-icon { font-size: 13px; }

        /* ── SOURCES FOOTER ──────────────────────────────── */
        .cp-sources-row {
          padding: 24px; border-top: 1px solid var(--rule);
          background: var(--onyx-3); margin-top: auto;
        }
        .cp-sources-title {
          font-family: var(--font-m); font-size: 12px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--gold);
          opacity: 0.7; margin-bottom: 12px;
        }
        .cp-social-links { display: flex; flex-wrap: wrap; gap: 6px; }
        .cp-social-pill {
          font-family: var(--font-m); font-size: 12px; letter-spacing: 1px;
          text-transform: uppercase; padding: 4px 10px; border-radius: 2px;
          text-decoration: none; border: 1px solid var(--rule);
          color: var(--plat-muted); transition: all 0.15s;
        }
        .cp-social-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-social-pill.official {
          color: var(--gold); border: 1px solid var(--gold-bdr);
          background: var(--gold-dim);
        }
        .cp-social-pill.official:hover { background: rgba(200,169,110,0.18); }

        /* ── PAGE FOOTER ─────────────────────────────────── */
        .cp-footer {
          position: sticky; left: 0; width: 100vw;
          box-sizing: border-box; background: var(--onyx);
          padding: 32px clamp(16px,4vw,48px);
          border-top: 1px solid var(--rule-faint);
          display: flex; flex-direction: column; gap: 10px;
        }
        .cp-footer-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .cp-footer-text {
          font-family: var(--font-m); font-size: 12px;
          color: var(--plat-muted); letter-spacing: 0.03em;
        }
        .cp-footer-link {
          font-family: var(--font-m); font-size: 12px; color: var(--gold);
          text-decoration: none; opacity: 0.75; transition: opacity 0.15s;
        }
        .cp-footer-link:hover { opacity: 1; }
        .cp-disclaimer {
          font-family: var(--font-m); font-size: 12px; color: var(--plat-faint);
          line-height: 1.7; max-width: 680px; letter-spacing: 0.02em;
        }

        /* ── RESPONSIVE ──────────────────────────────────── */
        @media(max-width: 640px) {
          :root { --col-min: 300px; --col-max: 340px; --nav-h: 56px; }
          .cp-filter-bar { top: 56px; }
          .cp-cand-header { padding: 12px 16px 10px; top: 108px; }
          .cp-avatar { width: 36px; height: 36px; font-size: 12px; }
          .cp-promise { padding: 20px 16px 18px; }
          .cp-promise--empty { padding: 20px 16px; }
          .cp-cat-header { padding: 10px 16px 6px; }
          .cp-sources-row { padding: 18px 16px; }
          .cp-view-btn { padding: 7px 12px; font-size: 11px; }
          .cp-view-btn .cp-view-icon { display: none; } /* save space on mobile */
        }
      `}</style>

      {/* rhetoric-mode class on root drives all ambient style shifts */}
      <div
        className={`cp-root${activeView === 'rhetoric' ? ' rhetoric-mode' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >

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
            <a href={election.tribunal.url} target="_blank" rel="noopener noreferrer">
              {election.tribunal.name} ↗
            </a>
          </p>

          {/* ── CONTROLS: round + view — same horizontal row ── */}
          <div className="cp-controls">

            {/* Round toggle — only when election has multiple rounds */}
            {hasMultipleRounds && (
              <div className="cp-rounds-track" role="tablist" aria-label="Round selection">
                <Link
                  href={buildHref({ round: '1' })}
                  className={`cp-round-btn${activeRound === '1' ? ' active' : ''}`}
                  role="tab" aria-selected={activeRound === '1'}
                >
                  {t('round1')}
                </Link>
                <Link
                  href={buildHref({ round: '2' })}
                  className={`cp-round-btn${activeRound === '2' ? ' active' : ''}`}
                  role="tab" aria-selected={activeRound === '2'}
                >
                  {t('round2')}
                </Link>
              </div>
            )}

            {/* ── VIEW TOGGLE — Concrete Promises vs Rhetoric Index ── */}
            <div
              className="cp-view-track"
              role="tablist"
              aria-label="View mode"
            >
              <Link
                href={buildHref({ view: undefined })}   /* omit = default 'promises' */
                className={`cp-view-btn${activeView === 'promises' ? ' active-promises' : ''}`}
                role="tab"
                aria-selected={activeView === 'promises'}
                title={t('viewPromisesDesc')}
              >
                <span className="cp-view-icon" aria-hidden="true">✓</span>
                {t('viewPromises')}
              </Link>
              <Link
                href={buildHref({ view: 'rhetoric' })}
                className={`cp-view-btn${activeView === 'rhetoric' ? ' active-rhetoric' : ''}`}
                role="tab"
                aria-selected={activeView === 'rhetoric'}
                title={t('viewRhetoricDesc')}
              >
                <span className="cp-view-icon" aria-hidden="true">〜</span>
                {t('viewRhetoric')}
              </Link>
            </div>

          </div>

          {/* Contextual descriptor — single line, changes with view */}
          <p className="cp-view-desc">
            {activeView === 'rhetoric' ? t('viewRhetoricDesc') : t('viewPromisesDesc')}
          </p>
        </div>

        {/* ── CATEGORY FILTER BAR ──────────────────────── */}
        <nav className="cp-filter-bar" aria-label="Category filter">
          <div className="cp-filter-bar-inner">
            <Link
              href={buildHref({ category: undefined })}
              className={`cp-filter-pill${!cat ? ' active' : ''}`}
            >
              {t('all')}
            </Link>
            {allCats.map(c => {
              const cfg = CATEGORY_CONFIG[c]
              return (
                <Link
                  key={c}
                  href={buildHref({ category: c })}
                  className={`cp-filter-pill${cat === c ? ' active' : ''}`}
                >
                  <span className="cp-filter-emoji" aria-hidden="true">{cfg.emoji}</span>
                  {cfg.label[locale] || cfg.label['en']}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Scroll hint — only when N > 2 */}
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

              {candidates.map(cand => {
                const candRows = matrixData[cand.id] ?? []
                const totalInView = candRows.reduce((s: number, r: any) => s + r.promises.length, 0)

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

                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        {cand.sources?.electoralFiling && (
                          <a
                            href={cand.sources.electoralFiling}
                            target="_blank" rel="noopener noreferrer"
                            className="cp-official-btn"
                          >
                            {t('officialSrc')}
                          </a>
                        )}
                        {/* Smoke count pill — only in rhetoric mode */}
                        {activeView === 'rhetoric' && totalInView > 0 && (
                          <span className="cp-smoke-count">
                            <span className="cp-smoke-count-icon" aria-hidden="true">〜</span>
                            {totalInView}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── COLUMN CONTENT ─────────────── */}
                    <div className="cp-col-content">
                      {candRows.map((section: any) => {
                        const cfg = CATEGORY_CONFIG[section.category as Category]
                        return (
                          <div key={section.category}>
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
                                activeView={activeView}
                              />
                            ))}
                          </div>
                        )
                      })}

                      {/* Sources footer */}
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
            <p className="cp-footer-text">World Contrast · {t('footer')}</p>
            <a
              href="https://github.com/worldcontrast/promises"
              target="_blank" rel="noopener noreferrer"
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
   buildMatrix v3
   ─────────────────────────────────────────────────────
   view = 'promises'  → accountability_score >= 3 only
   view = 'rhetoric'  → score < 3  PLUS extraction_rejections
                        Each rejection is normalised to the same
                        shape as a promise but carries isRejection:true
   ═══════════════════════════════════════════════════════ */
function buildMatrix(
  election: any,
  candidates: any[],
  filterCat: Category | undefined,
  view: ViewMode,
): Record<string, Array<{ category: string; promises: any[] }>> {
  const result: Record<string, Array<{ category: string; promises: any[] }>> = {}
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]
  const cats    = filterCat ? [filterCat] : allCats

  for (const cand of candidates) {
    // ── Collect base promises filtered by view ──────────────────────────
    const basePromises: any[] = (election.promises ?? []).filter((p: any) => {
      if (p.candidateId !== cand.id) return false

      const score = p.accountability_score ?? 0

      if (view === 'promises') return score >= 3
      if (view === 'rhetoric') return score < 3 && score > 0  // low-score promises
      return true
    })

    // ── In rhetoric mode, append extraction_rejections ──────────────────
    let rhetoricExtras: any[] = []
    if (view === 'rhetoric') {
      const candidateRejections: any[] =
        (election.extraction_rejections ?? []).filter(
          (r: any) => r.candidateId === cand.id || r.candidate_id === cand.id
        )

      // Normalise rejections to promise shape with a sentinel flag
      rhetoricExtras = candidateRejections.map((r: any) => ({
        candidateId:         cand.id,
        category:            r.category ?? 'governance',  // rejections may lack category
        text_original:       r.text_original ?? r.text ?? '',
        rejection_reason:    r.rejection_reason ?? r.reason ?? '',
        accountability_score: 0,
        isRejection:         true,
        // Keep provenance if available
        sourceUrl:           r.source_url ?? '',
        collectedAt:         r.collected_at ?? '',
      }))
    }

    const allItems = [...basePromises, ...rhetoricExtras]

    // ── Bucket items into categories ────────────────────────────────────
    result[cand.id] = cats.map(cat => {
      const promises = allItems.filter((p: any) => p.category === cat)
      return { category: cat, promises }
    })

    // Remove empty categories when no single-category filter is active
    if (!filterCat) {
      result[cand.id] = result[cand.id].filter(s => s.promises.length > 0)
    }
  }

  return result
}

/* ═══════════════════════════════════════════════════════
   PromiseCard v3
   ─────────────────────────────────────────────────────
   Promises mode:  category tag + text + metric tags + score pips + provenance
   Rhetoric mode:  muted text + smoke tag + rejection reason + pocva note
   ═══════════════════════════════════════════════════════ */
function PromiseCard({
  p, cfg, locale, t, activeView,
}: {
  p: any
  cfg: any
  locale: string
  t: (k: string) => string
  activeView: ViewMode
}) {
  const getHost = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  const isRhetoric   = activeView === 'rhetoric'
  const isRejection  = Boolean(p.isRejection)
  const score        = p.accountability_score ?? 0

  // Human-readable rejection reason (may be a code like 'vague_statement:...')
  // Strip the machine prefix, show the human part
  const rawReason  = p.rejection_reason ?? ''
  const reasonText = rawReason.includes(':')
    ? rawReason.split(':').slice(1).join(' ').replace(/_/g, ' ')
    : rawReason.replace(/_/g, ' ')

  // Text to display — prefer translated, fall back to text_original
  const displayText = p.text?.[locale]
    || p.text?.['en']
    || p.text_original
    || ''

  return (
    <article className={`cp-promise${isRhetoric ? ' rhetoric' : ''}`}>

      {/* Category tag */}
      <span className="cp-cat-tag" style={{ background: cfg.bg, color: cfg.color }}>
        <span aria-hidden="true">{cfg.emoji}</span>
        {cfg.label[locale] || cfg.label['en']}
      </span>

      {/* ── RHETORIC MODE ── smoke tag + optional rejection badge ── */}
      {isRhetoric && (
        <>
          <span className="cp-smoke-tag">
            <span className="cp-smoke-icon" aria-hidden="true">〜</span>
            {isRejection ? t('rejected') : t('lowTrace')}
          </span>

          {reasonText && (
            <p className="cp-smoke-reason">
              <strong style={{ opacity:0.7, marginRight:5 }}>{t('rejectionReason')}:</strong>
              {reasonText}
            </p>
          )}
        </>
      )}

      {/* Promise text — muted in rhetoric mode via CSS */}
      <p className="cp-promise-text">{displayText}</p>

      {/* Verbatim quote — only in promises mode (rhetoric cards have no confirmed quote) */}
      {!isRhetoric && p.quote && (
        <blockquote className="cp-promise-quote">
          {p.quote?.[locale] || p.quote?.['en'] || ''}
        </blockquote>
      )}

      {/* ── PROMISES MODE ── metric tags + accountability score ── */}
      {!isRhetoric && (
        <div className="cp-metric-row">
          {/* Metrics tag */}
          {p.metrics && (
            <span className={`cp-metric-tag${p.metrics ? ' has-value' : ''}`}>
              <span className="cp-metric-tag-key">{t('metrics')}</span>
              {String(p.metrics).slice(0, 40)}
            </span>
          )}

          {/* Deadline tag */}
          {p.deadline && (
            <span className="cp-metric-tag has-value">
              <span className="cp-metric-tag-key">{t('deadline')}</span>
              {String(p.deadline)}
            </span>
          )}

          {/* Verification criteria tag */}
          {p.verification_criteria && (
            <span className="cp-metric-tag">
              <span className="cp-metric-tag-key">{t('verification')}</span>
              {String(p.verification_criteria).slice(0, 35)}
            </span>
          )}

          {/* Accountability score pips — 5 dots, filled = score */}
          {score > 0 && (
            <span
              className="cp-score"
              title={`${t('accountScore')}: ${score}/5`}
              aria-label={`${t('accountScore')} ${score} of 5`}
            >
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  className={`cp-score-pip${n <= score ? ' filled' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </span>
          )}
        </div>
      )}

      {/* ── RHETORIC MODE ── POCVA protocol note ── */}
      {isRhetoric && (
        <p className="cp-smoke-note">{t('smokeNote')}</p>
      )}

      {/* Provenance + authenticity — shown in both modes */}
      <div className="cp-provenance">
        {p.sourceUrl && (
          <span className="cp-prov-src">{getHost(p.sourceUrl)}</span>
        )}
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
              target="_blank" rel="noopener noreferrer"
              className="cp-prov-archive"
            >
              {t('archive')}
            </a>
          </>
        )}
        {p.contentHash && !isRejection && (
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
   SocialLinks — unchanged from v2
   ═══════════════════════════════════════════════════════ */
function SocialLinks({ sources, t }: { sources: any; t: (k: string) => string }) {
  if (!sources) return null
  const links = [
    sources.officialSite && { key:'Site',      url:sources.officialSite },
    sources.instagram    && { key:'Instagram', url:sources.instagram },
    sources.twitter      && { key:'X',         url:sources.twitter },
    sources.facebook     && { key:'Facebook',  url:sources.facebook },
    sources.youtube      && { key:'YouTube',   url:sources.youtube },
    sources.tiktok       && { key:'TikTok',    url:sources.tiktok },
  ].filter(Boolean) as { key: string; url: string }[]

  return (
    <div className="cp-social-links">
      {sources.electoralFiling && (
        <a
          href={sources.electoralFiling}
          target="_blank" rel="noopener noreferrer"
          className="cp-social-pill official"
        >
          {t('officialSrc')}
        </a>
      )}
      {links.map(l => (
        <a
          key={l.key}
          href={l.url}
          target="_blank" rel="noopener noreferrer"
          className="cp-social-pill"
        >
          {l.key} ↗
        </a>
      ))}
    </div>
  )
}
