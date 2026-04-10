/**
 * World Contrast — Compare Page v12.0
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * GRADE SUÍÇA LADO-A-LADO:
 *   [  Candidato A  ] [1px] [  Candidato B  ]
 *   ─────── 1fr ──── ──── ─────── 1fr ────
 *
 * HIERARQUIA TIPOGRÁFICA:
 *   Promessa  → Playfair (FATO)
 *   Citação   → Playfair itálico (FATO bruto)
 *   Rótulos   → IBM Plex Sans (MÁQUINA)
 *   Hash/URL  → IBM Plex Mono (PROVA)
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection, getComparisonData, getLocalised } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'
import AuthenticityBadge from '@/components/AuthenticityBadge'
import MobileCandToggle from '@/components/MobileCandToggle'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string; electionId: string }>
  searchParams: Promise<{ category?: string }>
}

export async function generateStaticParams() { return [] }

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  const { category } = await searchParams
  const cat = category as Category | undefined

  const election = await getElection(electionId)
  if (!election || election.candidates.length < 2) notFound()

  // Randomização semiótica — nenhum candidato é "padrão à esquerda"
  const randomizedCandidates = [...election.candidates]
  if (Math.random() > 0.5) randomizedCandidates.reverse()
  const [candA, candB] = randomizedCandidates

  const data = getComparisonData(election, candA.id, candB.id, cat)
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]

  const labels: Record<string, Record<string, string>> = {
    back:         { en: '← All countries',   pt: '← Todos os países',   es: '← Todos los países',   fr: '← Tous les pays',   ar: '← جميع البلدان',   de: '← Alle Länder' },
    officialOnly: { en: 'Official sources',   pt: 'Fontes oficiais',     es: 'Fuentes oficiais',    fr: 'Sources officielles', ar: 'مصادر رسمية',      de: 'Offizielle Quellen' },
    updated:      { en: 'Updated',            pt: 'Atualizado',          es: 'Atualizado',          fr: 'Mis à jour',         ar: 'محدّث',            de: 'Aktualisiert' },
    all:          { en: 'All',                pt: 'Todos',               es: 'Todos',                fr: 'Tous',               ar: 'الكل',             de: 'Alle' },
    officialSrc:  { en: 'Official filing ↗',  pt: 'Ficha oficial ↗',     es: 'Ficha oficial ↗',      fr: 'Dossier officiel ↗', ar: 'الملف الرسمي ↗',   de: 'Offizielle Akte ↗' },
    noPromise:    { en: 'No promise found in official sources.', pt: 'Nenhuma promessa encontrada nas fontes oficiais.', es: 'Ninguna promesa encontrada en fuentes oficiales.', fr: 'Aucune promesse trouvée dans les sources officielles.', ar: 'لم يتم العثور على أي وعد في المصادر الرسمية.', de: 'Kein Versprechen in offiziellen Quellen gefunden.' },
    archive:      { en: 'Archive ↗',          pt: 'Arquivo ↗',           es: 'Arquivo ↗',            fr: 'Archive ↗',          ar: 'أرشيف ↗',          de: 'أرشيف ↗' },
    entries:      { en: 'entries',            pt: 'registros',           es: 'registros',            fr: 'entrées',            ar: 'سجلات',            de: 'Einträge' },
    footer:       { en: 'Zero bias · Official sources only', pt: 'Zero viés · Apenas fontes oficiais', es: 'Cero sesgo · Solo fuentes oficiales', fr: 'Zéro biais · Sources officielles uniquement', ar: 'صفر تحيز · المصادر الرسمية فقط', de: 'Null Voreingenommenheit · Nur offizielle Quellen' },
    disclaimer:   { en: 'Left/Right placement is randomized on each load to prevent semiotic positioning bias.', pt: 'A disposição Esquerda/Direita é randomizada a cada carregamento para anular viés semiótico de posicionamento.', es: 'La disposición Izquierda/Derecha se aleatoriza en cada carga para evitar sesgo semiótico.', fr: 'Le placement Gauche/Droite est aléatoire à chaque chargement pour éviter tout biais sémiotique.', ar: 'يتم تعيين المواضع يساراً/يميناً عشوائياً in كل تحميل لمنع التحيز السيميائي.', de: 'Die Links/Rechts-Platzierung wird bei jedem Laden zufällig bestimmt, um semiotische Positionierungsverzerrungen zu verhindern.' },
  }

  function t(key: string): string {
    return labels[key]?.[locale] ?? labels[key]?.['en'] ?? key
  }

  return (
    <div className="compare-layout">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="compare-header">
        <nav className="compare-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{t('back')}</Link>
        </nav>

        <h1 className="compare-election-name">
          <span aria-hidden="true">{election.flag} </span>
          {getLocalised(election.electionName, locale)}
        </h1>

        <p className="compare-meta">
          <span className="t-proof">{t('officialOnly')}</span>
          {' · '}
          <span className="t-proof">{t('updated')}: </span>
          <time className="t-proof" dateTime={election.lastUpdated}>
            {election.lastUpdated.slice(0, 10)}
          </time>
          {' · '}
          <a
            href={election.tribunal.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {election.tribunal.name} ↗
          </a>
        </p>
      </header>

      {/* ── MOBILE TOGGLE ───────────────────────────────────── */}
      <MobileCandToggle candA={candA} candB={candB} />

      {/* ── CANDIDATE HEADERS — GRADE SUÍÇA ─────────────────── */}
      <div className="candidates-bar" role="banner" aria-label="Candidates">
        <CandidateHeader cand={candA} locale={locale} t={t} side="a" />
        <div className="candidate-separator" aria-hidden="true" />
        <CandidateHeader cand={candB} locale={locale} t={t} side="b" />
      </div>

      {/* ── FILTER BAR ──────────────────────────────────────── */}
      <nav className="filter-bar" aria-label="Category filter">
        <Link
          href={`/${locale}/compare/${electionId}`}
          className={`filter-pill${!cat ? ' active' : ''}`}
        >
          {t('all')}
        </Link>
        {allCats.map(c => {
          const cfg = CATEGORY_CONFIG[c]
          const active = cat === c
          return (
            <Link
              key={c}
              href={`/${locale}/compare/${electionId}?category=${c}`}
              className={`filter-pill${active ? ' active' : ''}`}
            >
              <span aria-hidden="true">{cfg.emoji}</span>
              {cfg.label[locale] || cfg.label['en']}
            </Link>
          )
        })}
      </nav>

      {/* ── PROMISE BLOCKS ──────────────────────────────────── */}
      <main>
        {data.map(block => {
          const cfg = CATEGORY_CONFIG[block.category]
          const count = block.rows.filter((r: any) => r.promiseA || r.promiseB).length

          return (
            <section
              key={block.category}
              className="category-block"
              aria-label={cfg.label[locale] || cfg.label['en']}
            >
              {/* Category label row */}
              <div className="category-header">
                <div className="category-header-cell">
                  <div
                    className="category-dot"
                    style={{ background: cfg.color }}
                    aria-hidden="true"
                  />
                  <span className="category-label">
                    <span aria-hidden="true">{cfg.emoji} </span>
                    {cfg.label[locale] || cfg.label['en']}
                  </span>
                  <span className="category-count">{count} {t('entries')}</span>
                </div>
                <div className="candidate-separator" aria-hidden="true" />
                <div className="category-header-cell" aria-hidden="true">
                  <div className="category-dot" style={{ background: cfg.color }} />
                  <span className="category-label">
                    {cfg.emoji} {cfg.label[locale] || cfg.label['en']}
                  </span>
                </div>
              </div>

              {/* Promise rows */}
              {block.rows.map((row: any, i: number) => (
                <div key={i} className="promise-row">
                  <PromiseCell
                    p={row.promiseA}
                    locale={locale}
                    cfg={cfg}
                    t={t}
                    side="a"
                  />
                  <div className="candidate-separator" aria-hidden="true" />
                  <PromiseCell
                    p={row.promiseB}
                    locale={locale}
                    cfg={cfg}
                    t={t}
                    side="b"
                  />
                </div>
              ))}
            </section>
          )
        })}

        {/* Social / Sources bar */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--col-a) var(--col-sep) var(--col-b)',
            background: 'var(--ink-03)',
            borderTop: '2px solid var(--rule)',
          }}
          aria-label="Official sources"
        >
          <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
            <p className="t-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
              {candA.displayName}
            </p>
            <SocialBar sources={candA.sources} t={t} />
          </div>
          <div className="candidate-separator" aria-hidden="true" />
          <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
            <p className="t-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
              {candB.displayName}
            </p>
            <SocialBar sources={candB.sources} t={t} />
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--rule)',
        padding: 'var(--space-5) var(--container-pad)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <p className="t-proof" style={{ fontSize: 'var(--text-3xs)', color: 'var(--ink-30)', letterSpacing: '0.06em' }}>
            World Contrast · {t('footer')}
          </p>
          <a
            href="https://github.com/worldcontrast/promises"
            target="_blank"
            rel="noopener noreferrer"
            className="t-proof"
            style={{ fontSize: 'var(--text-3xs)', color: 'var(--blue-link)', letterSpacing: '0.06em' }}
          >
            GitHub ↗
          </a>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          color: 'var(--ink-20)',
          lineHeight: 1.6,
          maxWidth: '720px',
        }}>
          {t('disclaimer')}
        </p>
      </footer>

    </div>
  )
}

