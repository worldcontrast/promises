/**
 * World Contrast — Compare Page v4.0 · The Masterfile
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * CONSOLIDATED FEATURES:
 * 1. Universal UX (Apple-Grade): 100% `rem` typography, 44px touch targets, 85vw scroll snap.
 * 2. Smoke Index: "Promises" vs "Rhetoric" data bifurcation based on accountability_score.
 * 3. Scheduled Scaffolding: Beautiful Empty State for elections without candidates yet.
 * 4. Null Safety: Strict typing and optional chaining across all datasets.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection, getLocalised } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

type ViewMode = 'promises' | 'rhetoric'
type ElectionStatus = 'live' | 'scheduled'

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

  const rawElection = await getElection(electionId)
  if (!rawElection) notFound()
  const election = rawElection as any

  const isScheduled = (
    election.status === 'scheduled' ||
    !Array.isArray(election.candidates) ||
    election.candidates.length === 0
  )

  const candidates = isScheduled ? [] : [...election.candidates].sort(() => Math.random() - 0.5)
  const allCats    = Object.keys(CATEGORY_CONFIG) as Category[]
  const matrixData = isScheduled ? {} : buildMatrix(election, candidates, cat, activeView)

  const isRTL          = locale === 'ar'
  const candidateCount = candidates.length
  const hasMultipleRounds = election.hasRounds ?? false

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
    disclaimer:     { en:'Candidate column order is randomized on each load to prevent semiotic positioning bias.', pt:'A ordem das colunas é randomizada a cada carregamento para anular viés semiótico de posicionamento.', es:'El orden de candidatos se aleatoriza en cada carga para evitar sesgo semiótico.', fr:"L'ordre des candidats est aléatoire à chaque chargement.", de:'Die Kandidatenreihenfolge wird bei jedem Laden zufällig bestimmt.', ar:'يتم تعيين ترتيب المرشحين عشوائياً في كل تحميل لمنع التحيز.' },
    scrollHint:     { en:'Scroll → to see all candidates', pt:'Deslize → para ver todos os candidatos', es:'Deslice → para ver todos', fr:'Faites défiler → pour voir tous', de:'Scrollen → für alle Kandidaten', ar:'اسحب ← لرؤية جميع المرشحين' },
    
    // Smoke Index Strings
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

    // Scheduled Strings
    scheduledTitle: { en:'Election scheduled', pt:'Eleição agendada', es:'Elección programada', fr:'Élection programmée', de:'Wahl geplant', ar:'انتخابات مقررة' },
    scheduledBody:  {
      en: 'Candidates are still being defined. World Contrast will begin official monitoring of campaign promises after the party conventions.',
      pt: 'Candidatos em definição. O World Contrast iniciará a monitorização oficial das promessas após as convenções partidárias.',
      es: 'Los candidatos aún están en definición. World Contrast iniciará el monitoreo oficial de las promesas tras las convenciones partidarias.'
    },
    scheduledNote:  {
      en: 'This election has been pre-registered in the World Contrast global registry. Monitoring will begin automatically once official candidacies are declared.',
      pt: 'Esta eleição foi pré-registrada no registo global do World Contrast. A monitorização iniciará automaticamente quando as candidaturas oficiais forem declaradas.',
      es: 'Esta elección ha sido pre-registrada en el registro global de World Contrast. El monitoreo iniciará automáticamente cuando se declaren las candidaturas oficiales.'
    },
    electionDate:   { en:'Expected date', pt:'Data prevista', es:'Fecha prevista', fr:'Date prévue', de:'Voraussichtliches Datum', ar:'التاريخ المتوقع' },
    monitoringFrom: { en:'Monitoring from', pt:'Monitorização a partir de', es:'Monitoreo desde', fr:'Surveillance à partir de', de:'Überwachung ab', ar:'المراقبة من' },
  }
  function t(k: string) { return L[k]?.[locale] ?? L[k]?.['en'] ?? k }

  function buildHref(overrides: Record<string, string | undefined>): string {
    const base: Record<string, string | undefined> = {
      view:     activeView === 'promises' ? undefined : activeView,
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
        :root {
          --onyx:         #0A0A0B;
          --onyx-2:       #111113;
          --onyx-3:       #18181B;
          --onyx-4:       #27272A;
          --onyx-5:       #3F3F46;
          --platinum:     #E4E4E7;
          --plat-muted:   #A1A1AA; 
          --plat-faint:   #71717A; 
          
          --gold:         #C8A96E;
          --gold-dim:     rgba(200,169,110,0.10);
          --gold-bdr:     rgba(200,169,110,0.25);
          --emerald:      #10B981;
          --emerald-dim:  rgba(16,185,129,0.10);
          --rule:         rgba(255,255,255,0.06);
          --rule-faint:   rgba(255,255,255,0.04);
          --rule-gold:    rgba(200,169,110,0.15);

          --smoke:        #D4A257; 
          --smoke-dim:    rgba(212,162,87,0.10);
          --smoke-bdr:    rgba(212,162,87,0.25);

          --font-d: 'IBM Plex Sans', system-ui, sans-serif;
          --font-m: 'IBM Plex Mono', 'Courier New', monospace;

          --col-min:  340px;
          --col-max:  480px;
          --col-w:    clamp(var(--col-min), 30vw, var(--col-max));
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-root {
          font-family: var(--font-d); background: var(--onyx); color: var(--platinum);
          min-height: 100vh; -webkit-font-smoothing: antialiased;
          width: max-content; min-width: 100vw;
        }
        .cp-root.rhetoric-mode { background: #0B0A08; }

        /* ── HEADER ──────────────────────────────────────── */
        .cp-page-header {
          position: sticky; left: 0; width: 100vw; box-sizing: border-box;
          background: var(--onyx); border-bottom: 1px solid var(--rule-faint);
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .cp-root.rhetoric-mode .cp-page-header { background: #0B0A08; border-bottom-color: var(--smoke-bdr); }

        .cp-breadcrumb { padding-top: 14px; padding-bottom: 4px; }
        .cp-breadcrumb a { font-family: var(--font-m); font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--plat-muted); text-decoration: none; transition: color 0.18s; }
        .cp-breadcrumb a:hover { color: var(--platinum); }

        .cp-election-title { font-size: clamp(1.125rem, 3vw, 1.75rem); font-weight: 700; color: var(--platinum); letter-spacing: -0.5px; padding: 4px 0 2px; }
        .cp-meta { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-muted); letter-spacing: 0.3px; padding-bottom: 10px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .cp-meta a { color: var(--gold); text-decoration: none; transition: opacity 0.18s; }
        .cp-meta a:hover { opacity: 0.75; }
        .cp-meta-sep { color: var(--plat-faint); }

        .cp-controls { display: flex; align-items: center; gap: 12px; padding: 8px 0 12px; flex-wrap: wrap; }
        .cp-rounds-track, .cp-view-track { display: inline-flex; background: var(--onyx-3); border: 1px solid var(--rule); border-radius: 8px; padding: 3px; gap: 2px; }
        
        /* 44px UX Targets */
        .cp-round-btn, .cp-view-btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-m); font-size: 0.8125rem; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; gap: 6px; transition: background 0.2s, color 0.2s; color: var(--plat-muted); background: transparent; white-space: nowrap; }
        .cp-round-btn { padding: 0 20px; }
        .cp-view-btn { padding: 0 18px; }
        .cp-round-btn.active, .cp-view-btn.active-promises { background: var(--gold-dim); color: var(--gold); border: 1px solid var(--gold-bdr); }
        .cp-view-btn.active-rhetoric { background: var(--smoke-dim); color: var(--smoke); border: 1px solid var(--smoke-bdr); }
        .cp-round-btn:not(.active):hover, .cp-view-btn:not([class*="active"]):hover { color: var(--platinum); background: rgba(255,255,255,0.04); }
        .cp-view-icon { font-size: 0.875rem; line-height: 1; }
        .cp-view-desc { font-family: var(--font-m); font-size: 0.75rem; color: var(--plat-faint); letter-spacing: 0.5px; padding: 0 0 8px; }

        /* ── SCHEDULED EMPTY STATE ────────────────────────── */
        .cp-scheduled { position: sticky; left: 0; width: 100vw; box-sizing: border-box; min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; padding: clamp(64px, 10vw, 120px) clamp(24px, 8vw, 96px); text-align: center; }
        .cp-scheduled::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .cp-scheduled::after { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse at top center, rgba(200,169,110,0.05) 0%, transparent 70%); pointer-events: none; }
        .cp-scheduled-inner { position: relative; z-index: 1; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .cp-sched-status { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-m); font-size: 0.6875rem; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); border: 1px solid var(--gold-bdr); background: var(--gold-dim); padding: 5px 14px; border-radius: 2px; }
        .cp-sched-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); opacity: 0.7; animation: sched-pulse 3s ease-in-out infinite; }
        @keyframes sched-pulse { 0%,100%{opacity:0.7} 50%{opacity:0.25} }
        .cp-sched-title { font-family: var(--font-d); font-size: clamp(1.375rem, 3.5vw, 2.25rem); font-weight: 700; color: var(--platinum); line-height: 1.15; letter-spacing: -0.5px; }
        .cp-sched-rule { width: 40px; height: 1px; background: var(--gold); opacity: 0.3; border: none; margin: 8px 0; }
        .cp-sched-note { font-family: var(--font-m); font-size: 0.75rem; color: var(--plat-faint); line-height: 1.8; max-width: 420px; }
        .cp-sched-dates { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
        .cp-sched-date-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .cp-sched-date-label { font-family: var(--font-m); font-size: 0.625rem; letter-spacing: 2px; text-transform: uppercase; color: var(--plat-faint); }
        .cp-sched-date-val { font-family: var(--font-m); font-size: 0.8125rem; color: var(--gold); letter-spacing: 0.5px; }

        /* ── FILTER BAR ──────────────────────────────────── */
        .cp-filter-bar { position: sticky; top: 60px; left: 0; width: 100vw; box-sizing: border-box; z-index: 100; background: #0A0A0B; border-bottom: 1px solid var(--rule-faint); padding: 0 clamp(16px, 4vw, 48px); display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
        .cp-filter-bar::-webkit-scrollbar { display: none; }
        .cp-root.rhetoric-mode .cp-filter-bar { background: #0B0A08; }
        .cp-filter-bar-inner { display: flex; gap: 6px; padding: 12px 0; min-width: max-content; }
        .cp-filter-pill { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; gap: 6px; font-family: var(--font-m); font-size: 0.8125rem; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; border: 1px solid var(--rule); border-radius: 4px; color: var(--plat-muted); background: transparent; text-decoration: none; white-space: nowrap; transition: all 0.15s; }
        .cp-filter-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-filter-pill.active { background: var(--gold-dim); color: var(--gold); border-color: var(--gold-bdr); }
        .cp-filter-emoji { font-size: 0.875rem; }

        .cp-scroll-hint { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-muted); letter-spacing: 1px; padding: 10px clamp(16px,4vw,48px); background: var(--onyx); display: flex; align-items: center; gap: 6px; animation: fade-out 4s ease forwards; animation-delay: 3s; position: sticky; left: 0; width: 100vw; box-sizing: border-box; }
        .cp-scroll-arrow { color: var(--gold); font-size: 0.875rem; }

        /* ── MATRIX ──────────────────────────────────────── */
        main, .cp-matrix-outer, .cp-matrix-inner, .cp-col { margin-top: 0; padding-top: 0; }
        .cp-matrix-outer { width: 100%; }
        .cp-matrix-inner { display: flex; width: max-content; min-width: 100%; }
        .cp-col { width: var(--col-w); min-width: var(--col-min); flex-shrink: 0; scroll-snap-align: start; border-right: 1px solid var(--rule-faint); display: flex; flex-direction: column; }
        .cp-col:last-child { border-right: none; }

        /* ── CANDIDATE HEADER ────────────────────────────── */
        .cp-cand-header { position: sticky; top: 128px; z-index: 90; background: #111113; border-bottom: 1px solid var(--rule-gold); padding: 24px 24px 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .cp-root.rhetoric-mode .cp-cand-header { border-bottom-color: var(--smoke-bdr); }
        .cp-cand-identity { display: flex; align-items: center; gap: 14px; }
        .cp-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: var(--onyx); flex-shrink: 0; overflow: hidden; border: 1.5px solid rgba(255,255,255,0.12); }
        .cp-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .cp-cand-name { font-size: 1rem; font-weight: 700; color: var(--platinum); line-height: 1.25; letter-spacing: -0.2px; }
        .cp-cand-party { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-muted); letter-spacing: 0.5px; margin-top: 4px; }
        
        .cp-official-btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; font-family: var(--font-m); font-size: 0.8125rem; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold); border: 1px solid var(--gold-bdr); background: var(--gold-dim); border-radius: 4px; text-decoration: none; align-self: flex-start; transition: background 0.18s, border-color 0.18s; }
        .cp-official-btn:hover { background: rgba(200,169,110,0.18); border-color: rgba(200,169,110,0.45); }
        .cp-smoke-count { display: flex; align-items: center; gap: 6px; font-family: var(--font-m); font-size: 0.8125rem; color: var(--smoke); letter-spacing: 0.5px; }
        .cp-smoke-count-icon { font-size: 0.9375rem; }
        .cp-col-content { padding-top: 16px; display: flex; flex-direction: column; flex: 1; }

        /* ── PROMISE CARD ────────────────────────────────── */
        .cp-cat-header { padding: 16px 24px 12px; border-bottom: 1px solid var(--rule-faint); border-top: 1px solid var(--rule); background: var(--onyx-3); display: flex; align-items: center; gap: 10px; }
        .cp-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cp-cat-label { font-family: var(--font-m); font-size: 0.8125rem; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--plat-muted); }
        .cp-cat-count { font-family: var(--font-m); font-size: 0.75rem; color: var(--plat-faint); margin-left: auto; }
        
        .cp-promise { padding: 32px 24px 28px; border-bottom: 1px solid var(--rule-faint); display: flex; flex-direction: column; gap: 16px; min-height: 200px; transition: background 0.2s; }
        .cp-promise--empty { padding: 32px 24px; border-bottom: 1px solid var(--rule-faint); min-height: 140px; display: flex; align-items: center; }
        .cp-promise.rhetoric { background: rgba(212,162,87,0.03); }
        .cp-cat-tag { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-m); font-size: 0.8125rem; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; align-self: flex-start; }

        /* REM Fluid Typography */
        .cp-promise-text { font-size: clamp(1rem, 2vw, 1.125rem); font-weight: 400; color: var(--platinum); line-height: 1.6; letter-spacing: 0.01em; }
        .cp-promise.rhetoric .cp-promise-text { opacity: 0.65; }
        .cp-promise-quote { font-size: clamp(0.875rem, 1.5vw, 1rem); font-style: italic; font-weight: 300; color: var(--plat-muted); line-height: 1.6; padding-left: 1rem; border-left: 3px solid var(--rule-gold); margin-left: 0; }
        .cp-promise-empty { font-family: var(--font-m); font-size: 0.875rem; font-style: italic; color: var(--plat-faint); letter-spacing: 0.3px; }

        /* Metrics & Tags */
        .cp-metric-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .cp-metric-tag { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-m); font-size: 0.75rem; font-weight: 400; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--rule); color: var(--plat-muted); background: transparent; }
        .cp-metric-tag.has-value { border-color: rgba(200,169,110,0.20); color: var(--gold); }
        .cp-metric-tag-key { color: var(--plat-faint); font-size: 0.6875rem; }
        .cp-score { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; }
        .cp-score-pip { width: 6px; height: 16px; border-radius: 2px; background: var(--rule); flex-shrink: 0; }
        .cp-score-pip.filled { background: var(--emerald); }

        .cp-smoke-tag { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-m); font-size: 0.75rem; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border-radius: 4px; border: 1px solid var(--smoke-bdr); color: var(--smoke); background: var(--smoke-dim); align-self: flex-start; }
        .cp-smoke-icon { font-size: 0.875rem; }
        .cp-smoke-reason { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-muted); line-height: 1.6; font-style: italic; padding: 8px 12px; border-radius: 4px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--smoke-bdr); }
        .cp-smoke-note { font-family: var(--font-m); font-size: 0.75rem; color: var(--plat-faint); line-height: 1.7; }

        .cp-provenance { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--rule-faint); }
        .cp-prov-src, .cp-prov-date { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-faint); letter-spacing: 0.3px; }
        .cp-prov-sep { color: var(--plat-faint); font-size: 0.75rem; }
        .cp-prov-archive { font-family: var(--font-m); font-size: 0.8125rem; color: var(--gold); text-decoration: none; opacity: 0.8; transition: opacity 0.15s; }
        .cp-prov-archive:hover { opacity: 1; }
        
        .cp-authentic { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-m); font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; color: var(--emerald); border: 1px solid rgba(200,169,110,0.25); background: var(--emerald-dim); padding: 4px 10px; border-radius: 4px; margin-left: auto; }
        .cp-authentic-icon { font-size: 0.8125rem; }

        /* ── SOURCES & FOOTER ────────────────────────────── */
        .cp-sources-row { padding: 32px 24px; border-top: 1px solid var(--rule); background: var(--onyx-3); margin-top: auto; }
        .cp-sources-title { font-family: var(--font-m); font-size: 0.8125rem; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); opacity: 0.7; margin-bottom: 16px; }
        .cp-social-links { display: flex; flex-wrap: wrap; gap: 8px; }
        .cp-social-pill { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; font-family: var(--font-m); font-size: 0.8125rem; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; text-decoration: none; border: 1px solid var(--rule); color: var(--plat-muted); transition: all 0.15s; }
        .cp-social-pill:hover { color: var(--platinum); border-color: var(--plat-faint); }
        .cp-social-pill.official { color: var(--gold); border: 1px solid var(--gold-bdr); background: var(--gold-dim); }
        .cp-social-pill.official:hover { background: rgba(200,169,110,0.18); }

        .cp-footer { position: sticky; left: 0; width: 100vw; box-sizing: border-box; background: var(--onyx); padding: 40px clamp(16px,4vw,48px); border-top: 1px solid var(--rule-faint); display: flex; flex-direction: column; gap: 12px; }
        .cp-footer-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .cp-footer-text, .cp-footer-link { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-muted); letter-spacing: 0.03em; }
        .cp-footer-link { color: var(--gold); opacity: 0.75; transition: opacity 0.15s; }
        .cp-footer-link:hover { opacity: 1; }
        .cp-disclaimer { font-family: var(--font-m); font-size: 0.8125rem; color: var(--plat-faint); line-height: 1.7; max-width: 680px; letter-spacing: 0.02em; }

        @media(max-width: 640px) {
          :root { --col-min: 85vw; --col-max: 85vw; }
          .cp-matrix-outer { scroll-snap-type: x mandatory; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
          .cp-col { scroll-snap-align: center; }
          .cp-cand-header { padding: 16px 16px 14px; top: 116px; }
          .cp-avatar { width: 44px; height: 44px; font-size: 0.875rem; }
          .cp-promise { padding: 24px 16px 20px; }
          .cp-promise--empty { padding: 24px 16px; }
          .cp-cat-header { padding: 14px 16px 10px; }
          .cp-sources-row { padding: 24px 16px; }
          .cp-view-btn { padding: 0 12px; font-size: 0.75rem; }
          .cp-view-btn .cp-view-icon { display: none; }
          .cp-sched-dates { flex-direction: column; gap: 16px; }
        }
      `}</style>

      <div className={`cp-root${activeView === 'rhetoric' && !isScheduled ? ' rhetoric-mode' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── STICKY PAGE HEADER ───────────────────────── */}
        <div className="cp-page-header">
          <div className="cp-breadcrumb">
            <Link href={`/${locale}`}>{t('back')}</Link>
          </div>

          <h1 className="cp-election-title">
            {election?.flag && <span aria-hidden="true">{election.flag} </span>}
            {getLocalised(election?.electionName, locale)}
          </h1>

          <p className="cp-meta">
            <span>{t('officialOnly')}</span>
            {election?.lastUpdated && (
              <>
                <span className="cp-meta-sep">·</span>
                <span>{t('updated')}: </span>
                <time dateTime={election.lastUpdated}>{election.lastUpdated.slice(0, 10)}</time>
              </>
            )}
            {election?.tribunal?.url && election?.tribunal?.name && (
              <>
                <span className="cp-meta-sep">·</span>
                <a href={election.tribunal.url} target="_blank" rel="noopener noreferrer">
                  {election.tribunal.name} ↗
                </a>
              </>
            )}
          </p>

          <div className="cp-controls">
            {!isScheduled && hasMultipleRounds && (
              <div className="cp-rounds-track" role="tablist" aria-label="Round selection">
                <Link href={buildHref({ round: '1' })} className={`cp-round-btn${activeRound === '1' ? ' active' : ''}`} role="tab" aria-selected={activeRound === '1'}>
                  {t('round1')}
                </Link>
                <Link href={buildHref({ round: '2' })} className={`cp-round-btn${activeRound === '2' ? ' active' : ''}`} role="tab" aria-selected={activeRound === '2'}>
                  {t('round2')}
                </Link>
              </div>
            )}

            {!isScheduled && (
              <div className="cp-view-track" role="tablist" aria-label="View mode">
                <Link href={buildHref({ view: undefined })} className={`cp-view-btn${activeView === 'promises' ? ' active-promises' : ''}`} role="tab" aria-selected={activeView === 'promises'} title={t('viewPromisesDesc')}>
                  <span className="cp-view-icon" aria-hidden="true">✓</span>
                  {t('viewPromises')}
                </Link>
                <Link href={buildHref({ view: 'rhetoric' })} className={`cp-view-btn${activeView === 'rhetoric' ? ' active-rhetoric' : ''}`} role="tab" aria-selected={activeView === 'rhetoric'} title={t('viewRhetoricDesc')}>
                  <span className="cp-view-icon" aria-hidden="true">〜</span>
                  {t('viewRhetoric')}
                </Link>
              </div>
            )}
          </div>
          
          {!isScheduled && (
            <p className="cp-view-desc">
              {activeView === 'rhetoric' ? t('viewRhetoricDesc') : t('viewPromisesDesc')}
            </p>
          )}
        </div>

        {/* ── CATEGORY FILTER BAR ──────────────────────── */}
        {!isScheduled && (
          <nav className="cp-filter-bar" aria-label="Category filter">
            <div className="cp-filter-bar-inner">
              <Link href={buildHref({ category: undefined })} className={`cp-filter-pill${!cat ? ' active' : ''}`}>
                {t('all')}
              </Link>
              {allCats.map(c => {
                const cfg = CATEGORY_CONFIG[c]
                return (
                  <Link key={c} href={buildHref({ category: c })} className={`cp-filter-pill${cat === c ? ' active' : ''}`}>
                    <span className="cp-filter-emoji" aria-hidden="true">{cfg.emoji}</span>
                    {cfg.label[locale] || cfg.label['en']}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}

        {!isScheduled && candidateCount > 2 && (
          <div className="cp-scroll-hint" aria-live="polite">
            <span className="cp-scroll-arrow" aria-hidden="true">{isRTL ? '←' : '→'}</span>
            {t('scrollHint')} ({candidateCount})
          </div>
        )}

        {/* ── MAIN CONTENT: MATRIX OR EMPTY STATE ──────── */}
        <main>
          {isScheduled ? (
            /* ── SCHEDULED EMPTY STATE ── */
            <div className="cp-scheduled" role="region" aria-label={t('scheduledTitle')}>
              <div className="cp-scheduled-inner">
                <div className="cp-sched-status">
                  <span className="cp-sched-dot" aria-hidden="true" />
                  {t('scheduledTitle')}
                </div>
                <h2 className="cp-sched-title">{t('scheduledBody')}</h2>
                <hr className="cp-sched-rule" aria-hidden="true" />
                <p className="cp-sched-note">{t('scheduledNote')}</p>
                
                {(election?.electionDate || election?.scheduledOpeningDate) && (
                  <div className="cp-sched-dates">
                    {election?.electionDate && (
                      <div className="cp-sched-date-item">
                        <span className="cp-sched-date-label">{t('electionDate')}</span>
                        <span className="cp-sched-date-val">{election.electionDate}</span>
                      </div>
                    )}
                    {election?.scheduledOpeningDate && (
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
            /* ── LIVE N-CANDIDATE MATRIX ── */
            <div className="cp-matrix-outer" role="region" aria-label={getLocalised(election.electionName, locale)}>
              <div className="cp-matrix-inner">
                {candidates.map(cand => {
                  const candRows = matrixData[cand.id] ?? []
                  const totalInView = candRows.reduce((s: number, r: any) => s + r.promises.length, 0)

                  return (
                    <div key={cand.id} className="cp-col">
                      <div className="cp-cand-header">
                        <div className="cp-cand-identity">
                          <div className="cp-avatar" style={{ background: cand.color ?? '#27272A' }} aria-hidden="true">
                            {cand.photoUrl ? <img src={cand.photoUrl} alt={cand.displayName ?? cand.fullName} /> : (cand.initials ?? cand.fullName.slice(0, 2).toUpperCase())}
                          </div>
                          <div>
                            <p className="cp-cand-name">{cand.fullName}</p>
                            <p className="cp-cand-party">
                              {cand.party ?? ''}
                              {cand.electoralNumber && <span style={{ opacity: 0.5 }}> · No. {cand.electoralNumber}</span>}
                            </p>
                          </div>
                        </div>

                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          {cand.sources?.electoralFiling && (
                            <a href={cand.sources.electoralFiling} target="_blank" rel="noopener noreferrer" className="cp-official-btn">
                              {t('officialSrc')}
                            </a>
                          )}
                          {activeView === 'rhetoric' && totalInView > 0 && (
                            <span className="cp-smoke-count">
                              <span className="cp-smoke-count-icon" aria-hidden="true">〜</span>
                              {totalInView}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="cp-col-content">
                        {candRows.map((section: any) => {
                          const cfg = CATEGORY_CONFIG[section.category as Category]
                          if (!cfg) return null
                          return (
                            <div key={section.category}>
                              <div className="cp-cat-header">
                                <div className="cp-cat-dot" style={{ background: cfg.color ?? 'var(--plat-faint)' }} aria-hidden="true" />
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
                                <PromiseCard key={`${section.category}-${idx}`} p={p} cfg={cfg} locale={locale} t={t} activeView={activeView} />
                              ))}
                            </div>
                          )
                        })}

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
            <a href="https://github.com/worldcontrast/promises" target="_blank" rel="noopener noreferrer" className="cp-footer-link">GitHub ↗</a>
          </div>
          <p className="cp-disclaimer">{t('disclaimer')}</p>
        </footer>

      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   buildMatrix v4
   ═══════════════════════════════════════════════════════ */
function buildMatrix(
  election: any, candidates: any[], filterCat: Category | undefined, view: ViewMode,
): Record<string, Array<{ category: string; promises: any[] }>> {
  const result: Record<string, Array<{ category: string; promises: any[] }>> = {}
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]
  const cats    = filterCat ? [filterCat] : allCats

  for (const cand of candidates) {
    const basePromises: any[] = (election.promises ?? []).filter((p: any) => {
      if (p?.candidateId !== cand.id) return false
      const score = p?.accountability_score ?? 0
      if (view === 'promises') return score >= 3
      if (view === 'rhetoric') return score < 3 && score > 0 
      return true
    })

    let rhetoricExtras: any[] = []
    if (view === 'rhetoric') {
      const candidateRejections: any[] = (election.extraction_rejections ?? []).filter(
        (r: any) => r?.candidateId === cand.id || r?.candidate_id === cand.id
      )
      rhetoricExtras = candidateRejections.map((r: any) => ({
        candidateId:         cand.id,
        category:            r?.category ?? 'governance', 
        text_original:       r?.text_original ?? r?.text ?? '',
        rejection_reason:    r?.rejection_reason ?? r?.reason ?? '',
        accountability_score: 0,
        isRejection:         true,
        sourceUrl:           r?.source_url ?? '',
        collectedAt:         r?.collected_at ?? '',
      }))
    }

    const allItems = [...basePromises, ...rhetoricExtras]

    result[cand.id] = cats.map(cat => {
      const promises = allItems.filter((p: any) => p?.category === cat)
      return { category: cat, promises }
    })

    if (!filterCat) {
      result[cand.id] = result[cand.id].filter(s => s.promises.length > 0)
    }
  }
  return result
}

/* ═══════════════════════════════════════════════════════
   PromiseCard v4
   ═══════════════════════════════════════════════════════ */
function PromiseCard({ p, cfg, locale, t, activeView }: { p: any, cfg: any, locale: string, t: (k: string) => string, activeView: ViewMode }) {
  const getHost = (url?: string | null) => { if(!url) return ''; try { return new URL(url).hostname } catch { return url } }
  
  const isRhetoric   = activeView === 'rhetoric'
  const isRejection  = Boolean(p?.isRejection)
  const score        = p?.accountability_score ?? 0

  const rawReason  = p?.rejection_reason ?? ''
  const reasonText = rawReason.includes(':') ? rawReason.split(':').slice(1).join(' ').replace(/_/g, ' ') : rawReason.replace(/_/g, ' ')
  const displayText = p?.text?.[locale] || p?.text?.['en'] || p?.text_original || ''

  return (
    <article className={`cp-promise${isRhetoric ? ' rhetoric' : ''}`}>
      <span className="cp-cat-tag" style={{ background: cfg.bg, color: cfg.color }}>
        <span aria-hidden="true">{cfg.emoji}</span>
        {cfg.label[locale] || cfg.label['en']}
      </span>

      {isRhetoric && (
        <>
          <span className="cp-smoke-tag">
            <span className="cp-smoke-icon" aria-hidden="true">〜</span>
            {isRejection ? t('rejected') : t('lowTrace')}
          </span>
          {reasonText && (
            <p className="cp-smoke-reason">
              <strong style={{ opacity:0.7, marginRight:6 }}>{t('rejectionReason')}:</strong>
              {reasonText}
            </p>
          )}
        </>
      )}

      <p className="cp-promise-text">{displayText}</p>

      {!isRhetoric && p?.quote && (
        <blockquote className="cp-promise-quote">
          {p.quote?.[locale] || p.quote?.['en'] || ''}
        </blockquote>
      )}

      {!isRhetoric && (
        <div className="cp-metric-row">
          {p?.metrics && (
            <span className={`cp-metric-tag${p.metrics ? ' has-value' : ''}`}>
              <span className="cp-metric-tag-key">{t('metrics')}</span>
              {String(p.metrics).slice(0, 40)}
            </span>
          )}
          {p?.deadline && (
            <span className="cp-metric-tag has-value">
              <span className="cp-metric-tag-key">{t('deadline')}</span>
              {String(p.deadline)}
            </span>
          )}
          {p?.verification_criteria && (
            <span className="cp-metric-tag">
              <span className="cp-metric-tag-key">{t('verification')}</span>
              {String(p.verification_criteria).slice(0, 35)}
            </span>
          )}
          {score > 0 && (
            <span className="cp-score" title={`${t('accountScore')}: ${score}/5`} aria-label={`${t('accountScore')} ${score} of 5`}>
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`cp-score-pip${n <= score ? ' filled' : ''}`} aria-hidden="true" />
              ))}
            </span>
          )}
        </div>
      )}

      {isRhetoric && <p className="cp-smoke-note">{t('smokeNote')}</p>}

      <div className="cp-provenance">
        {p?.sourceUrl && <span className="cp-prov-src">{getHost(p.sourceUrl)}</span>}
        {p?.collectedAt && (
          <>
            <span className="cp-prov-sep" aria-hidden="true">·</span>
            <time className="cp-prov-date" dateTime={p.collectedAt}>{String(p.collectedAt).slice(0, 10)}</time>
          </>
        )}
        {p?.archiveUrl && (
          <>
            <span className="cp-prov-sep" aria-hidden="true">·</span>
            <a href={p.archiveUrl} target="_blank" rel="noopener noreferrer" className="cp-prov-archive">{t('archive')}</a>
          </>
        )}
        {p?.contentHash && !isRejection && (
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
   SocialLinks
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
        <a href={sources.electoralFiling} target="_blank" rel="noopener noreferrer" className="cp-social-pill official">
          {t('officialSrc')}
        </a>
      )}
      {links.map(l => (
        <a key={l.key} href={l.url} target="_blank" rel="noopener noreferrer" className="cp-social-pill">
          {l.key} ↗
        </a>
      ))}
    </div>
  )
}
