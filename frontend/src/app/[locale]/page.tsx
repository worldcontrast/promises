import Link from 'next/link'
import { getAllElections } from '@/lib/data'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const elections = await getAllElections()
  const live = elections.find(e => e.status === 'live')
  const isPt = locale === 'pt'

  return (
    <div>
      {/* HERO */}
      <section style={{ background: '#0B1D2E', padding: '56px 24px 64px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 600, color: '#C8A96E',
          background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)',
          padding: '5px 12px', borderRadius: 20, marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8A96E', display: 'inline-block' }} />
          {isPt ? 'Ao vivo — Brasil 2026' : 'Live — Brazil 2026'}
        </div>

        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: -1, marginBottom: 14 }}>
          {isPt
            ? <><span style={{ color: '#C8A96E' }}>O que prometeram</span>?</>
            : <>What did they <span style={{ color: '#C8A96E' }}>promise</span>?</>}
          <br />
          {isPt ? 'Veja lado a lado.' : 'See it side by side.'}
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.6 }}>
          {isPt
            ? 'Escolha um país e um tema. Mostramos exatamente o que cada candidato prometeu — nas páginas oficiais. Sem opiniões. Sem viés.'
            : 'Choose a country and a topic. We show you exactly what each candidate promised — from their own official pages. No opinions. No bias.'}
        </p>

        {live && (
          <Link href={`/compare/${live.id}`} style={{
            display: 'inline-block', background: '#C8A96E', color: '#0B1D2E',
            fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
          }}>
            {isPt ? 'Comparar promessas agora →' : 'Compare promises now →'}
          </Link>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            isPt ? 'Apenas fontes oficiais' : 'Official sources only',
            isPt ? 'Zero viés político' : 'Zero political bias',
            isPt ? 'Grátis para sempre' : 'Free forever',
          ].map(t => (
            <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#C8A96E' }}>✓</span>{t}
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '56px 24px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          {isPt ? 'Como funciona?' : 'How does it work?'}
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36 }}>
          {isPt ? 'Três passos. Sem cadastro.' : 'Three steps. No account needed.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            {
              n: '1',
              t: isPt ? 'Escolha um país' : 'Choose a country',
              d: isPt ? 'Selecione a eleição que quer acompanhar' : 'Select the election you want to follow',
            },
            {
              n: '2',
              t: isPt ? 'Escolha um tema' : 'Pick a topic',
              d: isPt ? 'Saúde, economia, educação — ou veja tudo' : 'Health, economy, education — or see everything',
            },
            {
              n: '3',
              t: isPt ? 'Veja o contraste' : 'See the contrast',
              d: isPt ? 'As palavras exatas de cada candidato, lado a lado' : "Each candidate's exact words, side by side",
            },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '24px 16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0B1D2E', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                {s.n}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COUNTRIES */}
      <section style={{ padding: '0 24px 56px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          {isPt ? 'Países disponíveis' : 'Available countries'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { flag: '🇧🇷', name: 'Brazil', election: 'Presidential · Oct 2026', status: 'live', id: 'brazil-2026' },
            { flag: '🇺🇸', name: 'United States', election: 'Midterm · Nov 2026', status: 'soon', id: null },
            { flag: '🇦🇷', name: 'Argentina', election: 'Legislative · Oct 2026', status: 'soon', id: null },
          ].map(c => (
            <div key={c.name} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: c.status === 'live' ? 1 : 0.6 }}>
              <span style={{ fontSize: 24 }}>{c.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{c.election}</div>
              </div>
              {c.status === 'live' && c.id ? (
                <Link href={`/compare/${c.id}`} style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#DCFCE7', color: '#166534', textDecoration: 'none' }}>
                  ● {isPt ? 'Ao vivo' : 'Live'}
                </Link>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#FEF3C7', color: '#92400E' }}>
                  {isPt ? 'Em breve' : 'Coming soon'}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM */}
      <div style={{ background: '#0B1D2E', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.5 }}>
          {isPt ? 'Nunca aceitamos dinheiro de políticos.' : 'We never accept money from politicians.'}<br />
          {isPt ? 'Nunca editorializamos. Só comparamos.' : 'We never editorialize. We only compare.'}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>
          © 2026 World Contrast · Non-profit · Open-source ·{' '}
          <a href="https://github.com/worldcontrast/promises" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)' }}>
            GitHub ↗
          </a>
        </div>
      </div>
    </div>
  )
}
