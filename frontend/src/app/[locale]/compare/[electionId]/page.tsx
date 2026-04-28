/**
 * World Contrast — Compare Page v12.1 (Sprint 1.5)
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * Mudanças do Sprint 1.5:
 * - force-dynamic → revalidate = 432000 (ISR 5 dias, alinhado ao agente)
 * - Header comprimido em linha única de 48px
 * - PromiseCell: proveniência em 2 linhas (meta | actions)
 * - CopyLinkButton: âncora por promessa para jornalistas
 * - CategoryDistribution: barras individuais por candidato
 * - Tag de categoria removida quando filtro específico está ativo
 * - Disclaimer movido para footer (removido do header)
 * - Alemão corrigido em todos os labels
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection, getComparisonData, getLocalised } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'
import AuthenticityBadge from '@/components/AuthenticityBadge'
import MobileCandToggle from '@/components/MobileCandToggle'
import CopyLinkButton from '@/components/CopyLinkButton'
import CategoryDistribution from '@/components/CategoryDistribution'

// ISR: reconstrói a cada 5 dias — alinhado ao ciclo do agente de coleta
// Dados vêm de JSON local (data/countries/*.json), não de API em tempo real
export const revalidate = 432000

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

  // Promessas de cada candidato para o CategoryDistribution
  const promisesA = election.promises.filter(p => p.candidateId === candA.id)
  const promisesB = election.promises.filter(p => p.candidateId === candB.id)

  const labels: Record<string, Record<string, string>> = {
    back:         { en: '← All countries',  pt: '← Todos os países',  es: '← Todos los países',  fr: '← Tous les pays',  ar: '← جميع البلدان',  de: '← Alle Länder',  zh: '← 所有国家',  ja: '← すべての国',  hi: '← सभी देश',  ru: '← Все страны' },
    officialOnly: { en: 'Official sources',  pt: 'Fontes oficiais',    es: 'Fuentes oficiales',   fr: 'Sources officielles', ar: 'مصادر رسمية',    de: 'Offizielle Quellen', zh: '官方来源', ja: '公式情報源', hi: 'आधिकारिक स्रोत', ru: 'Официальные источники' },
    updated:      { en: 'Updated',           pt: 'Atualizado',         es: 'Actualizado',         fr: 'Mis à jour',       ar: 'محدّث',          de: 'Aktualisiert',  zh: '已更新',   ja: '更新済み',    hi: 'अपडेट किया',  ru: 'Обновлено' },
    all:          { en: 'All',               pt: 'Todos',              es: 'Todos',               fr: 'Tous',             ar: 'الكل',           de: 'Alle',          zh: '全部',     ja: 'すべて',      hi: 'सभी',        ru: 'Все' },
    officialSrc:  { en: 'Official filing ↗', pt: 'Ficha oficial ↗',    es: 'Ficha oficial ↗',     fr: 'Dossier officiel ↗', ar: 'الملف الرسمي ↗', de: 'Offizielle Akte ↗', zh: '官方备案 ↗', ja: '公式登録 ↗', hi: 'आधिकारिक फाइल ↗', ru: 'Офиц. документ ↗' },
    noPromise:    {
      en: 'No verifiable commitment recorded in official sources.',
      pt: 'Nenhum compromisso verificável registrado nas fontes oficiais.',
      es: 'Ningún compromiso verificable registrado en fuentes oficiales.',
      fr: 'Aucun engagement vérifiable enregistré dans les sources officielles.',
      ar: 'لم يُسجَّل أي التزام قابل للتحقق في المصادر الرسمية.',
      de: 'Kein überprüfbares Versprechen in offiziellen Quellen erfasst.',
      zh: '官方来源中未记录任何可核实的承诺。',
      ja: '公式情報源に検証可能な公約が記録されていません。',
      hi: 'आधिकारिक स्रोतों में कोई सत्यापन योग्य प्रतिबद्धता दर्ज नहीं।',
      ru: 'В официальных источниках не зафиксировано проверяемых обязательств.',
    },
    archive:      { en: 'Archive ↗', pt: 'Arquivo ↗', es: 'Archivo ↗', fr: 'Archive ↗', ar: 'أرشيف ↗', de: 'Archiv ↗', zh: '存档 ↗', ja: 'アーカイブ ↗', hi: 'संग्रह ↗', ru: 'Архив ↗' },
    entries:      { en: 'entries',   pt: 'registros', es: 'registros', fr: 'entrées',   ar: 'سجلات',   de: 'Einträge',  zh: '条记录', ja: '件',        hi: 'प्रविष्टियां', ru: 'записей' },
    footer:       { en: 'Zero bias · Official sources only', pt: 'Zero viés · Apenas fontes oficiais', es: 'Cero sesgo · Solo fuentes oficiales', fr: 'Zéro biais · Sources officielles uniquement', ar: 'صفر تحيز · المصادر الرسمية فقط', de: 'Null Voreingenommenheit · Nur offizielle Quellen', zh: '零偏见 · 仅限官方来源', ja: 'ゼロバイアス · 公式情報源のみ', hi: 'शून्य पक्षपात · केवल आधिकारिक स्रोत', ru: 'Без предвзятости · Только офиц. источники' },
    disclaimer:   { en: 'Left/Right placement randomized on each load to prevent semiotic positioning bias.', pt: 'A disposição Esquerda/Direita é randomizada a cada carregamento para anular viés semiótico de posicionamento.', es: 'La disposición Izquierda/Derecha se aleatoriza en cada carga para evitar sesgo semiótico.', fr: 'Le placement Gauche/Droite est aléatoire à chaque chargement pour éviter tout biais sémiotique.', ar: 'يتم تعيين المواضع عشوائياً في كل تحميل لمنع التحيز السيميائي.', de: 'Links/Rechts-Platzierung wird zufällig bestimmt, um semiotische Verzerrungen zu verhindern.', zh: '左右位置在每次加载时随机分配，以防止语义定位偏见。', ja: '左右の配置は読み込みごとにランダム化され、記号的位置バイアスを防ぎます。', hi: 'बायें/दायें स्थान यादृच्छिक रूप से निर्धारित किया जाता है।', ru: 'Расположение Лево/Право рандомизируется при каждой загрузке.' },
    randomNote:   { en: 'Randomized', pt: 'Randomizado', es: 'Aleatorizado', fr: 'Aléatoire', ar: 'عشوائي', de: 'Zufällig', zh: '随机', ja: 'ランダム', hi: 'यादृच्छिक', ru: 'Случайно' },
  }

  function t(key: string): string {
    return labels[key]?.[locale] ?? labels[key]?.['en'] ?? key
  }

  return (
    <div className="compare-layout">

      {/* ── HEADER COMPRIMIDO — cabe em 48px ────────────────── */}
      <header className="compare-header" style={{ padding: '0 var(--container-pad)' }}>
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}>
          <Link
            href={`/${locale}`}
            className="t-proof"
            style={{ fontSize: 'var(--text-3xs)', color: 'var(--ink-40)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
          >
            {t('back')}
          </Link>

          <span style={{ color: 'var(--rule)', fontSize: 12 }} aria-hidden="true">│</span>

          <span
            className="t-proof"
            style={{ fontSize: 'var(--text-3xs)', color: 'var(--ink-60)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
          >
            <span aria-hidden="true">{election.flag} </span>
            {getLocalised(election.electionName, locale)}
          </span>

          <span style={{ color: 'var(--rule)', fontSize: 12 }} aria-hidden="true">│</span>

          <a
            href={election.tribunal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="t-proof"
            style={{ fontSize: 'var(--text-3xs)', color: 'var(--blue-link)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
          >
            {election.tribunal.name} ↗
          </a>

          <span style={{ color: 'var(--rule)', fontSize: 12 }} aria-hidden="true">│</span>

          <time
            className="t-proof"
            dateTime={election.lastUpdated}
            style={{ fontSize: 'var(--text-3xs)', color: 'var(--ink-30)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
          >
            {t('updated')}: {election.lastUpdated.slice(0, 10)}
          </time>

          <span
            className="t-proof"
            style={{ fontSize: 'var(--text-3xs)', color: 'var(--ink-20)', letterSpacing: '0.04em', marginLeft: 'auto', whiteSpace: 'nowrap' }}
            title={t('disclaimer')}
          >
            ⇄ {t('randomNote')}
          </span>
        </div>
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
              {/* Category header row */}
              <div className="category-header">
                <div className="category-header-cell">
                  <div className="category-dot" style={{ background: cfg.color }} aria-hidden="true" />
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

              {/* Promise rows — cada um tem id único para ancoragem */}
              {block.rows.map((row: any, i: number) => {
                const promiseId = `promise-${block.category}-${i}`
                return (
                  <div
                    key={i}
                    id={promiseId}
                    className="promise-row"
                  >
                    <PromiseCell
                      p={row.promiseA}
                      locale={locale}
                      cfg={cfg}
                      t={t}
                      side="a"
                      showCategoryTag={!cat}
                      promiseId={`${promiseId}-a`}
                      lastUpdated={election.lastUpdated}
                    />
                    <div className="candidate-separator" aria-hidden="true" />
                    <PromiseCell
                      p={row.promiseB}
                      locale={locale}
                      cfg={cfg}
                      t={t}
                      side="b"
                      showCategoryTag={!cat}
                      promiseId={`${promiseId}-b`}
                      lastUpdated={election.lastUpdated}
                    />
                  </div>
                )
              })}
            </section>
          )
        })}

        {/* Sources + Distribution section */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--col-a) var(--col-sep) var(--col-b)',
            background: 'var(--ink-03)',
            borderTop: '2px solid var(--rule)',
          }}
          aria-label="Official sources and promise distribution"
        >
          <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
            <p className="t-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
              {candA.displayName}
            </p>
            {/* Distribuição por categoria — APENAS deste candidato */}
            <CategoryDistribution promises={promisesA} locale={locale} />
            <SocialBar sources={candA.sources} t={t} />
          </div>
          <div className="candidate-separator" aria-hidden="true" />
          <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
            <p className="t-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
              {candB.displayName}
            </p>
            {/* Distribuição por categoria — APENAS deste candidato */}
            <CategoryDistribution promises={promisesB} locale={locale} />
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
        {/* Disclaimer de randomização — apenas no footer */}
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
  p, locale, cfg, t, side, showCategoryTag, promiseId, lastUpdated,
}: {
  p: any
  locale: string
  cfg: any
  t: (k: string) => string
  side: 'a' | 'b'
  showCategoryTag: boolean
  promiseId: string
  lastUpdated: string
}) {
  // Célula vazia — mesmo peso visual que célula com dado
  if (!p) {
    return (
      <div
        className={`promise-cell promise-cell--empty cand-${side}`}
        aria-label="No data available"
      >
        <p className="promise-empty-statement">
          {t('noPromise')}
        </p>
        <div className="promise-provenance">
          <div className="promise-provenance-meta">
            <span className="provenance-date t-proof">
              {lastUpdated.slice(0, 10)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const getHost = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  return (
    <article className={`promise-cell cand-${side}`} id={promiseId}>

      {/* Tag de categoria — só aparece quando filtro "Todos" está ativo */}
      {showCategoryTag && (
        <span
          className="promise-category-tag t-machine"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <span aria-hidden="true">{cfg.emoji}</span>
          {cfg.label[locale] || cfg.label['en']}
        </span>
      )}

      {/* Texto da promessa — SERIF = FATO */}
      <p className="promise-text">
        {p.text?.[locale] || p.text?.['en'] || ''}
      </p>

      {/* Citação verbatim — SERIF itálico */}
      {p.quote && (
        <blockquote className="promise-quote">
          {p.quote?.[locale] || p.quote?.['en'] || ''}
        </blockquote>
      )}

      {/* Proveniência em 2 linhas: meta | actions */}
      <div className="promise-provenance">

        {/* Linha 1: fonte · data */}
        <div className="promise-provenance-meta">
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
        </div>

        {/* Linha 2: arquivo · badge · copy link */}
        <div className="promise-provenance-actions">
          {p.archiveUrl && (
            <a
              href={p.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="provenance-archive t-proof"
            >
              {t('archive')}
            </a>
          )}
          {p.contentHash && (
            <AuthenticityBadge
              hash={p.contentHash}
              collectedAt={p.collectedAt || ''}
              sourceUrl={p.sourceUrl || ''}
              archiveUrl={p.archiveUrl}
              locale={locale}
            />
          )}
          <CopyLinkButton promiseId={promiseId} locale={locale} />
        </div>

      </div>
    </article>
  )
}

/* ── SOCIAL BAR ────────────────────────────────────────────── */
function SocialBar({ sources, t }: { sources: any; t: (k: string) => string }) {
  const links = [
    sources.officialSite && { key: 'Site', url: sources.officialSite },
    sources.instagram    && { key: 'IG',   url: sources.instagram },
    sources.twitter      && { key: 'X',    url: sources.twitter },
    sources.facebook     && { key: 'FB',   url: sources.facebook },
    sources.youtube      && { key: 'YT',   url: sources.youtube },
    sources.tiktok       && { key: 'TK',   url: sources.tiktok },
  ].filter(Boolean) as { key: string; url: string }[]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-4)' }}>
      {sources.electoralFiling && (
        <a href={sources.electoralFiling} target="_blank" rel="noopener noreferrer" className="social-pill official">
          {t('officialSrc')}
        </a>
      )}
      {links.map(l => (
        <a key={l.key} href={l.url} target="_blank" rel="noopener noreferrer" className="social-pill">
          {l.key} ↗
        </a>
      ))}
    </div>
  )
}
