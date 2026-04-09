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
  if (!election) notFound()

  const candA = election.candidates[0]
  const candB = election.candidates[1]
  if (!candA || !candB) notFound()

  const data = getComparisonData(election, candA.id, candB.id, cat)
  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]
  const isPt = locale === 'pt'

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '16px 24px' }}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
          <Link href={`/${locale}`} style={{ color: '#6B7280', textDecoration: 'none' }}>
            ← {isPt ? 'Todos os países' : 'All countries'}
          </Link>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
          {election.flag} {getLocalised(election.electionName, locale)}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
          {isPt ? 'Apenas fontes oficiais' : 'Official sources only'} · {isPt ? 'Atualizado' : 'Updated'}: {election.lastUpdated.slice(0, 10)} ·{' '}
          <a href={election.tribunal.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6' }}>
            {election.tribunal.name} ↗
          </a>
        </div>
      </div>

      {/* Candidate headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '16px 20px', borderRight: '1px solid #E5E7EB' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: candA.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {candA.initials}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{candA.fullName}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>{candA.party} · No. {candA.electoralNumber}</div>
          {candA.sources.electoralFiling && (
            <a href={candA.sources.electoralFiling} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#3B82F6', textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>
              {isPt ? 'Fonte oficial ↗' : 'Official source ↗'}
            </a>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRight: '1px solid #E5E7EB' }}>
          <div style={{ width: 26, height: 26, background: '#C8A96E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#0B1D2E' }}>
            VS
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: candB.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {candB.initials}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{candB.fullName}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>{candB.party} · No. {candB.electoralNumber}</div>
          {candB.sources.electoralFiling && (
            <a href={candB.sources.electoralFiling} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#3B82F6', textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>
              {isPt ? 'Fonte oficial ↗' : 'Official source ↗'}
            </a>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: '10px 24px', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 6, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link
          href={`/${locale}/compare/${electionId}`}
          style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${!cat ? '#0B1D2E' : '#E5E7EB'}`, background: !cat ? '#0B1D2E' : '#fff', color: !cat ? '#fff' : '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          {isPt ? 'Todos' : 'All topics'}
        </Link>
        {allCats.map(c => {
          const cfg = CATEGORY_CONFIG[c]
          const active = cat === c
          return (
            <Link
              key={c}
              href={`/${locale}/compare/${electionId}?category=${c}`}
              style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${active ? '#0B1D2E' : '#E5E7EB'}`, background: active ? '#0B1D2E' : '#fff', color: active ? '#fff' : '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              {cfg.emoji} {cfg.label[locale] || cfg.label['en']}
            </Link>
          )
        })}
      </div>

      {/* Promise blocks */}
      {data.map(block => {
        const cfg = CATEGORY_CONFIG[block.category]
        const count = block.rows.filter((r: any) => r.promiseA || r.promiseB).length
        return (
          <div key={block.category} style={{ borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ padding: '8px 24px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {cfg.emoji} {cfg.label[locale] || cfg.label['en']}
              </span>
              <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' }}>{count} items</span>
            </div>
            {block.rows.map((row: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F3F4F6' }}>
                <PromiseCell p={row.promiseA} locale={locale} cfg={cfg} />
                <PromiseCell p={row.promiseB} locale={locale} cfg={cfg} border />
              </div>
            ))}
          </div>
        )
      })}

      {/* Footer */}
      <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB', padding: '12px 24px', fontSize: 10, color: '#9CA3AF', textAlign: 'center' }}>
        World Contrast · Zero bias · All data from official sources ·{' '}
        <a href="https://github.com/worldcontrast/promises" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6' }}>
          GitHub ↗
        </a>
      </div>
    </div>
  )
}

function PromiseCell({
  p, locale, cfg, border,
}: {
  p: any; locale: string; cfg: any; border?: boolean
}) {
  const isPt = locale === 'pt'
  const getHost = (url: string) => {
    try { return new URL(url).hostname } catch { return url }
  }

  return (
    <div style={{ padding: '14px 20px', background: p ? '#fff' : '#F9FAFB', borderLeft: border ? '1px solid #E5E7EB' : undefined, minHeight: 80 }}>
      {!p ? (
        <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
          {isPt ? 'Nenhuma promessa encontrada nas fontes oficiais.' : 'No promise found in official sources.'}
        </p>
      ) : (
        <>
          {/* Category tag */}
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: cfg.bg, color: cfg.color, display: 'inline-block', marginBottom: 8 }}>
            {cfg.label[locale] || cfg.label['en']}
          </span>

          {/* Promise text */}
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.6, marginBottom: p.quote ? 8 : 12 }}>
            {p.text?.[locale] || p.text?.['en'] || ''}
          </p>

          {/* Verbatim quote */}
          {p.quote && (
            <p style={{ fontSize: 11, fontStyle: 'italic', color: '#6B7280', paddingLeft: 10, borderLeft: '2px solid #E5E7EB', marginBottom: 12, lineHeight: 1.55 }}>
              {p.quote?.[locale] || p.quote?.['en'] || ''}
            </p>
          )}

          {/* Provenance row: source · date · archive · [🔒 AUTÊNTICO] */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 9, color: '#9CA3AF' }}>
            <span style={{ fontFamily: 'monospace' }}>{getHost(p.sourceUrl || '')}</span>
            <span>· {(p.collectedAt || '').slice(0, 10)}</span>
            {p.archiveUrl && (
              <a
                href={p.archiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3B82F6' }}
              >
                Archive ↗
              </a>
            )}
            {/* Selo de autenticidade — só aparece se houver hash */}
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
        </>
      )}
    </div>
  )
}
