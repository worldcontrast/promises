/**
 * World Contrast — Enterprise Landing Page
 * File: frontend/src/app/[locale]/enterprise/page.tsx
 *
 * Target: News Agencies · Sovereign Risk Funds · Academic Institutions
 * Tone: Institutional. Technical authority. Zero marketing rhetoric.
 * CLI-First: Every feature shown maps to a CLI command and REST endpoint.
 */

import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function EnterprisePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const tiers = [
    {
      id: 'PUBLIC',
      name: 'Public',
      target: { pt: 'Cidadãos · Jornalistas · Pesquisadores', en: 'Citizens · Journalists · Researchers' },
      cost: { pt: 'Gratuito', en: 'Free' },
      features: [
        { pt: 'Acesso ao frontend web', en: 'Web frontend access' },
        { pt: 'Database dumps CC BY 4.0', en: 'CC BY 4.0 database dumps' },
        { pt: '100 req/dia via API REST', en: '100 req/day via REST API' },
        { pt: 'SHA-256 verification pública', en: 'Public SHA-256 verification' },
      ],
      cli: 'wc data dump --format json --output ./promises.json',
      highlight: false,
    },
    {
      id: 'INSTITUTIONAL',
      name: 'Institutional',
      target: { pt: 'Universidades · ONGs · Redações', en: 'Universities · NGOs · Newsrooms' },
      cost: { pt: 'Gratuito via aplicação', en: 'Free via application' },
      features: [
        { pt: 'Tudo do tier Public', en: 'Everything in Public tier' },
        { pt: '10.000 req/dia', en: '10,000 req/day' },
        { pt: 'Acesso a rejection logs', en: 'Rejection logs access' },
        { pt: 'Webhooks básicos (1 endpoint)', en: 'Basic webhooks (1 endpoint)' },
        { pt: 'SLA de resposta 48h', en: '48h response SLA' },
      ],
      cli: 'wc api keys create --tier institutional --org "Universidade X"',
      highlight: false,
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      target: { pt: 'Agências de Notícias · Fundos Soberanos · Analistas de Risco', en: 'News Agencies · Sovereign Funds · Risk Analysts' },
      cost: { pt: 'Contrato B2B', en: 'B2B Contract' },
      features: [
        { pt: 'Tudo do tier Institutional', en: 'Everything in Institutional tier' },
        { pt: 'Req. ilimitadas via Live API', en: 'Unlimited via Live API' },
        { pt: 'Webhooks em tempo real (N endpoints)', en: 'Real-time webhooks (N endpoints)' },
        { pt: 'Latência < 100ms garantida', en: 'Guaranteed < 100ms latency' },
        { pt: 'Dashboard privado', en: 'Private dashboard' },
        { pt: 'Alertas em milissegundos após discurso', en: 'Millisecond alerts post-speech' },
        { pt: 'POCVA-01 audit trail exportável', en: 'Exportable POCVA-01 audit trail' },
        { pt: 'SLA 99.9% uptime', en: '99.9% uptime SLA' },
        { pt: 'Suporte dedicado 24h', en: 'Dedicated 24h support' },
      ],
      cli: 'wc api keys create --tier enterprise --org "Reuters" --webhooks unlimited',
      highlight: true,
    },
  ]

  const endpoints = [
    { method: 'GET',  path: '/v1/promises',           desc: { pt: 'Lista todas as promessas com paginação', en: 'List all promises with pagination' }, tier: 'PUBLIC' },
    { method: 'GET',  path: '/v1/promises/live',       desc: { pt: 'Stream em tempo real de novas promessas', en: 'Real-time stream of new promises' }, tier: 'ENTERPRISE' },
    { method: 'GET',  path: '/v1/elections/{id}',      desc: { pt: 'Detalhes de uma eleição específica', en: 'Details of a specific election' }, tier: 'PUBLIC' },
    { method: 'GET',  path: '/v1/audit/verify/{hash}', desc: { pt: 'Verifica integridade SHA-256 de um registro', en: 'Verify SHA-256 integrity of a record' }, tier: 'PUBLIC' },
    { method: 'GET',  path: '/v1/rejections',          desc: { pt: 'Log público de rejeições POCVA-01', en: 'Public POCVA-01 rejection log' }, tier: 'INSTITUTIONAL' },
    { method: 'POST', path: '/v1/webhooks',            desc: { pt: 'Registra endpoint para receber eventos', en: 'Register endpoint for event delivery' }, tier: 'ENTERPRISE' },
    { method: 'GET',  path: '/v1/webhooks/{id}/logs',  desc: { pt: 'Histórico de entregas de um webhook', en: 'Delivery history of a webhook' }, tier: 'ENTERPRISE' },
    { method: 'GET',  path: '/v1/countries',           desc: { pt: 'Lista países e eleições monitorados', en: 'List monitored countries and elections' }, tier: 'PUBLIC' },
  ]

  const cliCommands = [
    { cmd: 'wc status',                                              desc: { pt: 'Status do sistema em tempo real', en: 'Real-time system status' } },
    { cmd: 'wc data dump --country BR --year 2026',                  desc: { pt: 'Exporta base completa BR 2026', en: 'Export complete BR 2026 database' } },
    { cmd: 'wc verify --hash 3a8c9e01...',                           desc: { pt: 'Verifica integridade SHA-256', en: 'Verify SHA-256 integrity' } },
    { cmd: 'wc promises list --election brazil-2026 --cat economy',  desc: { pt: 'Filtra promessas por categoria', en: 'Filter promises by category' } },
    { cmd: 'wc api keys create --tier enterprise',                   desc: { pt: 'Cria API key Enterprise', en: 'Create Enterprise API key' } },
    { cmd: 'wc webhooks create --url https://api.reuters.com/hook',  desc: { pt: 'Registra webhook em tempo real', en: 'Register real-time webhook' } },
    { cmd: 'wc audit export --from 2026-01-01 --format jsonl',       desc: { pt: 'Exporta audit trail completo', en: 'Export complete audit trail' } },
    { cmd: 'wc agent run --country AR --dry-run',                    desc: { pt: 'Executa agente em modo simulação', en: 'Run agent in dry-run mode' } },
  ]

  const L = (obj: any) => obj[locale] ?? obj['en']

  return (
    <>
      <style>{`
        :root {
          --onyx:      #0A0A0B;
          --onyx-2:    #111113;
          --onyx-3:    #18181B;
          --onyx-4:    #27272A;
          --onyx-5:    #3F3F46;
          --platinum:  #E4E4E7;
          --plat-dim:  #A1A1AA;
          --plat-low:  #52525B;
          --gold:      #C8A96E;
          --gold-dim:  rgba(200,169,110,0.15);
          --gold-bdr:  rgba(200,169,110,0.25);
          --emerald:   #10B981;
          --em-dim:    rgba(16,185,129,0.12);
          --rule:      rgba(255,255,255,0.06);
          --px:        clamp(20px, 5vw, 72px);
          --font-d:    'IBM Plex Sans', system-ui, sans-serif;
          --font-m:    'IBM Plex Mono', monospace;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ent-root {
          font-family: var(--font-d);
          background: var(--onyx);
          color: var(--platinum);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* HEADER */
        .ent-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,11,0.94);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--rule);
          display: flex; align-items: center;
          padding: 0 var(--px); height: 52px; gap: 16px;
        }
        .ent-back {
          font-family: var(--font-m); font-size: 9px;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--plat-dim); text-decoration: none;
          transition: color 0.2s;
        }
        .ent-back:hover { color: var(--platinum); }
        .ent-sep { color: var(--plat-low); font-size: 12px; }
        .ent-page-title {
          font-family: var(--font-m); font-size: 10px;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--gold);
        }
        .ent-spacer { flex: 1; }
        .ent-cta-nav {
          font-family: var(--font-m); font-size: 9px;
          letter-spacing: 1.5px; text-transform: uppercase;
          background: var(--gold); color: var(--onyx);
          border: none; padding: 8px 16px; cursor: pointer;
          border-radius: 2px; text-decoration: none;
          min-height: 36px; display: inline-flex;
          align-items: center;
        }

        /* HERO */
        .ent-hero {
          padding: clamp(80px,12vw,160px) var(--px) clamp(56px,8vw,96px);
          border-bottom: 1px solid var(--rule);
          position: relative; overflow: hidden;
        }
        .ent-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .ent-hero::after {
          content: '';
          position: absolute; bottom: -100px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .ent-eyebrow {
          font-family: var(--font-m); font-size: 9px;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--emerald); margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .ent-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--emerald);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .ent-h1 {
          font-family: var(--font-d);
          font-size: clamp(36px, 6vw, 80px);
          font-weight: 800; color: var(--platinum);
          line-height: 0.95; letter-spacing: -2px;
          margin-bottom: 8px;
        }
        .ent-h1-b {
          font-size: clamp(36px, 6vw, 80px);
          font-weight: 200; color: var(--plat-dim);
          line-height: 0.95; letter-spacing: -2px;
          font-family: var(--font-d);
        }
        .ent-lead {
          font-size: clamp(14px,1.8vw,18px); font-weight: 300;
          color: var(--plat-dim); line-height: 1.75;
          max-width: 600px; margin-top: 28px; margin-bottom: 36px;
        }
        .ent-btn {
          font-family: var(--font-m); font-size: 10px;
          font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase;
          background: var(--gold); color: var(--onyx);
          border: none; padding: 16px 28px; cursor: pointer;
          border-radius: 2px; min-height: 52px; display: inline-block;
          text-decoration: none; transition: opacity 0.2s;
        }
        .ent-btn:hover { opacity: 0.85; }

        /* SECTIONS */
        .ent-section {
          padding: clamp(56px,8vw,96px) var(--px);
          border-top: 1px solid var(--rule);
        }
        .ent-section.bg-2 { background: var(--onyx-2); }
        .ent-section.bg-3 { background: var(--onyx-3); }
        .ent-label {
          font-family: var(--font-m); font-size: 9px;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--gold); margin-bottom: 8px;
        }
        .ent-h2 {
          font-family: var(--font-d); font-size: clamp(20px,3vw,32px);
          font-weight: 700; color: var(--platinum);
          letter-spacing: -0.5px;
          margin-bottom: clamp(28px,4vw,48px);
        }

        /* TIERS */
        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--rule);
          border: 1px solid var(--rule);
        }
        @media(max-width: 900px) { .tiers-grid { grid-template-columns: 1fr; } }

        .tier-card {
          background: var(--onyx-2);
          padding: 28px 24px;
          position: relative;
        }
        .tier-card.highlight {
          background: var(--onyx-3);
          border: 1px solid var(--gold-bdr);
        }
        .tier-card.highlight::before {
          content: 'RECOMMENDED';
          position: absolute; top: -1px; left: 24px;
          font-family: var(--font-m); font-size: 7px;
          letter-spacing: 2px; background: var(--gold);
          color: var(--onyx); padding: 3px 8px;
          font-weight: 600;
        }
        .tier-id {
          font-family: var(--font-m); font-size: 8px;
          letter-spacing: 3px; color: var(--plat-low);
          margin-bottom: 6px;
        }
        .tier-id.gold { color: var(--gold); }
        .tier-name {
          font-size: 20px; font-weight: 700;
          color: var(--platinum); margin-bottom: 4px;
        }
        .tier-target {
          font-size: 11px; color: var(--plat-dim);
          line-height: 1.5; margin-bottom: 16px;
        }
        .tier-cost {
          font-family: var(--font-m); font-size: 13px;
          font-weight: 500; color: var(--gold);
          margin-bottom: 20px; padding-bottom: 20px;
          border-bottom: 1px solid var(--rule);
        }
        .tier-features { list-style: none; margin-bottom: 20px; }
        .tier-features li {
          font-size: 12px; color: var(--plat-dim);
          padding: 5px 0; border-bottom: 1px solid var(--rule);
          display: flex; align-items: flex-start; gap: 8px;
          line-height: 1.4;
        }
        .tier-features li:last-child { border-bottom: none; }
        .tier-check { color: var(--emerald); font-size: 11px; flex-shrink: 0; margin-top: 1px; }
        .tier-cli {
          font-family: var(--font-m); font-size: 9px;
          color: var(--emerald); background: var(--onyx-4);
          padding: 10px 12px; border-radius: 2px;
          border: 1px solid rgba(16,185,129,0.15);
          word-break: break-all; line-height: 1.5;
        }
        .tier-cli-label {
          font-family: var(--font-m); font-size: 8px;
          color: var(--plat-low); letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 5px;
        }

        /* API ENDPOINTS */
        .api-table { width: 100%; border-collapse: collapse; }
        .api-table thead tr {
          border-bottom: 1px solid var(--rule);
        }
        .api-table th {
          font-family: var(--font-m); font-size: 8px;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--plat-low); padding: 8px 12px;
          text-align: left; font-weight: 400;
        }
        .api-table td {
          padding: 12px; border-bottom: 1px solid var(--rule);
          font-size: 12px;
        }
        .api-table tr:last-child td { border-bottom: none; }
        .api-table tr:hover td { background: var(--onyx-3); }
        .method-badge {
          font-family: var(--font-m); font-size: 8px;
          font-weight: 600; padding: 2px 6px;
          border-radius: 2px; letter-spacing: 0.5px;
        }
        .method-get  { background: var(--em-dim); color: var(--emerald); }
        .method-post { background: var(--gold-dim); color: var(--gold); }
        .api-path {
          font-family: var(--font-m); font-size: 11px;
          color: var(--platinum);
        }
        .api-desc { color: var(--plat-dim); font-size: 12px; }
        .tier-pill {
          font-family: var(--font-m); font-size: 7px;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 2px 6px; border-radius: 2px;
          white-space: nowrap;
        }
        .tier-pill.PUBLIC  { background: var(--rule); color: var(--plat-dim); }
        .tier-pill.INSTITUTIONAL { background: var(--em-dim); color: var(--emerald); }
        .tier-pill.ENTERPRISE { background: var(--gold-dim); color: var(--gold); }

        /* CLI REFERENCE */
        .cli-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--rule);
          border: 1px solid var(--rule);
        }
        @media(max-width: 768px) { .cli-grid { grid-template-columns: 1fr; } }
        .cli-row {
          background: var(--onyx-2);
          padding: 16px 20px;
          display: flex; flex-direction: column; gap: 5px;
        }
        .cli-cmd {
          font-family: var(--font-m); font-size: 10px;
          color: var(--emerald); letter-spacing: 0.2px;
          word-break: break-all;
        }
        .cli-cmd-desc {
          font-size: 11px; color: var(--plat-low);
        }

        /* ARCHITECTURE */
        .arch-flow {
          display: flex; flex-direction: column; gap: 1px;
          border: 1px solid var(--rule);
        }
        .arch-layer {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 0;
          background: var(--rule);
        }
        .arch-tier-label {
          background: var(--onyx-3);
          padding: 16px 20px;
          font-family: var(--font-m); font-size: 9px;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--gold); display: flex;
          align-items: center;
        }
        .arch-content {
          background: var(--onyx-2);
          padding: 16px 20px;
        }
        .arch-cmd {
          font-family: var(--font-m); font-size: 10px;
          color: var(--emerald); margin-bottom: 4px;
        }
        .arch-desc {
          font-size: 12px; color: var(--plat-dim);
        }
        .arch-arrow {
          padding: 8px 20px;
          background: var(--onyx);
          font-family: var(--font-m); font-size: 10px;
          color: var(--plat-low); letter-spacing: 2px;
          grid-column: 1 / -1;
          text-align: center;
        }

        /* FORM */
        .ent-form-wrap {
          max-width: 560px;
        }
        .form-field { margin-bottom: 16px; }
        .form-label {
          font-family: var(--font-m); font-size: 9px;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--plat-low); display: block;
          margin-bottom: 6px;
        }
        .form-input {
          width: 100%; padding: 12px 14px;
          background: var(--onyx-3);
          border: 1px solid var(--rule);
          border-radius: 2px; color: var(--platinum);
          font-family: var(--font-d); font-size: 13px;
          outline: none; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: var(--gold-bdr); }
        .form-input::placeholder { color: var(--plat-low); }
        .form-select {
          width: 100%; padding: 12px 14px;
          background: var(--onyx-3);
          border: 1px solid var(--rule);
          border-radius: 2px; color: var(--platinum);
          font-family: var(--font-d); font-size: 13px;
          outline: none; cursor: pointer;
          appearance: none;
        }
        .form-note {
          font-size: 11px; color: var(--plat-low);
          margin-top: 12px; line-height: 1.6;
          font-family: var(--font-m);
        }
      `}</style>

      <div className="ent-root">

        {/* NAV */}
        <nav className="ent-nav" aria-label="Enterprise navigation">
          <Link href={`/${locale}`} className="ent-back">← WorldContrast</Link>
          <span className="ent-sep">/</span>
          <span className="ent-page-title">Enterprise API</span>
          <div className="ent-spacer" />
          <a href="#apply" className="ent-cta-nav">Request Access</a>
        </nav>

        {/* HERO */}
        <section className="ent-hero" aria-label="Enterprise overview">
          <p className="ent-eyebrow">
            <span className="ent-dot" />
            World Contrast · Enterprise
          </p>
          <h1 className="ent-h1">Live API &</h1>
          <div className="ent-h1-b">Real-Time Intelligence.</div>
          <p className="ent-lead">
            {locale === 'pt'
              ? 'Infraestrutura de dados políticos em tempo real para agências de notícias globais, fundos soberanos e analistas de risco. Webhooks em milissegundos após qualquer declaração pública. Integridade SHA-256 em cada registro.'
              : locale === 'es'
              ? 'Infraestructura de datos políticos en tiempo real para agencias de noticias globales, fondos soberanos y analistas de riesgo. Webhooks en milisegundos tras cualquier declaración pública.'
              : 'Real-time political data infrastructure for global news agencies, sovereign funds, and risk analysts. Webhooks delivered within milliseconds of any public declaration. SHA-256 integrity on every record.'}
          </p>
          <a href="#apply" className="ent-btn">Request Enterprise Access</a>
        </section>

        {/* TIERS */}
        <section className="ent-section" aria-label="Access tiers">
          <p className="ent-label">01 — Access Architecture</p>
          <h2 className="ent-h2">Three-tier access model.</h2>
          <div className="tiers-grid">
            {tiers.map((tier) => (
              <div key={tier.id} className={`tier-card ${tier.highlight ? 'highlight' : ''}`}>
                <p className={`tier-id ${tier.highlight ? 'gold' : ''}`}>{tier.id}</p>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-target">{L(tier.target)}</p>
                <p className="tier-cost">{L(tier.cost)}</p>
                <ul className="tier-features">
                  {tier.features.map((f, i) => (
                    <li key={i}>
                      <span className="tier-check">✓</span>
                      <span>{L(f)}</span>
                    </li>
                  ))}
                </ul>
                <p className="tier-cli-label">CLI</p>
                <div className="tier-cli">{tier.cli}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CLI FIRST ARCHITECTURE */}
        <section className="ent-section bg-2" aria-label="CLI-first architecture">
          <p className="ent-label">02 — CLI-First Architecture</p>
          <h2 className="ent-h2">
            {locale === 'pt'
              ? 'O CLI é a fundação. O dashboard é o reflexo.'
              : 'The CLI is the foundation. The dashboard is its reflection.'}
          </h2>

          <div className="arch-flow" style={{marginBottom: '32px'}}>
            <div className="arch-layer">
              <div className="arch-tier-label">AGENTS</div>
              <div className="arch-content">
                <div className="arch-cmd">$ wc agent run --country BR --dry-run</div>
                <div className="arch-desc">Pipeline de coleta autônoma. Crawler → Extractor (POCVA-01) → Validator → Database. Executável localmente ou via GitHub Actions.</div>
              </div>
            </div>
            <div className="arch-arrow">↓</div>
            <div className="arch-layer">
              <div className="arch-tier-label">DATABASE</div>
              <div className="arch-content">
                <div className="arch-cmd">$ wc data dump --format jsonl --since 2026-01-01</div>
                <div className="arch-desc">Supabase PostgreSQL com audit_log append-only. Cada registro carrega SHA-256, timestamp e hash do protocolo POCVA-01 ativo.</div>
              </div>
            </div>
            <div className="arch-arrow">↓</div>
            <div className="arch-layer">
              <div className="arch-tier-label">REST API</div>
              <div className="arch-content">
                <div className="arch-cmd">$ curl -H "Authorization: Bearer $WC_API_KEY" \</div>
                <div className="arch-cmd" style={{marginLeft: 16}}>https://api.worldcontrast.org/v1/promises/live</div>
                <div className="arch-desc" style={{marginTop: 6}}>FastAPI sobre o mesmo Supabase. O frontend Next.js é apenas um cliente HTTP deste endpoint.</div>
              </div>
            </div>
            <div className="arch-arrow">↓</div>
            <div className="arch-layer">
              <div className="arch-tier-label">WEBHOOKS</div>
              <div className="arch-content">
                <div className="arch-cmd">$ wc webhooks create --url https://api.reuters.com/hook \</div>
                <div className="arch-cmd" style={{marginLeft: 16}}>--events promise.created,election.updated</div>
                <div className="arch-desc" style={{marginTop: 6}}>Entrega garantida com retry. Payload inclui hash SHA-256 e diff para auditoria.</div>
              </div>
            </div>
            <div className="arch-arrow">↓</div>
            <div className="arch-layer">
              <div className="arch-tier-label">DASHBOARD</div>
              <div className="arch-content">
                <div className="arch-cmd">https://worldcontrast.org/{'{locale}'}/dashboard</div>
                <div className="arch-desc">Interface Next.js do Enterprise Dashboard. Consome os mesmos endpoints CLI acima. Zero lógica exclusiva de frontend — tudo disponível via CLI primeiro.</div>
              </div>
            </div>
          </div>
        </section>

        {/* CLI REFERENCE */}
        <section className="ent-section bg-3" aria-label="CLI reference">
          <p className="ent-label">03 — CLI Reference</p>
          <h2 className="ent-h2">
            {locale === 'pt' ? 'Comandos disponíveis.' : 'Available commands.'}
          </h2>
          <div className="cli-grid">
            {cliCommands.map((cmd, i) => (
              <div key={i} className="cli-row">
                <code className="cli-cmd">$ {cmd.cmd}</code>
                <span className="cli-cmd-desc">{L(cmd.desc)}</span>
              </div>
            ))}
          </div>
          <p style={{marginTop: 16, fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--plat-low)'}}>
            $ npm install -g @worldcontrast/cli &nbsp;|&nbsp; wc --help
          </p>
        </section>

        {/* API ENDPOINTS */}
        <section className="ent-section" aria-label="API endpoints">
          <p className="ent-label">04 — REST API</p>
          <h2 className="ent-h2">
            {locale === 'pt' ? 'Endpoints disponíveis.' : 'Available endpoints.'}
          </h2>
          <div style={{border: '1px solid var(--rule)', borderRadius: 2, overflow: 'hidden'}}>
            <table className="api-table">
              <thead>
                <tr>
                  <th style={{width: 60}}>Method</th>
                  <th>Endpoint</th>
                  <th>{locale === 'pt' ? 'Descrição' : 'Description'}</th>
                  <th style={{width: 120}}>Tier</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => (
                  <tr key={i}>
                    <td><span className={`method-badge method-${ep.method.toLowerCase()}`}>{ep.method}</span></td>
                    <td><code className="api-path">{ep.path}</code></td>
                    <td className="api-desc">{L(ep.desc)}</td>
                    <td><span className={`tier-pill ${ep.tier}`}>{ep.tier}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{marginTop: 12, fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--plat-low)'}}>
            Base URL: https://api.worldcontrast.org &nbsp;|&nbsp; Auth: Bearer token &nbsp;|&nbsp; Format: JSON/JSONL
          </p>
        </section>

        {/* APPLICATION FORM */}
        <section className="ent-section bg-2" id="apply" aria-label="Enterprise application">
          <p className="ent-label">05 — Access Request</p>
          <h2 className="ent-h2">
            {locale === 'pt' ? 'Solicitar acesso Enterprise.' : 'Request Enterprise access.'}
          </h2>
          <div className="ent-form-wrap">
            <p style={{fontSize: 13, color: 'var(--plat-dim)', marginBottom: 24, lineHeight: 1.75, fontWeight: 300}}>
              {locale === 'pt'
                ? 'Enterprise access é concedido apenas a organizações verificadas. Revisamos cada aplicação individualmente. Tempo médio de resposta: 5 dias úteis.'
                : 'Enterprise access is granted only to verified organizations. We review each application individually. Average response time: 5 business days.'}
            </p>

            <form action="https://worldcontrast.org/api/enterprise/apply" method="POST">
              <div className="form-field">
                <label className="form-label" htmlFor="org">
                  {locale === 'pt' ? 'Organização' : 'Organization'}
                </label>
                <input className="form-input" id="org" name="org" type="text"
                  placeholder={locale === 'pt' ? 'Reuters · Bloomberg · IMF...' : 'Reuters · Bloomberg · IMF...'} required />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="email">
                  {locale === 'pt' ? 'Email institucional' : 'Institutional email'}
                </label>
                <input className="form-input" id="email" name="email" type="email"
                  placeholder="name@organization.com" required />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="use-case">
                  {locale === 'pt' ? 'Caso de uso' : 'Use case'}
                </label>
                <select className="form-select" id="use-case" name="use_case" required>
                  <option value="">{locale === 'pt' ? 'Selecione...' : 'Select...'}</option>
                  <option value="news_agency">{locale === 'pt' ? 'Agência de notícias' : 'News agency'}</option>
                  <option value="sovereign_fund">{locale === 'pt' ? 'Fundo soberano / Risco político' : 'Sovereign fund / Political risk'}</option>
                  <option value="academic">{locale === 'pt' ? 'Pesquisa acadêmica' : 'Academic research'}</option>
                  <option value="ngo">{locale === 'pt' ? 'ONG / Sociedade civil' : 'NGO / Civil society'}</option>
                  <option value="other">{locale === 'pt' ? 'Outro' : 'Other'}</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="countries">
                  {locale === 'pt' ? 'Países de interesse' : 'Countries of interest'}
                </label>
                <input className="form-input" id="countries" name="countries" type="text"
                  placeholder={locale === 'pt' ? 'Brasil, Argentina, EUA...' : 'Brazil, Argentina, USA...'} />
              </div>

              <button type="submit" className="ent-btn" style={{marginTop: 8}}>
                {locale === 'pt' ? 'Enviar solicitação' : 'Submit application'}
              </button>

              <p className="form-note">
                {locale === 'pt'
                  ? 'Ao enviar, você confirma que a organização não está afiliada a nenhum partido político, campanha eleitoral ou governo. Ver TERMS_API.md.'
                  : 'By submitting, you confirm that the organization has no affiliation with any political party, electoral campaign, or government. See TERMS_API.md.'}
              </p>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          background: 'var(--onyx)', padding: 'clamp(24px,4vw,48px) var(--px)',
          borderTop: '1px solid var(--rule)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--plat-low)', letterSpacing: '0.04em'}}>
            © 2026 WorldContrast — AGPL v3.0 · API Terms: TERMS_API.md
          </p>
          <p style={{fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--plat-low)', letterSpacing: '0.04em'}}>
            Zero viés · Zero contato · Zero agenda editorial
          </p>
        </footer>

      </div>
    </>
  )
}