/* ── CANDIDATE HEADER ──────────────────────────────────────── */
function CandidateHeader({
  cand, locale, t, side,
}: {
  cand: any; locale: string; t: (k: string) => string; side: 'a' | 'b'
}) {
  return (
    <div className={`candidate-col cand-${side}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          className="candidate-avatar"
          style={{
            background: cand.color,
            backgroundImage: cand.photoUrl ? `url(${cand.photoUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        >
          {!cand.photoUrl && cand.initials}
        </div>
        <div>
          <p className="candidate-name">{cand.fullName}</p>
          <p className="candidate-party">
            {cand.party}
            {cand.electoralNumber && (
              <span style={{ marginLeft: 'var(--space-2)', opacity: 0.6 }}>
                · No. {cand.electoralNumber}
              </span>
            )}
          </p>
        </div>
      </div>

      {cand.sources?.electoralFiling && (
        <a
          href={cand.sources.electoralFiling}
          target="_blank"
          rel="noopener noreferrer"
          className="social-pill official"
          style={{ alignSelf: 'flex-start' }}
        >
          {t('officialSrc')}
        </a>
      )}
    </div>
  )
}

/* ── PROMISE CELL ──────────────────────────────────────────── */
function PromiseCell({
  p, locale, cfg, t, side,
}: {
  p: any; locale: string; cfg: any; t: (k: string) => string; side: 'a' | 'b'
}) {
  if (!p) {
    return (
      <div
        className={`promise-cell promise-cell--empty cand-${side}`}
        aria-label="No data available"
      >
        <p className="promise-empty">{t('noPromise')}</p>
      </div>
    )
  }

  const getHost = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  return (
    <article className={`promise-cell cand-${side}`}>

      {/* Category tag */}
      <span
        className="promise-category-tag t-machine"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <span aria-hidden="true">{cfg.emoji}</span>
        {cfg.label[locale] || cfg.label['en']}
      </span>

      {/* Promise text — SERIF = FATO */}
      <p className="promise-text">
        {p.text?.[locale] || p.text?.['en'] || ''}
      </p>

      {/* Verbatim quote — SERIF itálico */}
      {p.quote && (
        <blockquote className="promise-quote">
          {p.quote?.[locale] || p.quote?.['en'] || ''}
        </blockquote>
      )}

      {/* Proveniência — MONO = PROVA */}
      <div className="promise-provenance">
        <span className="provenance-source t-proof">
          {getHost(p.sourceUrl || '')}
        </span>

        {p.collectedAt && (
          <>
            <span className="provenance-sep" aria-hidden="true">·</span>
            <time className="provenance-date t-proof" dateTime={p.collectedAt}>
              {p.collectedAt.slice(0, 10)}
            </time>
          </>
        )}

        {p.archiveUrl && (
          <>
            <span className="provenance-sep" aria-hidden="true">·</span>
            <a
              href={p.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="provenance-archive t-proof"
            >
              {t('archive')}
            </a>
          </>
        )}

        {/* Selo de autenticidade — Lacre do Cartório */}
        {p.contentHash && (
          <AuthenticityBadge
            hash={p.contentHash}
            collectedAt={p.collectedAt || ''}
            sourceUrl={p.sourceUrl || ''}
            archiveUrl={p.archiveUrl}
            locale={locale}
          />
        )}
      </div>

    </article>
  )
}

/* ── SOCIAL BAR ────────────────────────────────────────────── */
function SocialBar({ sources, t }: { sources: any; t: (k: string) => string }) {
  const links = [
    sources.officialSite  && { key: 'Site', url: sources.officialSite },
    sources.instagram     && { key: 'IG',   url: sources.instagram },
    sources.twitter       && { key: 'X',    url: sources.twitter },
    sources.facebook      && { key: 'FB',   url: sources.facebook },
    sources.youtube       && { key: 'YT',   url: sources.youtube },
    sources.tiktok        && { key: 'TK',   url: sources.tiktok },
  ].filter(Boolean) as { key: string; url: string }[]

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        alignItems: 'center',
      }}
    >
      {sources.electoralFiling && (
        <a
          href={sources.electoralFiling}
          target="_blank"
          rel="noopener noreferrer"
          className="social-pill official"
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
          className="social-pill"
        >
          {l.key} ↗
        </a>
      ))}
    </div>
  )
}
