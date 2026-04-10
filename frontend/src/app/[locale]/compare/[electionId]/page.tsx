/**
 * World Contrast — Compare Page
 * File: frontend/src/app/[locale]/compare/[electionId]/page.tsx
 *
 * GRID SUÍÇO LADO-A-LADO:
 * ─────────────────────────────────────────────────────────
 * Princípio cardinal: nenhum candidato tem mais espaço, mais peso
 * tipográfico ou mais destaque visual que o outro. Nunca.
 *
 * Estrutura da grade:
 *   [  Candidato A  ] [1px] [  Candidato B  ]
 *   ─────── 1fr ──── ─────── ─────── 1fr ────
 *
 * O separador central (1px) NÃO é uma coluna — é uma regra.
 * "40px" original foi eliminado: ele criava assimetria óptica.
 *
 * Hierarquia tipográfica:
 *   - Promessa principal   → serif  (Playfair, FATO)
 *   - Citação verbatim     → serif itálico (FATO em estado bruto)
 *   - Rótulos de categoria → sans   (MÁQUINA)
 *   - Hash / URL / data    → mono   (PROVA CRIPTOGRÁFICA)
 * ─────────────────────────────────────────────────────────
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getElection, getComparisonData, getLocalised } from '@/lib/data'
import type { Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { setRequestLocale } from 'next-intl/server'
import AuthenticityBadge from '@/components/AuthenticityBadge'
import MobileCandToggle from './MobileCandToggle'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string; electionId: string }>
  searchParams: Promise<{ category?: string }>
}

export async function generateStaticParams() {
  return []
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  const { category } = await searchParams
  const cat = category as Category | undefined

  const election = await getElection(electionId)
  if (!election || election.candidates.length < 2) notFound()

  // Destroy Semiotic Bias (Left/Right) via Randomization
  const randomizedCandidates = [...election.candidates]
  if (Math.random() > 0.5) randomizedCandidates.reverse()
  const [candA, candB] = randomizedCandidates

  const data = getComparisonData(election, candA.id, candB.id, cat)
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]

  const labels = {
    back:         { en: '← All countries',       pt: '← Todos os países',   es: '← Todos los países',  zh: '← 所有国家',       ru: '← Все страны',    hi: '← सभी देश' },
    officialOnly: { en: 'Official sources only',  pt: 'Apenas fontes oficiais', es: 'Solo fuentes oficiales', zh: '仅限官方来源',      ru: 'Только офиц. источники', hi: 'केवल आधिकारिक स्रोत' },
    updated:      { en: 'Updated',                pt: 'Atualizado',          es: 'Actualizado',         zh: '已更新',          ru: 'Обновлено',       hi: 'अपडेट किया गया' },
    all:          { en: 'All topics',             pt: 'Todos',               es: 'Todos',               zh: '所有主题',         ru: 'Все темы',        hi: 'सभी विषय' },
    officialSrc:  { en: 'Official filing ↗',      pt: 'Ficha oficial ↗',     es: 'Ficha oficial ↗',     zh: '官方备案 ↗',        ru: 'Офиц. документ ↗', hi: 'आधिकारिक फाइलिंग ↗' },
    noPromise:    { en: 'No promise found in official sources.', pt: 'Nenhuma promessa encontrada nas fontes oficiais.', es: 'Ninguna promesa encontrada en fuentes oficiales.', zh: '在官方来源中未找到相关承诺。', ru: 'Обещаний в офиц. источниках не найдено.', hi: 'आधिकारिक स्रोतों में कोई वादा नहीं मिला।' },
    archive:      { en: 'Archive ↗',              pt: 'Arquivo ↗',           es: 'Archivo ↗',           zh: '存档 ↗',           ru: 'Архив ↗',         hi: 'संग्रह ↗' },
    items:        { en: 'entries',                pt: 'registros',           es: 'registros',           zh: '条记录',           ru: 'записей',         hi: 'प्रविष्टियां' },
    footer:       { en: 'Zero bias · All data from official sources', pt: 'Zero viés · Todos os dados de fontes oficiais', es: 'Cero sesgo · Todos los datos de fuentes oficiales', zh: '零偏见 · 所有数据均来自官方来源', ru: 'Без предвзятости · Все данные из офиц. источников', hi: 'शून्य पक्षपात · सभी डेटा आधिकारिक स्रोतों से' },
    disclaimer:   { 
      en: 'The placement of candidates is randomized on each load to prevent semiotic positioning bias (Left/Right).', 
      pt: 'A disposição (Esquerda/Direita) é randomizada na renderização para anular predeterminação ou viés semiótico.', 
      es: 'La disposición de los candidatos (I/D) se aleatoriza en cada carga para evitar sesgos de posicionamiento semiótico.',
      zh: '候选人的位置在每次加载时都是随机的，以防止符号定位偏见（左/右）。',
      ru: 'Размещение кандидатов рандомизируется при каждой загрузке во избежание семиотического искажения (Лево/Право).',
      hi: 'पक्षपात (बाएं/दाएं) को रोकने के लिए उम्मीदवारों का स्थान यादृच्छिक रूप से चुना जाता है।' 
    },
  } as Record<string, Record<string, string>>

  function t(key: string): string {
    return labels[key]?.[locale] ?? labels[key]?.['en'] ?? key
  }

  return (
    <>
      <style>{`
        .social-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 20px;
          padding: 0 8px;
          border-radius: 2px;
          background: var(--ink-06);
          color: var(--ink-60);
          font-family: var(--font-mono);
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid var(--rule-light);
          flex-shrink: 0;
        }
        
        /* Hide scrollbar but allow scroll */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .filter-pill {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid var(--rule);
          background: var(--paper);
          color: var(--ink-60);
          text-decoration: none;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-pill.active {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }
        
        .filter-bar {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 8px;
          padding: 12px var(--container-pad);
          background: var(--paper);
          border-bottom: 1px solid var(--rule);
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
        }
        .filter-bar::-webkit-scrollbar { display: none; } /* Chrome/Safari */
        
        .candidate-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid var(--rule);
          overflow: hidden;
          background-position: center;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .compare-header { padding: 16px var(--container-pad) 0 !important; }
          .compare-election-name { font-size: 1.2rem !important; margin-bottom: 4px !important; }
          .compare-meta { font-size: 10px !important; }
          .compare-meta.disclaimer { display: none; } /* Mover para o rodapé */
          
          .candidates-bar { display: none !important; } /* Ocultar no mobile — as Tabs já identificam */
          
          .filter-bar { padding: 8px; }
        }
      `}</style>
      <div className="compare-layout">

      {/* ── HEADER: Election info ─────────────────────────────── */}
      <header className="compare-header">
        <div className="compare-breadcrumb">
          <Link href={`/${locale}`}>{t('back')}</Link>
        </div>
        <h1 className="compare-election-name">
          {election.flag} {getLocalised(election.electionName, locale)}
        </h1>
        <p className="compare-meta">
          {t('officialOnly')} · {t('updated')}: <time dateTime={election.lastUpdated}>{election.lastUpdated.slice(0, 10)}</time>
          {' · '}
          <a href={election.tribunal.url} target="_blank" rel="noopener noreferrer">
            {election.tribunal.name} ↗
          </a>
        </p>
        <p className="compare-meta disclaimer" style={{ marginTop: '8px', color: 'var(--ink-60)', fontWeight: 500 }}>
          {t('disclaimer')}
        </p>
      </header>

      {/* ── MOBILE NAV TABS ────────────────────── */}
      <MobileCandToggle candA={candA} candB={candB} />

      {/* ── CANDIDATE HEADERS — GRID SUÍÇO ───────────────────── */}
      {/*
        * NEUTRALIDADE ABSOLUTA:
        * Ambas as colunas são 1fr. O separador é 1px (rule, não coluna).
        * A disposição L/R é randomizada para destruir viés cognitivo.
      */}
      <div className="candidates-bar" role="region" aria-label="Candidates">

        {/* Candidato A */}
        <div className="candidate-col" id="candidate-col-a" style={{ padding: '0', background: 'var(--paper)' }}>
          <div style={{ padding: '24px 32px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="candidate-avatar" style={{ 
              background: candA.photoUrl ? `url(${candA.photoUrl})` : candA.color,
              backgroundSize: 'cover'
            }}>
              {!candA.photoUrl && candA.initials}
            </div>
            <div>
              <p className="candidate-name" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{candA.fullName}</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-40)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {candA.party} · No. {candA.electoralNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="candidate-separator" aria-hidden="true" />

        {/* Candidato B */}
        <div className="candidate-col" id="candidate-col-b" style={{ padding: '0', background: 'var(--paper)' }}>
          <div style={{ padding: '24px 32px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="candidate-avatar" style={{ 
              background: candB.photoUrl ? `url(${candB.photoUrl})` : candB.color,
              backgroundSize: 'cover'
            }}>
              {!candB.photoUrl && candB.initials}
            </div>
            <div>
              <p className="candidate-name" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{candB.fullName}</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-40)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {candB.party} · No. {candB.electoralNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ───────────────────────────────────────── */}
      <div className="filter-bar" role="navigation" aria-label="Category filter">
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
              {cfg.emoji} {cfg.label[locale] || cfg.label['en']}
            </Link>
          )
        })}
      </div>

      {/* ── PROMISE BLOCKS — GRID SUÍÇO ──────────────────────── */}
      <main role="main" id="compare-main">
        {data.map(block => {
          const cfg = CATEGORY_CONFIG[block.category]
          const count = block.rows.filter((r: any) => r.promiseA || r.promiseB).length

          return (
            <section
              key={block.category}
              aria-label={cfg.label[locale] || cfg.label['en']}
              style={{ borderBottom: '1px solid var(--rule)' }}
            >
              {/* Category header — spans full width */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-8)',
                background: 'rgba(11, 29, 46, 0.03)',
                borderBottom: '1px solid var(--rule)',
              }}>
                <div
                  className="category-dot"
                  style={{ background: cfg.color }}
                  aria-hidden="true"
                />
                <span className="category-label">
                  {cfg.emoji} {cfg.label[locale] || cfg.label['en']}
                </span>
                <span className="category-count">
                  {count} {t('items')}
                </span>
              </div>

              {/* Promise rows */}
              {block.rows.map((row: any, i: number) => (
                <div key={i} className="promise-row">
                  <PromiseCell p={row.promiseA} locale={locale} cfg={cfg} t={t} side="a" />
                  <div className="candidate-separator" aria-hidden="true" />
                  <PromiseCell p={row.promiseB} locale={locale} cfg={cfg} t={t} side="b" />
                </div>
              ))}
            </section>
          )
        })}
        <section style={{ 
          display: 'flex', 
          background: 'var(--paper)',
          borderTop: '2px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
          marginTop: '40px'
        }}>
          <div style={{ flex: 1, padding: '24px var(--space-8)' }}>
            <p className="t-eyebrow" style={{ marginBottom: '12px' }}>{candA.displayName}</p>
            <SocialBar sources={candA.sources} t={t} />
          </div>
          <div className="candidate-separator" aria-hidden="true" />
          <div style={{ flex: 1, padding: '24px var(--space-8)' }}>
            <p className="t-eyebrow" style={{ marginBottom: '12px' }}>{candB.displayName}</p>
            <SocialBar sources={candB.sources} t={t} />
          </div>
        </section>
      </main>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid var(--rule)',
          padding: 'var(--space-5) var(--container-pad)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-3xs)',
            color: 'var(--ink-50)',
            letterSpacing: '0.06em',
          }}>
            World Contrast · {t('footer')}
          </p>
          <p style={{ 
            fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--ink-40)', 
            marginTop: '12px', maxWidth: '600px', marginInline: 'auto' 
          }}>
            {t('disclaimer')}
          </p>
          <a
            href="https://github.com/worldcontrast/promises"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-3xs)',
              color: 'var(--blue-link)',
              letterSpacing: '0.06em',
            }}
          >
            GitHub ↗
          </a>
        </footer>
      </div>
    </>
  )
}

/* ── SOCIAL BAR COMPONENT ──────────────────────────────────── */
function SocialBar({ sources, t, party }: { sources: any; t: (k: string) => string; party?: string }) {
  const links = []
  if (sources.officialSite) links.push({ key: 'Site', url: sources.officialSite })
  if (sources.instagram) links.push({ key: 'Ig', url: sources.instagram })
  if (sources.twitter) links.push({ key: 'X', url: sources.twitter })
  if (sources.facebook) links.push({ key: 'Fb', url: sources.facebook })
  if (sources.youtube) links.push({ key: 'Yt', url: sources.youtube })
  if (sources.tiktok) links.push({ key: 'Tk', url: sources.tiktok })

  return (
    <div className="candidate-social-bar hide-scrollbar" style={{ 
      display: 'flex', 
      flexWrap: 'nowrap', 
      gap: '8px', 
      alignItems: 'center',
      overflowX: 'auto'
    }}>
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
      {party && (
        <span style={{ 
          fontFamily: 'var(--font-sans)', 
          fontSize: '11px', 
          fontWeight: 500,
          color: 'var(--ink-30)',
          marginLeft: 'auto',
          textTransform: 'uppercase',
          paddingLeft: '12px',
          whiteSpace: 'nowrap'
        }}>
          {party}
        </span>
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
  const getHost = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  if (!p) {
    return (
      <div className={`promise-cell promise-cell--empty cand-${side}`} aria-label="No data">
        <p className="promise-empty">{t('noPromise')}</p>
      </div>
    )
  }

  return (
    <article className={`promise-cell cand-${side}`}>

      {/* Promise text — SERIF = FATO */}
      <p className="promise-text">
        {p.text?.[locale] || p.text?.['en'] || ''}
      </p>

      {/* Verbatim quote — SERIF itálico = FATO em estado bruto */}
      {p.quote && (
        <blockquote className="promise-quote">
          {p.quote?.[locale] || p.quote?.['en'] || ''}
        </blockquote>
      )}

      {/* Certificate Box — PROVA TÉCNICA E BLINDADA */}
      <div className="promise-cert-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="provenance-source t-proof" style={{ color: 'var(--ink-70)', fontWeight: 600, fontSize: '9px' }}>
              {getHost(p.sourceUrl || '')}
            </span>
            {p.collectedAt && (
              <>
                <span style={{ color: 'var(--ink-20)', fontSize: 10 }}>·</span>
                <time className="provenance-date t-proof" dateTime={p.collectedAt} style={{ color: 'var(--ink-60)', fontSize: '9px' }}>
                  {p.collectedAt.slice(0, 10)}
                </time>
              </>
            )}
          </div>
          
          {p.archiveUrl && (
            <a href={p.archiveUrl} target="_blank" rel="noopener noreferrer" className="provenance-archive t-proof" style={{ fontSize: '9px' }}>
              {t('archive')}
            </a>
          )}
        </div>

        {/* O Selo Digital Injetado aqui */}
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
