/**
 * World Contrast — Compare Page v3.0
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * NEW IN v3
 * ─────────
 * 1. ElectionStatus schema — supports "scheduled" | "live" elections.
 *    When status === "scheduled" OR candidates.length === 0, the matrix
 *    is replaced by an elegant "Scheduled" empty state.
 *
 * 2. Null safety — every field access on election/candidate/promise is
 *    guarded. Optional chaining replaces all unsafe dot access.
 *
 * 3. Typed interfaces — Election, Candidate, ElectionSources replace `any`
 *    where the shape is known, keeping strict TypeScript happy.
 *
 * 4. getLocalised() is inlined so the import from @/lib/data can be
 *    removed if the lib doesn't export it — no runtime import error.
 *
 * ARCHITECTURE UNCHANGED
 * ──────────────────────
 * Server Component · Viewport Canvas Mode · searchParams for state
 * Design tokens: --onyx / --platinum / --gold / --emerald
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

// ── Types ─────────────────────────────────────────────────────────────────────

type ElectionStatus = 'live' | 'scheduled'

interface ElectionSources {
  electoralFiling?: string | null
  officialSite?: string | null
  instagram?: string | null
  twitter?: string | null
  youtube?: string | null
  facebook?: string | null
  tiktok?: string | null
}

interface Candidate {
  id: string
  fullName: string
  displayName?: string
  party?: string
  electoralNumber?: string | number
  color?: string
  initials?: string
  photoUrl?: string | null
  sources?: ElectionSources
}

interface ElectionTribunal {
  name: string
  url: string
}

interface Election {
  flag?: string
  electionName: string | Record<string, string>
  lastUpdated?: string
  tribunal?: ElectionTribunal
  hasRounds?: boolean
  status?: ElectionStatus            // NEW: "live" | "scheduled"
  electionDate?: string              // NEW: expected date when scheduled
  scheduledOpeningDate?: string      // NEW: when monitoring will begin
  candidates: Candidate[]
  promises?: any[]
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ locale: string; electionId: string }>
  searchParams: Promise<{ category?: string; round?: string }>
}

export async function generateStaticParams() { return [] }

// ── Localisation helper ───────────────────────────────────────────────────────

function getLocalised(
  value: string | Record<string, string> | undefined,
  locale: string,
): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale] ?? value['en'] ?? Object.values(value)[0] ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  const { category, round } = await searchParams
  const cat         = category as Category | undefined
  const activeRound = round ?? '1'

  // ── Data fetching ─────────────────────────────────────────────────────────
  const rawElection = await getElection(electionId)
  if (!rawElection) notFound()
  const election = rawElection as Election

  // ── Derive display state ──────────────────────────────────────────────────
  const isScheduled = (
    election.status === 'scheduled' ||
    !Array.isArray(election.candidates) ||
    election.candidates.length === 0
  )

  // Randomise column order — prevents semiotic positioning bias
  const candidates: Candidate[] = isScheduled
    ? []
    : [...election.candidates].sort(() => Math.random() - 0.5)

  const allCats         = Object.keys(CATEGORY_CONFIG) as Category[]
  const matrixData      = isScheduled ? {} : buildMatrix(election, candidates, cat)
  const isRTL           = locale === 'ar'
  const candidateCount  = candidates.length
  const hasMultipleRounds = election.hasRounds ?? false

  // ── i18n ─────────────────────────────────────────────────────────────────
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
    // ── Scheduled empty state ──────────────────────────────────────────────
    scheduledTitle: { en:'Election scheduled', pt:'Eleição agendada', es:'Elección programada', fr:'Élection programmée', de:'Wahl geplant', ar:'انتخابات مقررة' },
    scheduledBody:  {
      en:  'Candidates are still being defined. World Contrast will begin official monitoring of campaign promises after the party conventions.',
      pt:  'Candidatos em definição. O World Contrast iniciará a monitorização oficial das promessas após as convenções partidárias.',
      es:  'Los candidatos aún están en definición. World Contrast iniciará el monitoreo oficial de las promesas tras las convenciones partidarias.',
      fr:  'Les candidats sont encore en cours de définition. World Contrast commencera la surveillance officielle des promesses après les conventions partisanes.',
      de:  'Die Kandidaten werden noch bestimmt. World Contrast beginnt die offizielle Überwachung der Wahlversprechen nach den Parteikonventen.',
      ar:  'المرشحون لا يزالون قيد التحديد. سيبدأ World Contrast المراقبة الرسمية لوعود الحملة بعد المؤتمرات الحزبية.',
    },
    scheduledNote:  {
      en:  'This election has been pre-registered in the World Contrast global registry. Monitoring will begin automatically once official candidacies are declared.',
      pt:  'Esta eleição foi pré-registrada no registo global do World Contrast. A monitorização iniciará automaticamente quando as candidaturas oficiais forem declaradas.',
      es:  'Esta elección ha sido pre-registrada en el registro global de World Contrast. El monitoreo iniciará automáticamente cuando se declaren las candidaturas oficiales.',
      fr:  'Cette élection a été pré-enregistrée dans le registre mondial World Contrast. La surveillance démarrera automatiquement une fois les candidatures officielles déclarées.',
      de:  'Diese Wahl wurde im globalen World Contrast Register vorregistriert. Die Überwachung beginnt automatisch, sobald die offiziellen Kandidaturen erklärt werden.',
      ar:  'تم التسجيل المسبق لهذه الانتخابات في السجل العالمي لـ World Contrast. ستبدأ المراقبة تلقائياً بمجرد الإعلان عن الترشيحات الرسمية.',
    },
    electionDate:   { en:'Expected date', pt:'Data prevista', es:'Fecha prevista', fr:'Date prévue', de:'Voraussichtliches Datum', ar:'التاريخ المتوقع' },
    monitoringFrom: { en:'Monitoring from', pt:'Monitorização a partir de', es:'Monitoreo desde', fr:'Surveillance à partir de', de:'Überwachung ab', ar:'المراقبة من' },
  }
  function t(k: string): string { return L[k]?.[locale] ?? L[k]?.['en'] ?? k }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           COMPARE PAGE v3 — DESIGN SYSTEM SYNC
           Viewport Canvas Mode — sticky left:0 architecture
           Onyx / Platinum / Gold · identical to homepage
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
          --font-d: 'IBM Plex Sans', system-ui, sans-serif;
          --font-m: 'IBM Plex Mono', 'Courier New', monospace;
          --col-min: 340px;
          --col-max: 480px;
          --col-w:   clamp(var(--col-min), 30vw, var(--col-max));
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

        /* ── PAGE HEADER (scrolls vertically, anchored left) ── */
        .cp-page-header {
          position: sticky;
          left: 0;
          width: 100vw;
          box-sizing: border-box;
          background: var(--onyx);
          border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
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

        /* ── ROUND CONTROL ───────────────────────────────── */
        .cp-rounds { display: flex; align-items: center; padding: 8px 0 12px; }
        .cp-rounds-track {
          display: inline-flex; background: var(--onyx-3);
          border: 1px solid var(--rule); border-radius: 8px;
          padding: 3px; gap: 2px;
        }
        .cp-round-btn {
          font-family: var(--font-m); font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 7px 20px; border-radius: 6px; border: none; cursor: pointer;
          text-decoration: none; display: inline-block;
          transition: background 0.18s, color 0.18s;
          color: var(--plat-muted); background: transparent; white-space: nowrap;
        }
        .cp-round-btn.active {
          background: var(--gold-dim); color: var(--gold);
          border: 1px solid var(--gold-bdr);
        }
        .cp-round-btn:not(.active):hover {
          color: var(--platinum); background: rgba(255,255,255,0.04);
        }

        /* ── SCROLL HINT ─────────────────────────────────── */
        .cp-scroll-hint {
          font-family: var(--font-m); font-size: 12px; color: var(--plat-muted);
          letter-spacing: 1px; padding: 6px clamp(16px,4vw,48px);
          background: var(--onyx);
          display: flex; align-items: center; gap: 6px;
          animation: fade-out 4s ease forwards; animation-delay: 3s;
          position: sticky; left: 0; width: 100vw; box-sizing: border-box;
        }
        @keyframes fade-out { to { opacity: 0; pointer-events: none; } }
        .cp-scroll-arrow { color: var(--gold); font-size: 14px; }

        /* ── CATEGORY FILTER BAR ─────────────────────────── */
        .cp-filter-bar {
          position: sticky; top: 60px; left: 0;
          width: 100vw; box-sizing: border-box; z-index: 100;
          background: #0A0A0B; border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
          display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none;
        }
        .cp-filter-bar::-webkit-scrollbar { display: none; }
        .cp-filter-bar-inner {
          display: flex; gap: 4px; padding: 10px 0; min-width: max-content;
        }
        .cp-filter-pill {
          font-family: var(--font-m); font-size: 12px; font-weight: 400;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 6px 14px; border: 1px solid var(--rule); border-radius: 2px;
          color: var(--plat-muted); background: transparent;
          text-decoration: none; white-space: nowrap; transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .cp-filter-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-filter-pill.active {
          background: var(--gold-dim); color: var(--gold); border-color: var(--gold-bdr);
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
          font-size: 15px; font-weight: 700; color: var(--platinum);
          line-height: 1.25; letter-spacing: -0.2px;
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
          background: rgba(200,169,110,0.18); border-color: rgba(200,169,110,0.45);
        }
        .cp-col-content {
          padding-top: 16px; display: flex; flex-direction: column; flex: 1;
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

        /* ── PROMISE CARD ────────────────────────────────── */
        .cp-promise {
          padding: 28px 24px 24px;
          border-bottom: 1px solid var(--rule-faint);
          display: flex; flex-direction: column; gap: 14px; min-height: 180px;
        }
        .cp-promise--empty {
          padding: 28px 24px; border-bottom: 1px solid var(--rule-faint);
          min-height: 120px; display: flex; align-items: center;
        }
        .cp-cat-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-m); font-size: 12px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 9px; border-radius: 2px; align-self: flex-start;
        }
        .cp-promise-text {
          font-size: 15px; font-weight: 400; color: var(--platinum);
          line-height: 1.75; letter-spacing: 0.01em;
        }
        .cp-promise-quote {
          font-size: 13px; font-style: italic; font-weight: 300;
          color: var(--plat-muted); line-height: 1.7;
          padding-left: 14px; border-left: 2px solid var(--rule-gold);
        }
        .cp-promise-empty {
          font-family: var(--font-m); font-size: 12px; font-style: italic;
          color: var(--plat-faint); letter-spacing: 0.3px;
        }
        .cp-provenance {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
          margin-top: auto; padding-top: 10px;
          border-top: 1px solid var(--rule-faint);
        }
        .cp-prov-src {
          font-family: var(--font-m); font-size: 12px;
          color: var(--plat-faint); letter-spacing: 0.3px;
        }
        .cp-prov-date { font-family: var(--font-m); font-size: 12px; color: var(--plat-faint); }
        .cp-prov-sep  { color: var(--plat-faint); font-size: 10px; }
        .cp-prov-archive {
          font-family: var(--font-m); font-size: 12px; color: var(--gold);
          text-decoration: none; opacity: 0.8; transition: opacity 0.15s;
        }
        .cp-prov-archive:hover { opacity: 1; }
        .cp-authentic {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: var(--font-m); font-size: 12px;
          letter-spacing: 1px; text-transform: uppercase; color: var(--emerald);
          border: 1px solid rgba(200,169,110,0.25); background: var(--emerald-dim);
          padding: 3px 8px; border-radius: 2px; margin-left: auto;
        }

        /* ── SOURCES FOOTER ──────────────────────────────── */
        .cp-sources-row {
          padding: 24px; border-top: 1px solid var(--rule);
          background: var(--onyx-3); margin-top: auto;
        }
        .cp-sources-title {
          font-family: var(--font-m); font-size: 12px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--gold); opacity: 0.7; margin-bottom: 12px;
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
          color: var(--gold); border: 1px solid var(--gold-bdr); background: var(--gold-dim);
        }
        .cp-social-pill.official:hover { background: rgba(200,169,110,0.18); }

        /* ═══════════════════════════════════════════════════
           NEW: SCHEDULED EMPTY STATE
           Quiet Luxury — institutional, not playful
           ═══════════════════════════════════════════════════ */
        .cp-scheduled {
          /* Full viewport width, anchored left like the header */
          position: sticky;
          left: 0;
          width: 100vw;
          box-sizing: border-box;
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
          padding: clamp(64px, 10vw, 120px) clamp(24px, 8vw, 96px);
          text-align: center;
        }

        /* Architectural grid texture — matches homepage */
        .cp-scheduled::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Gold ambient wash */
        .cp-scheduled::after {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse at top center,
            rgba(200,169,110,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .cp-scheduled-inner {
          position: relative; z-index: 1;
          max-width: 560px;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }

        /* Eyebrow — "SCHEDULED" tag */
        .cp-sched-status {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-m);
          font-size: 11px; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--gold);
          border: 1px solid var(--gold-bdr);
          background: var(--gold-dim);
          padding: 5px 14px; border-radius: 2px;
        }
        .cp-sched-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--gold); opacity: 0.7;
          /* Slow pulse — signals monitoring is coming, not broken */
          animation: sched-pulse 3s ease-in-out infinite;
        }
        @keyframes sched-pulse { 0%,100%{opacity:0.7} 50%{opacity:0.25} }

        /* Main headline */
        .cp-sched-title {
          font-family: var(--font-d);
          font-size: clamp(22px, 3.5vw, 36px);
          font-weight: 700;
          color: var(--platinum);
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        /* Body copy */
        .cp-sched-body {
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 300;
          color: var(--plat-muted);
          line-height: 1.9;
          max-width: 480px;
        }

        /* Divider */
        .cp-sched-rule {
          width: 40px; height: 1px;
          background: var(--gold); opacity: 0.3;
          border: none; margin: 8px 0;
        }

        /* Secondary note */
        .cp-sched-note {
          font-family: var(--font-m);
          font-size: 12px;
          color: var(--plat-faint);
          line-height: 1.8;
          max-width: 420px;
        }

        /* Date meta row */
        .cp-sched-dates {
          display: flex; gap: 24px; flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }
        .cp-sched-date-item {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .cp-sched-date-label {
          font-family: var(--font-m); font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--plat-faint);
        }
        .cp-sched-date-val {
          font-family: var(--font-m); font-size: 13px;
          color: var(--gold); letter-spacing: 0.5px;
        }

        /* ── PAGE FOOTER ─────────────────────────────────── */
        .cp-footer {
          position: sticky; left: 0; width: 100vw; box-sizing: border-box;
          background: var(--onyx);
          padding: 32px clamp(16px, 4vw, 48px);
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
          :root { --col-min: 300px; --col-max: 340px; }
          .cp-filter-bar { top: 56px; }
          .cp-cand-header { padding: 12px 16px 10px; top: 108px; }
          .cp-avatar { width: 36px; height: 36px; font-size: 12px; }
          .cp-promise { padding: 20px 16px 18px; }
          .cp-promise--empty { padding: 20px 16px; }
          .cp-cat-header { padding: 10px 16px 6px; }
          .cp-sources-row { padding: 18px 16px; }
          .cp-sched-dates { flex-direction: column; gap: 16px; }
        }
      `}</style>

      <div className="cp-root" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── STICKY PAGE HEADER ───────────────────────── */}
        <div className="cp-page-header">
          <div className="cp-breadcrumb">
            <Link href={`/${locale}`}>{t('back')}</Link>
          </div>

          <h1 className="cp-election-title">
            {election.flag && <span aria-hidden="true">{election.flag} </span>}
            {getLocalised(election.electionName, locale)}
          </h1>

          <p className="cp-meta">
            <span>{t('officialOnly')}</span>
            {election.lastUpdated && (
              <>
                <span className="cp-meta-sep">·</span>
                <span>{t('updated')}: </span>
                <time dateTime={election.lastUpdated}>
                  {election.lastUpdated.slice(0, 10)}
                </time>
              </>
            )}
            {election.tribunal?.url && election.tribunal?.name && (
              <>
                <span className="cp-meta-sep">·</span>
                <a href={election.tribunal.url} target="_blank" rel="noopener noreferrer">
                  {election.tribunal.name} ↗
                </a>
              </>
            )}
          </p>

          {/* Round control — only for live elections with multiple rounds */}
          {!isScheduled && hasMultipleRounds && (
            <div className="cp-rounds">
              <div className="cp-rounds-track" role="tablist" aria-label="Round selection">
                <Link
                  href={`/${locale}/compare/${electionId}${cat ? `?category=${cat}&round=1` : '?round=1'}`}
                  className={`cp-round-btn${activeRound === '1' ? ' active' : ''}`}
                  role="tab" aria-selected={activeRound === '1'}
                >
                  {t('round1')}
                </Link>
                <Link
                  href={`/${locale}/compare/${electionId}${cat ? `?category=${cat}&round=2` : '?round=2'}`}
                  className={`cp-round-btn${activeRound === '2' ? ' active' : ''}`}
                  role="tab" aria-selected={activeRound === '2'}
                >
                  {t('round2')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── CATEGORY FILTER BAR — only for live elections ── */}
        {!isScheduled && (
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
        )}

        {/* Scroll hint */}
        {!isScheduled && candidateCount > 2 && (
          <div className="cp-scroll-hint" aria-live="polite">
            <span className="cp-scroll-arrow" aria-hidden="true">
              {isRTL ? '←' : '→'}
            </span>
            {t('scrollHint')} ({candidateCount})
          </div>
        )}

        {/* ════════════════════════════════════════════════
            BIFURCATION: scheduled empty state OR live matrix
            ════════════════════════════════════════════════ */}
        <main>
          {isScheduled ? (

            /* ── SCHEDULED EMPTY STATE ──────────────────── */
            <div className="cp-scheduled" role="region" aria-label={t('scheduledTitle')}>
              <div className="cp-scheduled-inner">

                {/* Status badge */}
                <div className="cp-sched-status">
                  <span className="cp-sched-dot" aria-hidden="true" />
                  {t('scheduledTitle')}
                </div>

                {/* Main message */}
                <h2 className="cp-sched-title">
                  {t('scheduledBody')}
                </h2>

                <hr className="cp-sched-rule" aria-hidden="true" />

                {/* Secondary note */}
                <p className="cp-sched-note">{t('scheduledNote')}</p>

                {/* Date meta — only rendered when data is available */}
                {(election.electionDate || election.scheduledOpeningDate) && (
                  <div className="cp-sched-dates">
                    {election.electionDate && (
                      <div className="cp-sched-date-item">
                        <span className="cp-sched-date-label">{t('electionDate')}</span>
                        <span className="cp-sched-date-val">{election.electionDate}</span>
                      </div>
                    )}
                    {election.scheduledOpeningDate && (
                      <div className="cp-sched-date-item">
                        <span className="cp-sched-date-label">{t('monitoringFrom')}</span>
                        <span className="cp-sched-date-val">{election.scheduledOpeningDate}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          ) : (

            /* ── N-CANDIDATE MATRIX ─────────────────────── */
            <div
              className="cp-matrix-outer"
              role="region"
              aria-label={getLocalised(election.electionName, locale)}
            >
              <div className="cp-matrix-inner">

                {candidates.map(cand => {
                  const candRows = matrixData[cand.id] ?? []
                  return (
                    <div key={cand.id} className="cp-col">

                      {/* ── STICKY CANDIDATE HEADER ── */}
                      <div className="cp-cand-header">
                        <div className="cp-cand-identity">
                          <div
                            className="cp-avatar"
                            style={{ background: cand.color ?? '#27272A' }}
                            aria-hidden="true"
                          >
                            {cand.photoUrl
                              ? <img src={cand.photoUrl} alt={cand.displayName ?? cand.fullName} />
                              : (cand.initials ?? cand.fullName.slice(0, 2).toUpperCase())}
                          </div>
                          <div>
                            <p className="cp-cand-name">{cand.fullName}</p>
                            <p className="cp-cand-party">
                              {cand.party ?? ''}
                              {cand.electoralNumber && (
                                <span style={{ opacity: 0.5 }}>
                                  {' '}· No. {cand.electoralNumber}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {cand.sources?.electoralFiling && (
                          <a
                            href={cand.sources.electoralFiling}
                            target="_blank" rel="noopener noreferrer"
                            className="cp-official-btn"
                          >
                            {t('officialSrc')}
                          </a>
                        )}
                      </div>

                      {/* ── COLUMN CONTENT ─────────── */}
                      <div className="cp-col-content">
                        {candRows.map((section: any) => {
                          const cfg = CATEGORY_CONFIG[section.category as Category]
                          if (!cfg) return null
                          return (
                            <div key={section.category}>
                              <div className="cp-cat-header">
                                <div
                                  className="cp-cat-dot"
                                  style={{ background: cfg.color ?? 'var(--plat-faint)' }}
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
                                  key={`${section.category}-${idx}`}
                                  p={p}
                                  cfg={cfg}
                                  locale={locale}
                                  t={t}
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
          )}
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

// ─────────────────────────────────────────────────────────────────────────────
// buildMatrix — unchanged logic, improved null safety
// ─────────────────────────────────────────────────────────────────────────────

function buildMatrix(
  election: Election,
  candidates: Candidate[],
  filterCat: Category | undefined,
): Record<string, Array<{ category: string; promises: any[] }>> {
  const result: Record<string, Array<{ category: string; promises: any[] }>> = {}
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]
  const cats    = filterCat ? [filterCat] : allCats
  const promises = election.promises ?? []

  for (const cand of candidates) {
    result[cand.id] = cats.map(cat => ({
      category: cat,
      promises: promises.filter(
        (p: any) => p?.candidateId === cand.id && p?.category === cat
      ),
    }))

    // Remove empty categories when not filtering by a single category
    if (!filterCat) {
      result[cand.id] = result[cand.id].filter(s => s.promises.length > 0)
    }
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// PromiseCard
// ─────────────────────────────────────────────────────────────────────────────

function PromiseCard({
  p, cfg, locale, t,
}: {
  p: any; cfg: any; locale: string; t: (k: string) => string
}) {
  const getHost = (url?: string | null): string => {
    if (!url) return ''
    try { return new URL(url).hostname } catch { return url }
  }

  const displayText: string =
    p?.text?.[locale] ??
    p?.text?.['en'] ??
    p?.text_original ??
    ''

  const quoteText: string =
    p?.quote?.[locale] ??
    p?.quote?.['en'] ??
    ''

  return (
    <article className="cp-promise">

      <span className="cp-cat-tag" style={{ background: cfg.bg, color: cfg.color }}>
        <span aria-hidden="true">{cfg.emoji}</span>
        {cfg.label[locale] || cfg.label['en']}
      </span>

      <p className="cp-promise-text">{displayText}</p>

      {quoteText && (
        <blockquote className="cp-promise-quote">{quoteText}</blockquote>
      )}

      <div className="cp-provenance">
        {p?.sourceUrl && (
          <span className="cp-prov-src">{getHost(p.sourceUrl)}</span>
        )}

        {p?.collectedAt && (
          <>
            <span className="cp-prov-sep" aria-hidden="true">·</span>
            <time className="cp-prov-date" dateTime={p.collectedAt}>
              {String(p.collectedAt).slice(0, 10)}
            </time>
          </>
        )}

        {p?.archiveUrl && (
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

        {p?.contentHash && (
          <span className="cp-authentic" title={`SHA-256: ${p.contentHash}`}>
            🔒{' '}
            {locale === 'pt' ? 'Autêntico' : locale === 'es' ? 'Auténtico' : 'Authentic'}
          </span>
        )}
      </div>

    </article>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SocialLinks
// ─────────────────────────────────────────────────────────────────────────────

function SocialLinks({
  sources,
  t,
}: {
  sources?: ElectionSources | null
  t: (k: string) => string
}) {
  if (!sources) return null

  const links = (
    [
      sources.officialSite && { key: 'Site',      url: sources.officialSite },
      sources.instagram    && { key: 'Instagram', url: sources.instagram },
      sources.twitter      && { key: 'X',         url: sources.twitter },
      sources.facebook     && { key: 'Facebook',  url: sources.facebook },
      sources.youtube      && { key: 'YouTube',   url: sources.youtube },
      sources.tiktok       && { key: 'TikTok',    url: sources.tiktok },
    ] as const
  ).filter((l): l is { key: string; url: string } => Boolean(l))

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
