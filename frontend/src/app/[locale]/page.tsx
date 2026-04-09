import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getAllElections } from '@/lib/data'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const elections = await getAllElections()

  const t = {
    en: {
      tagA: 'Candidate A · Side A',
      tagB: 'Candidate B · Side B',
      hedA: <>The Power<br />of the<br />Side-by-Side.</>,
      hedB: <>Because the world is clearer in contrast.</>,
      dekA: "We don't tell you who to believe. We don't point the way. We illuminate the differences — and let you decide.",
      dekB: "Every promise made in a campaign belongs to the public. We organize them. We track them. We compare them — in any language.",
      ctaA: 'Start comparing',
      ctaB: 'Choose a country',
      manifesto: 'Read the Manifesto',
      liveElections: 'See live elections',
      stat1: 'Countries monitored',
      stat2: 'Promises catalogued',
      stat3: 'Political bias',
      stat4: 'Right to compare',
      quote: '"The truth emerges from contrast — not from repetition."',
      mbandP1: 'We live in an era of excess. Words, promises, speeches and data float in an ocean of digital noise. But in any corner of the world — under full democracy or other systems — the human desire for a better future remains constant.',
      mbandP2: 'World Contrast was born from a simple premise: information is not enough. Clarity is. We copy official sources. We organize them. We show them side by side. We never contact, never editorialize, never judge.',
      pillarsEye: '01 — Foundation',
      pillarsHed: 'Our Eight Pillars',
      catsLabel: '9 Categories — applied equally to every candidate in every country',
      countriesEye: '02 — Live Elections',
      countriesHed: 'Choose a Country',
      compare: 'Compare →',
      candidatesTxt: 'candidates',
      promisesTxt: 'promises',
      statusTxt: 'Status',
      footTagline: 'Comparing political campaigns — because the world is clearer when you see the difference.',
      footCopy: '© 2025 World Contrast — Non-profit initiative. All data open source. All code open source.',
      footNeutral: 'Zero bias · Zero contact · Zero agenda',
      footPlatform: 'Platform',
      footMission: 'Mission',
      howItWorks: 'How it works',
      compareTool: 'Compare tool',
      liveEl: 'Live elections',
      openData: 'Open data API',
      manifestoV: 'Manifesto v2.0',
      eightPillars: 'Eight pillars',
      transparency: 'Transparency report',
      contribute: 'Contribute data',
    },
    pt: {
      tagA: 'Candidato A · Lado A',
      tagB: 'Candidato B · Lado B',
      hedA: <>O Poder<br />do<br />Lado a Lado.</>,
      hedB: <>Porque o mundo fica mais claro no contraste.</>,
      dekA: "Não dizemos em quem acreditar. Não apontamos o caminho. Iluminamos as diferenças — e deixamos você decidir.",
      dekB: "Cada promessa feita em campanha pertence ao público. Nós as organizamos. Rastreamos. Comparamos — em qualquer idioma.",
      ctaA: 'Começar a comparar',
      ctaB: 'Escolher um país',
      manifesto: 'Ler o Manifesto',
      liveElections: 'Ver eleições ao vivo',
      stat1: 'Países monitorados',
      stat2: 'Promessas catalogadas',
      stat3: 'Viés político',
      stat4: 'Direito de comparar',
      quote: '"A verdade emerge do contraste — não da repetição."',
      mbandP1: 'Vivemos numa era de excesso. Palavras, promessas, discursos e dados flutuam num oceano de ruído digital. Mas em qualquer canto do mundo — sob plena democracia ou outros sistemas — o desejo humano por um futuro melhor permanece constante.',
      mbandP2: 'O World Contrast nasceu de uma premissa simples: informação não basta. Clareza sim. Copiamos fontes oficiais. Organizamos. Mostramos lado a lado. Nunca contatamos, nunca editorializamos, nunca julgamos.',
      pillarsEye: '01 — Fundação',
      pillarsHed: 'Nossos Oito Pilares',
      catsLabel: '9 Categorias — aplicadas igualmente a cada candidato em cada país',
      countriesEye: '02 — Eleições ao Vivo',
      countriesHed: 'Escolha um País',
      compare: 'Comparar →',
      candidatesTxt: 'candidatos',
      promisesTxt: 'promessas',
      statusTxt: 'Status',
      footTagline: 'Comparando campanhas políticas — porque o mundo fica mais claro quando você vê a diferença.',
      footCopy: '© 2025 World Contrast — Iniciativa sem fins lucrativos. Todos os dados são open source. Todo o código é open source.',
      footNeutral: 'Zero viés · Zero contato · Zero agenda',
      footPlatform: 'Plataforma',
      footMission: 'Missão',
      howItWorks: 'Como funciona',
      compareTool: 'Ferramenta de comparação',
      liveEl: 'Eleições ao vivo',
      openData: 'API de dados abertos',
      manifestoV: 'Manifesto v2.0',
      eightPillars: 'Oito pilares',
      transparency: 'Relatório de transparência',
      contribute: 'Contribuir com dados',
    },
    es: {
      tagA: 'Candidato A · Lado A',
      tagB: 'Candidato B · Lado B',
      hedA: <>El Poder<br />del<br />Lado a Lado.</>,
      hedB: <>Porque el mundo es más claro en contraste.</>,
      dekA: "No te decimos en quién creer. No señalamos el camino. Iluminamos las diferencias — y te dejamos decidir.",
      dekB: "Cada promesa de campaña le pertenece al público. Las organizamos. Las rastreamos. Las comparamos — en cualquier idioma.",
      ctaA: 'Empezar a comparar',
      ctaB: 'Elegir un país',
      manifesto: 'Leer el Manifiesto',
      liveElections: 'Ver elecciones en vivo',
      stat1: 'Países monitoreados',
      stat2: 'Promesas catalogadas',
      stat3: 'Sesgo político',
      stat4: 'Derecho a comparar',
      quote: '"La verdad surge del contraste — no de la repetición."',
      mbandP1: 'Vivimos en una era de exceso. Palabras, promesas, discursos y datos flotan en un océano de ruido digital.',
      mbandP2: 'World Contrast nació de una premisa simple: la información no es suficiente. La claridad sí. Copiamos fuentes oficiales. Las organizamos. Las mostramos lado a lado.',
      pillarsEye: '01 — Fundación',
      pillarsHed: 'Nuestros Ocho Pilares',
      catsLabel: '9 Categorías — aplicadas igual a cada candidato en cada país',
      countriesEye: '02 — Elecciones en Vivo',
      countriesHed: 'Elige un País',
      compare: 'Comparar →',
      candidatesTxt: 'candidatos',
      promisesTxt: 'promesas',
      statusTxt: 'Estado',
      footTagline: 'Comparando campañas políticas — porque el mundo es más claro cuando ves la diferencia.',
      footCopy: '© 2025 World Contrast — Iniciativa sin fines de lucro.',
      footNeutral: 'Cero sesgo · Cero contacto · Cero agenda',
      footPlatform: 'Plataforma',
      footMission: 'Misión',
      howItWorks: 'Cómo funciona',
      compareTool: 'Herramienta de comparación',
      liveEl: 'Elecciones en vivo',
      openData: 'API de datos abiertos',
      manifestoV: 'Manifiesto v2.0',
      eightPillars: 'Ocho pilares',
      transparency: 'Informe de transparencia',
      contribute: 'Contribuir con datos',
    },
  } as Record<string, any>

  const copy = t[locale] || t['en']

  const pillars = [
    { num: 'I',    name: { en: 'Radical Neutrality',        pt: 'Neutralidade Radical',        es: 'Neutralidad Radical'        }, desc: { en: 'We are the mirror, not the judge. Contrast reveals what words try to hide.', pt: 'Somos o espelho, não o juiz. O contraste revela o que as palavras tentam esconder.', es: 'Somos el espejo, no el juez.' } },
    { num: 'II',   name: { en: 'Sovereignty Respect',       pt: 'Respeito à Soberania',         es: 'Respeto a la Soberanía'      }, desc: { en: 'We operate within each nation\'s legal framework without exception.', pt: 'Operamos dentro do marco legal de cada nação, sem exceção.', es: 'Operamos dentro del marco legal de cada nación.' } },
    { num: 'III',  name: { en: 'Democracy of Information',  pt: 'Democracia da Informação',     es: 'Democracia de la Información'}, desc: { en: 'If there is a proposal that affects human lives, there must be clarity about it.', pt: 'Se há uma proposta que afeta vidas humanas, deve haver clareza sobre ela.', es: 'Si hay una propuesta que afecta vidas humanas, debe haber claridad.' } },
    { num: 'IV',   name: { en: 'The Right to Compare',      pt: 'O Direito de Comparar',        es: 'El Derecho a Comparar'       }, desc: { en: 'Comparing is an act of intelligence. It is our universal language.', pt: 'Comparar é um ato de inteligência. É nossa linguagem universal.', es: 'Comparar es un acto de inteligencia.' } },
    { num: 'V',    name: { en: 'Source Integrity',          pt: 'Integridade das Fontes',       es: 'Integridad de Fuentes'       }, desc: { en: 'Every record is timestamped, URL-cited, and cryptographically archived.', pt: 'Cada registro tem carimbo de data, URL citada e arquivamento criptográfico.', es: 'Cada registro está fechado, citado y archivado criptográficamente.' } },
    { num: 'VI',   name: { en: 'Zero Contact',              pt: 'Zero Contato',                 es: 'Cero Contacto'               }, desc: { en: 'We never contact candidates or parties. We only observe public records.', pt: 'Nunca contatamos candidatos ou partidos. Apenas observamos registros públicos.', es: 'Nunca contactamos candidatos o partidos.' } },
    { num: 'VII',  name: { en: 'Open Infrastructure',       pt: 'Infraestrutura Aberta',        es: 'Infraestructura Abierta'     }, desc: { en: 'Our code, data, and methodology are fully open-source and auditable.', pt: 'Nosso código, dados e metodologia são totalmente open-source e auditáveis.', es: 'Nuestro código, datos y metodología son completamente open-source.' } },
    { num: 'VIII', name: { en: 'No Advertising',            pt: 'Sem Publicidade',              es: 'Sin Publicidad'              }, desc: { en: 'We carry no ads, sponsored content, or monetized placements. Ever.', pt: 'Não veiculamos anúncios, conteúdo patrocinado ou inserções monetizadas. Nunca.', es: 'No publicamos anuncios ni contenido patrocinado. Nunca.' } },
  ]

  const categories = [
    { en: 'Economy & Fiscal', pt: 'Economia & Fiscal', es: 'Economía & Fiscal' },
    { en: 'Education & Culture', pt: 'Educação & Cultura', es: 'Educación & Cultura' },
    { en: 'Health & Sanitation', pt: 'Saúde & Saneamento', es: 'Salud & Saneamiento' },
    { en: 'Public Safety & Justice', pt: 'Segurança & Justiça', es: 'Seguridad & Justicia' },
    { en: 'Environment & Climate', pt: 'Meio Ambiente & Clima', es: 'Medio Ambiente & Clima' },
    { en: 'Social Assistance', pt: 'Assistência Social', es: 'Asistencia Social' },
    { en: 'Human Rights', pt: 'Direitos Humanos', es: 'Derechos Humanos' },
    { en: 'Infrastructure & Transport', pt: 'Infraestrutura & Transporte', es: 'Infraestructura & Transporte' },
    { en: 'Governance & Reform', pt: 'Governança & Reforma', es: 'Gobernanza & Reforma' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
        :root{--ink:#0B1D2E;--paper:#F5F0E8;--gold:#C8A96E;--gold-dark:#8B6914;--rule:rgba(11,29,46,0.12);--muted:rgba(11,29,46,0.5)}
        .wc-body{font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink);overflow-x:hidden}
        /* HERO */
        .hero{display:grid;grid-template-columns:1fr 1fr;min-height:90vh;position:relative}
        .hero-divider{position:absolute;left:50%;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,transparent,var(--rule) 15%,var(--rule) 85%,transparent);z-index:5}
        .vs-bubble{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;width:56px;height:56px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:var(--ink);letter-spacing:1px;box-shadow:0 0 0 10px rgba(200,169,110,0.12),0 0 0 20px rgba(200,169,110,0.05)}
        .side-a{background:var(--ink);display:flex;flex-direction:column;justify-content:center;padding:72px 64px 80px;position:relative;overflow:hidden}
        .side-b{background:var(--paper);display:flex;flex-direction:column;justify-content:center;padding:72px 64px 80px;position:relative;overflow:hidden}
        .side-a::before{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;border-radius:50%;border:1px solid rgba(200,169,110,0.08)}
        .side-b::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(11,29,46,0.06)}
        .side-tag{font-size:10px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:24px}
        .side-tag-a{color:var(--gold)}
        .side-tag-b{color:var(--gold-dark)}
        .hero-hed-a{font-family:'Playfair Display',serif;font-size:clamp(38px,5.5vw,68px);font-weight:900;color:var(--paper);line-height:1.0;letter-spacing:-1px;margin-bottom:28px}
        .hero-hed-b{font-family:'Playfair Display',serif;font-size:clamp(38px,5.5vw,68px);font-weight:400;font-style:italic;color:var(--ink);line-height:1.0;letter-spacing:-1px;margin-bottom:28px}
        .hero-dek{font-size:15px;font-weight:300;line-height:1.8;max-width:360px;margin-bottom:40px}
        .hero-dek-a{color:rgba(245,240,232,0.65)}
        .hero-dek-b{color:rgba(11,29,46,0.6)}
        .cta-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        .btn-solid-a{font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;background:var(--gold);color:var(--ink);border:none;padding:13px 24px;cursor:pointer;border-radius:2px;text-decoration:none;display:inline-block}
        .btn-ghost-a{font-size:11px;font-weight:400;color:rgba(245,240,232,0.5);background:none;border:none;cursor:pointer;letter-spacing:.5px;text-decoration:underline;text-underline-offset:3px}
        .btn-solid-b{font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;background:var(--ink);color:var(--paper);border:none;padding:13px 24px;cursor:pointer;border-radius:2px;text-decoration:none;display:inline-block}
        .btn-ghost-b{font-size:11px;font-weight:400;color:rgba(11,29,46,0.4);background:none;border:none;cursor:pointer;letter-spacing:.5px;text-decoration:underline;text-underline-offset:3px}
        /* STATS */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
        .stat{padding:44px 36px;border-right:1px solid var(--rule)}
        .stat:last-child{border-right:none}
        .stat-val{font-family:'Playfair Display',serif;font-size:48px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:8px}
        .stat-val span{color:var(--gold)}
        .stat-lab{font-size:13px;font-weight:300;color:var(--muted)}
        /* MANIFESTO BAND */
        .mband{background:var(--ink);display:grid;grid-template-columns:1fr 1px 1.2fr}
        .mband-quote{padding:72px 64px;display:flex;flex-direction:column;justify-content:center}
        .mband-quote p{font-family:'Playfair Display',serif;font-size:clamp(22px,3vw,34px);font-style:italic;font-weight:400;color:var(--paper);line-height:1.45}
        .mband-quote p span{color:var(--gold)}
        .mband-rule{background:rgba(200,169,110,0.25)}
        .mband-text{padding:72px 64px;display:flex;flex-direction:column;justify-content:center;gap:20px}
        .mband-text p{font-size:14px;font-weight:300;color:rgba(245,240,232,0.6);line-height:1.85;padding-left:20px;border-left:1px solid rgba(200,169,110,0.3)}
        .mband-text strong{color:var(--gold);font-weight:500}
        /* PILLARS */
        .pillars-sec{padding:88px 64px}
        .sec-eyebrow{display:flex;align-items:baseline;gap:16px;margin-bottom:56px}
        .sec-num{font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
        .sec-hed{font-family:'Playfair Display',serif;font-size:38px;font-weight:700;color:var(--ink)}
        .pillars-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--rule);border:1px solid var(--rule)}
        .pillar{background:var(--paper);padding:32px 24px;transition:background .22s}
        .pillar:hover{background:var(--ink)}
        .pillar:hover .p-num{color:var(--gold)}
        .pillar:hover .p-name{color:var(--paper)}
        .pillar:hover .p-desc{color:rgba(245,240,232,0.55)}
        .p-num{font-size:10px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-bottom:16px;transition:color .22s}
        .p-name{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:var(--ink);margin-bottom:14px;line-height:1.2;transition:color .22s}
        .p-desc{font-size:12px;font-weight:300;color:rgba(11,29,46,0.55);line-height:1.75;transition:color .22s}
        /* CATEGORIES */
        .cats-sec{background:var(--ink);padding:72px 64px}
        .cats-label{font-size:10px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);margin-bottom:24px}
        .cats-grid{display:grid;grid-template-columns:repeat(9,1fr);gap:1px;background:rgba(200,169,110,0.2)}
        .cat-box{background:var(--ink);padding:20px 12px;text-align:center;transition:background .2s}
        .cat-box:hover{background:rgba(200,169,110,0.12)}
        .cat-name{font-size:11px;font-weight:400;color:rgba(245,240,232,0.65);line-height:1.45}
        .cat-bar{width:24px;height:2px;background:var(--gold);margin:8px auto 0;border-radius:1px;opacity:.5}
        /* ELECTIONS / COUNTRIES */
        .elections-sec{padding:88px 64px;background:var(--paper)}
        .elections-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:2px;background:var(--rule);border:1px solid var(--rule);margin-top:48px}
        .election-card{background:var(--paper);padding:32px 28px;display:flex;flex-direction:column;gap:16px;transition:background .22s;text-decoration:none;color:inherit}
        .election-card:hover{background:var(--ink)}
        .election-card:hover .ec-flag{border-color:rgba(200,169,110,0.3)}
        .election-card:hover .ec-name{color:var(--paper)}
        .election-card:hover .ec-meta{color:rgba(245,240,232,0.45)}
        .election-card:hover .ec-cands{color:rgba(245,240,232,0.55)}
        .election-card:hover .ec-arrow{color:var(--gold)}
        .ec-top{display:flex;align-items:center;gap:14px}
        .ec-flag{font-size:28px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:1px solid var(--rule);background:rgba(11,29,46,0.03);transition:border-color .22s;flex-shrink:0}
        .ec-info{flex:1}
        .ec-name{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--ink);line-height:1.2;transition:color .22s}
        .ec-meta{font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-top:4px;transition:color .22s}
        .ec-cands{font-size:12px;font-weight:300;color:var(--muted);line-height:1.6;transition:color .22s}
        .ec-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--rule)}
        .ec-updated{font-size:10px;color:var(--muted)}
        .ec-arrow{font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;color:var(--gold-dark);transition:color .22s}
        /* FOOTER */
        .wc-footer{background:var(--ink);padding:60px 64px 36px}
        .foot-top{display:grid;grid-template-columns:1fr 1fr 1fr;gap:48px;padding-bottom:48px;border-bottom:1px solid rgba(245,240,232,0.08);margin-bottom:32px}
        .foot-brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--paper);margin-bottom:10px}
        .foot-brand span{color:var(--gold)}
        .foot-tagline{font-size:12px;font-weight:300;color:rgba(245,240,232,0.4);line-height:1.7;max-width:240px}
        .foot-col-title{font-size:9px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
        .foot-links{list-style:none}
        .foot-links li{margin-bottom:9px}
        .foot-links a{font-size:12px;font-weight:300;color:rgba(245,240,232,0.45);text-decoration:none;transition:color .2s}
        .foot-links a:hover{color:var(--paper)}
        .foot-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .foot-copy{font-size:11px;color:rgba(245,240,232,0.25)}
        .foot-neutral{display:flex;align-items:center;gap:7px;font-size:11px;color:rgba(245,240,232,0.3)}
        .gold-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
        /* RESPONSIVE */
        @media(max-width:768px){
          .hero{grid-template-columns:1fr}
          .hero-divider,.vs-bubble{display:none}
          .side-a,.side-b{padding:56px 32px}
          .stats{grid-template-columns:1fr 1fr}
          .stat{border-right:none;border-bottom:1px solid var(--rule)}
          .mband{grid-template-columns:1fr}
          .mband-rule{display:none}
          .mband-quote,.mband-text{padding:48px 32px}
          .pillars-sec,.elections-sec{padding:56px 32px}
          .pillars-grid{grid-template-columns:1fr 1fr}
          .cats-sec{padding:48px 20px}
          .cats-grid{grid-template-columns:repeat(3,1fr)}
          .elections-grid{grid-template-columns:1fr}
          .wc-footer{padding:48px 32px 28px}
          .foot-top{grid-template-columns:1fr;gap:32px}
        }
      `}</style>

      <div className="wc-body">

        {/* HERO */}
        <section className="hero">
          <div className="side-a">
            <p className="side-tag side-tag-a">{copy.tagA}</p>
            <h1 className="hero-hed-a">{copy.hedA}</h1>
            <p className="hero-dek hero-dek-a">{copy.dekA}</p>
            <div className="cta-row">
              {elections[0] && (
                <Link href={`/${locale}/compare/${elections[0].id}`} className="btn-solid-a">
                  {copy.ctaA}
                </Link>
              )}
              <button className="btn-ghost-a">{copy.manifesto}</button>
            </div>
          </div>

          <div className="hero-divider" />
          <div className="vs-bubble">VS</div>

          <div className="side-b">
            <p className="side-tag side-tag-b">{copy.tagB}</p>
            <h1 className="hero-hed-b">{copy.hedB}</h1>
            <p className="hero-dek hero-dek-b">{copy.dekB}</p>
            <div className="cta-row">
              <a href="#elections" className="btn-solid-b">{copy.ctaB}</a>
              <button className="btn-ghost-b">{copy.liveElections}</button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats">
          <div className="stat"><div className="stat-val">142<span>+</span></div><div className="stat-lab">{copy.stat1}</div></div>
          <div className="stat"><div className="stat-val">38<span>k</span></div><div className="stat-lab">{copy.stat2}</div></div>
          <div className="stat"><div className="stat-val">0<span>%</span></div><div className="stat-lab">{copy.stat3}</div></div>
          <div className="stat"><div className="stat-val" style={{fontSize:40}}>∞</div><div className="stat-lab">{copy.stat4}</div></div>
        </div>

        {/* MANIFESTO BAND */}
        <div className="mband">
          <div className="mband-quote">
            <p>
              {locale === 'pt'
                ? <>"A verdade emerge do <span style={{color:'var(--gold)'}}>contraste</span> — não da repetição."</>
                : locale === 'es'
                ? <>"La verdad surge del <span style={{color:'var(--gold)'}}>contraste</span> — no de la repetición."</>
                : <>"The truth emerges from <span style={{color:'var(--gold)'}}>contrast</span> — not from repetition."</>
              }
            </p>
          </div>
          <div className="mband-rule" />
          <div className="mband-text">
            <p>{copy.mbandP1}</p>
            <p>{copy.mbandP2}</p>
          </div>
        </div>

        {/* PILLARS */}
        <section className="pillars-sec">
          <div className="sec-eyebrow">
            <span className="sec-num">{copy.pillarsEye}</span>
            <h2 className="sec-hed">{copy.pillarsHed}</h2>
          </div>
          <div className="pillars-grid">
            {pillars.map(p => (
              <div key={p.num} className="pillar">
                <p className="p-num">{p.num}</p>
                <h3 className="p-name">{p.name[locale] || p.name['en']}</h3>
                <p className="p-desc">{p.desc[locale] || p.desc['en']}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="cats-sec">
          <p className="cats-label">{copy.catsLabel}</p>
          <div className="cats-grid">
            {categories.map((c, i) => (
              <div key={i} className="cat-box">
                <p className="cat-name">{c[locale as keyof typeof c] || c['en']}</p>
                <div className="cat-bar" />
              </div>
            ))}
          </div>
        </section>

        {/* ELECTIONS / COUNTRIES */}
        <section className="elections-sec" id="elections">
          <div className="sec-eyebrow">
            <span className="sec-num">{copy.countriesEye}</span>
            <h2 className="sec-hed">{copy.countriesHed}</h2>
          </div>
          <div className="elections-grid">
            {elections.map(election => {
              const name = typeof election.electionName === 'object'
                ? (election.electionName[locale] || election.electionName['en'] || election.electionName['pt'])
                : election.electionName
              return (
                <Link
                  key={election.id}
                  href={`/${locale}/compare/${election.id}`}
                  className="election-card"
                >
                  <div className="ec-top">
                    <div className="ec-flag">{election.flag}</div>
                    <div className="ec-info">
                      <div className="ec-name">{name}</div>
                      <div className="ec-meta">{election.electionDate}</div>
                    </div>
                  </div>
                  
                  <div className="ec-cands">
                    {election.candidateCount} {copy.candidatesTxt} &nbsp;·&nbsp; {election.promiseCount} {copy.promisesTxt}
                  </div>
                  
                  <div className="ec-footer">
                    <span className="ec-updated">
                      {copy.statusTxt}: {election.status}
                    </span>
                    <span className="ec-arrow">{copy.compare}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="wc-footer">
          <div className="foot-top">
            <div>
              <div className="foot-brand">World<span>Contrast</span></div>
              <p className="foot-tagline">{copy.footTagline}</p>
            </div>
            <div>
              <p className="foot-col-title">{copy.footPlatform}</p>
              <ul className="foot-links">
                <li><a href="#">{copy.howItWorks}</a></li>
                <li><a href="#">{copy.compareTool}</a></li>
                <li><a href="#elections">{copy.liveEl}</a></li>
                <li><a href="#">{copy.openData}</a></li>
              </ul>
            </div>
            <div>
              <p className="foot-col-title">{copy.footMission}</p>
              <ul className="foot-links">
                <li><a href="#">{copy.manifestoV}</a></li>
                <li><a href="#">{copy.eightPillars}</a></li>
                <li><a href="#">{copy.transparency}</a></li>
                <li><a href="#">{copy.contribute}</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <p className="foot-copy">{copy.footCopy}</p>
            <div className="foot-neutral"><div className="gold-dot" />{copy.footNeutral}</div>
          </div>
        </footer>

      </div>
    </>
  )
}
