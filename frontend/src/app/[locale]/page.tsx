/**
 * World Contrast — Homepage v16.0 "Quiet Luxury"
 * File: frontend/src/app/[locale]/page.tsx
 *
 * Director of Art directive:
 *   — Negative space is the primary design element
 *   — Typography hierarchy: 800w headers / 300w body
 *   — Never #FFFFFF on dark bg; use Platinum #E4E4E7
 *   — Borders only where strictly necessary for data separation
 *   — Line-height 1.9 on all body copy
 *   — Sections breathe — minimum 128px vertical padding
 */

import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getAllElections } from '@/lib/data'
import ElectionGrid from '@/components/ElectionGrid'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const elections    = await getAllElections()
  const totalPromises   = elections.reduce((s, e) => s + e.promiseCount, 0)
  const totalElections  = elections.length
  const totalCandidates = elections.reduce((s, e) => s + e.candidateCount, 0)

  const copy: Record<string, any> = {
    pt: {
      eyebrow: 'POCVA-01 · Sistema Ativo',
      h1a: 'Eleições',
      h1b: 'Promessas dos Candidatos',
      h1c: 'Lado a Lado.',
      sub: 'Registro histórico autenticado, fiel e permanente.',
      ctaRegistry: 'Acessar o Registro',
      ctaProtocol: 'Protocolo POCVA-01',
      ctaEnterprise: 'Acesso Enterprise →',
      c1label: 'Registros SHA-256',
      c2label: 'Eleições ativas',
      c3label: 'Candidatos registrados',
      c4label: 'Viés algorítmico',
      sElecEye: '02 — Jurisdições',
      sElecTitle: 'Selecione a Jurisdição',
      sPocvaEye: 'POCVA-01',
      sPocvaTitle: 'O Protocolo de Extração',
      sEq: '[P] = [A] Ator + [V] Verbo de Ação Futura + [M] Alvo Mensurável',
      sPocvaBody1: 'Uma declaração só é registrada como promessa se satisfizer os três componentes. O algoritmo não negocia. O algoritmo não tem opiniões. O algoritmo é a resposta.',
      sPocvaBody2: 'O hash SHA-256 do arquivo de prompt é registrado junto com cada promessa extraída — prova irrefutável de qual versão do protocolo estava ativa no momento da extração.',
      sPillarsEye: '01 — Arquitetura',
      sPillarsTitle: 'Os Oito Pilares Inegociáveis',
      sCatsEye: '03 — Taxonomia',
      sCatsTitle: '9 Categorias Universais',
      sCatsSub: 'Aplicadas identicamente a qualquer candidato em qualquer país.',
      footTagline: 'Registro histórico autenticado, fiel e permanente das promessas de campanha política.',
      footRecord: 'Nós não somos a verdade. Nós somos o registro.',
      footCopy: '© 2026 WorldContrast — Iniciativa independente. Dados em domínio público.',
      footNeutral: 'Zero viés · Zero contato · Zero agenda editorial',
    },
    en: {
      eyebrow: 'POCVA-01 · System Active',
      h1a: 'Elections',
      h1b: 'Candidates Promisses',
      h1c: 'Side by Side.',
      sub: 'Authenticated, faithful, and permanent historical record.',
      ctaRegistry: 'Access the Registry',
      ctaProtocol: 'POCVA-01 Protocol',
      ctaEnterprise: 'Enterprise Access →',
      c1label: 'SHA-256 Records',
      c2label: 'Active elections',
      c3label: 'Registered candidates',
      c4label: 'Algorithmic bias',
      sElecEye: '02 — Jurisdictions',
      sElecTitle: 'Select Jurisdiction',
      sPocvaEye: 'POCVA-01',
      sPocvaTitle: 'The Extraction Protocol',
      sEq: '[P] = [A] Actor + [V] Future Action Verb + [M] Measurable Target',
      sPocvaBody1: 'A statement is only registered as a promise if it satisfies all three components. The algorithm does not negotiate. The algorithm has no opinions. The algorithm is the answer.',
      sPocvaBody2: 'The SHA-256 hash of the prompt file is recorded alongside every extracted promise — irrefutable proof of which protocol version was active at the time of extraction.',
      sPillarsEye: '01 — Architecture',
      sPillarsTitle: 'The Eight Non-Negotiable Pillars',
      sCatsEye: '03 — Taxonomy',
      sCatsTitle: '9 Universal Categories',
      sCatsSub: 'Applied identically to every candidate in every country.',
      footTagline: 'Authenticated, faithful, and permanent historical record of political campaign promises.',
      footRecord: 'We are not the truth. We are the record.',
      footCopy: '© 2026 WorldContrast — Independent initiative. All data public domain.',
      footNeutral: 'Zero bias · Zero contact · Zero editorial agenda',
    },
    es: {
      eyebrow: 'POCVA-01 · Sistema Activo',
      h1a: 'Elecciones',
      h1b: 'Promesas de los candidatos',
      h1c: 'Comparadas'.
      sub: 'Registro histórico autenticado, fiel y permanente.',
      ctaRegistry: 'Acceder al Registro',
      ctaProtocol: 'Protocolo POCVA-01',
      ctaEnterprise: 'Acceso Enterprise →',
      c1label: 'Registros SHA-256',
      c2label: 'Elecciones activas',
      c3label: 'Candidatos registrados',
      c4label: 'Sesgo algorítmico',
      sElecEye: '02 — Jurisdicciones',
      sElecTitle: 'Seleccione la Jurisdicción',
      sPocvaEye: 'POCVA-01',
      sPocvaTitle: 'El Protocolo de Extracción',
      sEq: '[P] = [A] Actor + [V] Verbo de Acción Futura + [M] Objetivo Medible',
      sPocvaBody1: 'Una declaración sólo se registra como promesa si satisface los tres componentes. El algoritmo no negocia. El algoritmo no tiene opiniones. El algoritmo es la respuesta.',
      sPocvaBody2: 'El hash SHA-256 del archivo de prompt se registra junto con cada promesa extraída.',
      sPillarsEye: '01 — Arquitectura',
      sPillarsTitle: 'Los Ocho Pilares Innegociables',
      sCatsEye: '03 — Taxonomía',
      sCatsTitle: '9 Categorías Universales',
      sCatsSub: 'Aplicadas idénticamente a cualquier candidato en cualquier país.',
      footTagline: 'Registro histórico autenticado, fiel y permanente de las promesas de campaña política.',
      footRecord: 'No somos la verdad. Somos el registro.',
      footCopy: '© 2026 WorldContrast — Iniciativa independiente. Datos en dominio público.',
      footNeutral: 'Cero sesgo · Cero contacto · Cero agenda editorial',
    },
    fr: {
      eyebrow: 'POCVA-01 · Système Actif',
      h1a: 'Élections',
      h1b: 'Promesses des candidats',
      h1c: 'Côte à côte.',
      sub: 'Registre historique authentifié, fidèle et permanent.',
      ctaRegistry: 'Accéder au Registre',
      ctaProtocol: 'Protocole POCVA-01',
      ctaEnterprise: 'Accès Enterprise →',
      c1label: 'Enregistrements SHA-256',
      c2label: 'Élections actives',
      c3label: 'Candidats enregistrés',
      c4label: 'Biais algorithmique',
      sElecEye: '02 — Juridictions',
      sElecTitle: 'Sélectionner une Juridiction',
      sPocvaEye: 'POCVA-01',
      sPocvaTitle: "Le Protocole d'Extraction",
      sEq: '[P] = [A] Acteur + [V] Verbe d\'Action Future + [M] Cible Mesurable',
      sPocvaBody1: "Une déclaration n'est enregistrée comme promesse que si elle satisfait les trois composantes. L'algorithme ne négocie pas. L'algorithme n'a pas d'opinions. L'algorithme est la réponse.",
      sPocvaBody2: "Le hash SHA-256 du fichier de prompt est enregistré avec chaque promesse extraite.",
      sPillarsEye: '01 — Architecture',
      sPillarsTitle: 'Les Huit Piliers Innégociables',
      sCatsEye: '03 — Taxonomie',
      sCatsTitle: '9 Catégories Universelles',
      sCatsSub: 'Appliquées identiquement à chaque candidat dans chaque pays.',
      footTagline: 'Registre historique authentifié, fidèle et permanent des promesses de campagne politique.',
      footRecord: 'Nous ne sommes pas la vérité. Nous sommes le registre.',
      footCopy: '© 2026 WorldContrast — Initiative indépendante. Open source.',
      footNeutral: 'Zéro biais · Zéro contact · Zéro agenda éditorial',
    },
    de: {
      eyebrow: 'POCVA-01 · System Aktiv',
      h1a: 'Wahlen',
      h1b: 'Versprechen der Kandidaten',
      h1c: 'Seite an Seite.',
      sub: 'Authentifiziertes, getreues und permanentes historisches Register.',
      ctaRegistry: 'Register aufrufen',
      ctaProtocol: 'POCVA-01 Protokoll',
      ctaEnterprise: 'Enterprise-Zugang →',
      c1label: 'SHA-256 Datensätze',
      c2label: 'Aktive Wahlen',
      c3label: 'Registrierte Kandidaten',
      c4label: 'Algorithmische Voreingenommenheit',
      sElecEye: '02 — Zuständigkeiten',
      sElecTitle: 'Zuständigkeit auswählen',
      sPocvaEye: 'POCVA-01',
      sPocvaTitle: 'Das Extraktionsprotokoll',
      sEq: '[P] = [A] Akteur + [V] Zukünftiges Verb + [M] Messbares Ziel',
      sPocvaBody1: 'Eine Aussage wird nur dann als Versprechen registriert, wenn sie alle drei Komponenten erfüllt. Der Algorithmus verhandelt nicht. Der Algorithmus hat keine Meinungen.',
      sPocvaBody2: 'Der SHA-256-Hash der Prompt-Datei wird mit jedem extrahierten Versprechen registriert.',
      sPillarsEye: '01 — Architektur',
      sPillarsTitle: 'Die Acht Unnegotierbaren Säulen',
      sCatsEye: '03 — Taxonomie',
      sCatsTitle: '9 Universelle Kategorien',
      sCatsSub: 'Identisch auf jeden Kandidaten in jedem Land angewendet.',
      footTagline: 'Authentifiziertes, getreues und permanentes historisches Register.',
      footRecord: 'Wir sind nicht die Wahrheit. Wir sind das Register.',
      footCopy: '© 2026 WorldContrast — Unabhängige Initiative. Open Source.',
      footNeutral: 'Null Voreingenommenheit · Null Kontakt · Null Agenda',
    },
    ar: {
      eyebrow: 'POCVA-01 · النظام نشط',
      h1a: 'وعود',
      h1b: 'المرشحين —',
      h1c: 'جنباً إلى جنب.',
      sub: 'سجل تاريخي موثّق وأمين ودائم.',
      ctaRegistry: 'الوصول إلى السجل',
      ctaProtocol: 'بروتوكول POCVA-01',
      ctaEnterprise: '← وصول Enterprise',
      c1label: 'سجلات SHA-256',
      c2label: 'انتخابات نشطة',
      c3label: 'مرشحون مسجّلون',
      c4label: 'التحيز الخوارزمي',
      sElecEye: '02 — الولايات القضائية',
      sElecTitle: 'حدد الولاية القضائية',
      sPocvaEye: 'POCVA-01',
      sPocvaTitle: 'بروتوكول الاستخراج',
      sEq: '[P] = [A] فاعل + [V] فعل مستقبلي + [M] هدف قابل للقياس',
      sPocvaBody1: 'لا يُسجَّل بيان كوعد إلا إذا استوفى المكونات الثلاثة. الخوارزمية لا تتفاوض. الخوارزمية ليس لها آراء. الخوارزمية هي الإجابة.',
      sPocvaBody2: 'يتم تسجيل هاش SHA-256 لملف الـprompt مع كل وعد مستخرج.',
      sPillarsEye: '01 — البنية',
      sPillarsTitle: 'الركائز الثمانية غير القابلة للتفاوض',
      sCatsEye: '03 — التصنيف',
      sCatsTitle: '9 فئات عالمية',
      sCatsSub: 'تُطبق بشكل متطابق على كل مرشح في كل دولة.',
      footTagline: 'سجل تاريخي موثّق وأمين ودائم.',
      footRecord: 'لسنا الحقيقة. نحن السجل.',
      footCopy: '© 2026 WorldContrast — مبادرة مستقلة. مفتوح المصدر.',
      footNeutral: 'صفر تحيز · صفر اتصال · صفر أجندة',
    },
  }

  const c = copy[locale] ?? copy['en']
  const isRTL = locale === 'ar'

  const pillars = [
    { n:'[01]', t:{pt:'Neutralidade Editorial',en:'Editorial Neutrality',es:'Neutralidad Editorial',fr:'Neutralité Éditoriale',de:'Redaktionelle Neutralität',ar:'الحياد التحريري'}, d:{pt:'Sem opinião, sem interpretação. O registro é o único artefato.',en:'No opinion, no interpretation. The record is the only artifact.',es:'Sin opinión, sin interpretación. El registro es el único artefacto.',fr:'Sans opinion, sans interprétation. Le registre est le seul artefact.',de:'Keine Meinung, keine Interpretation.',ar:'لا رأي، لا تفسير.'} },
    { n:'[02]', t:{pt:'Equivalência Tecnológica',en:'Technological Equivalence',es:'Equivalencia Tecnológica',fr:'Équivalence Technologique',de:'Technologische Äquivalenz',ar:'التكافؤ التكنولوجي'}, d:{pt:'Limites idênticos para todo ator político. Simetria algorítmica absoluta.',en:'Identical limits for every political actor. Absolute algorithmic symmetry.',es:'Límites idénticos para cada actor político.',fr:'Limites identiques. Symétrie algorithmique absolue.',de:'Identische Grenzen für jeden Akteur.',ar:'حدود متطابقة لكل فاعل.'} },
    { n:'[03]', t:{pt:'Auditoria Pública Permanente',en:'Permanent Public Audit',es:'Auditoría Pública Permanente',fr:'Audit Public Permanent',de:'Permanente öffentliche Prüfung',ar:'تدقيق عام دائم'}, d:{pt:'Toda declaração lacrada. Toda rejeição registrada publicamente.',en:'Every statement sealed. Every rejection publicly logged.',es:'Cada declaración sellada. Cada rechazo registrado.',fr:'Chaque déclaration scellée. Chaque rejet enregistré.',de:'Jede Aussage versiegelt. Jede Ablehnung protokolliert.',ar:'كل بيان مختوم. كل رفض مسجل.'} },
    { n:'[04]', t:{pt:'Acesso Direto Sem Barreiras',en:'Direct Access Without Barriers',es:'Acceso Directo Sin Barreras',fr:'Accès Direct Sans Barrières',de:'Direkter Zugang ohne Barrieren',ar:'وصول مباشر بلا حواجز'}, d:{pt:'Ver as promessas lado a lado é serviço fundamental. Zero cadastro. Zero paywall.',en:'Viewing promises side by side is fundamental. Zero registration. Zero paywall.',es:'Ver promesas lado a lado es fundamental. Sin registro. Sin paywall.',fr:'Voir côte à côte est fondamental. Zéro inscription. Zéro paywall.',de:'Nebeneinander sehen ist fundamental. Null Registrierung.',ar:'رؤية الوعود جنباً إلى جنب أمر أساسي.'} },
    { n:'[05]', t:{pt:'Rastreabilidade Documental',en:'Documentary Traceability',es:'Trazabilidad Documental',fr:'Traçabilité Documentaire',de:'Dokumentarische Nachvollziehbarkeit',ar:'إمكانية التتبع'}, d:{pt:'Nenhum registro sem URL exata, timestamp e SHA-256. Proveniência é o produto.',en:'No record without exact URL, timestamp, and SHA-256. Provenance is the product.',es:'Ningún registro sin URL exacta, timestamp y SHA-256.',fr:'Aucun enregistrement sans URL exacte et SHA-256.',de:'Kein Datensatz ohne URL, Zeitstempel und SHA-256.',ar:'لا سجل بدون URL دقيق وطابع زمني.'} },
    { n:'[06]', t:{pt:'Independência Política',en:'Political Independence',es:'Independencia Política',fr:'Indépendance Politique',de:'Politische Unabhängigkeit',ar:'الاستقلال السياسي'}, d:{pt:'Zero comunicação com campanhas. Zero financiamento político.',en:'Zero communication with campaigns. Zero political funding.',es:'Cero comunicación con campañas. Cero financiación.',fr:'Zéro communication. Zéro financement politique.',de:'Null Kommunikation. Null politische Finanzierung.',ar:'صفر تواصل. صفر تمويل.'} },
    { n:'[07]', t:{pt:'Infraestrutura Aberta',en:'Open Infrastructure',es:'Infraestructura Abierta',fr:'Infrastructure Ouverte',de:'Offene Infrastruktur',ar:'البنية المفتوحة'}, d:{pt:'Código e protocolo POCVA-01 em AGPL v3.0. Qualquer um pode auditar.',en:'Code and POCVA-01 protocol under AGPL v3.0. Anyone can audit.',es:'Código y protocolo bajo AGPL v3.0. Cualquiera puede auditar.',fr:'Code et protocole sous AGPL v3.0. Chacun peut auditer.',de:'Code unter AGPL v3.0. Jeder kann prüfen.',ar:'الكود تحت AGPL v3.0. يمكن للجميع التدقيق.'} },
    { n:'[08]', t:{pt:'Zero Interferência Comercial',en:'Zero Commercial Interference',es:'Cero Interferencia Comercial',fr:'Zéro Interférence Commerciale',de:'Null Kommerzielle Einmischung',ar:'انعدام التدخل التجاري'}, d:{pt:'Nenhuma transação distorce visibilidade. Receita da API subsidia o acesso gratuito.',en:'No transaction distorts visibility. API revenue subsidizes free access.',es:'Ninguna transacción distorsiona la visibilidad.',fr:'Aucune transaction ne distord la visibilité.',de:'Keine Transaktion verzerrt die Sichtbarkeit.',ar:'لا معاملة تشوّه الرؤية.'} },
  ]

  const cats = [
    {emoji:'💰',pt:'Economia & Fiscal',en:'Economy & Fiscal',es:'Economía & Fiscal',fr:'Économie & Fiscal',de:'Wirtschaft',ar:'الاقتصاد'},
    {emoji:'📚',pt:'Educação & Cultura',en:'Education & Culture',es:'Educación & Cultura',fr:'Éducation & Culture',de:'Bildung',ar:'التعليم'},
    {emoji:'🏥',pt:'Saúde & Saneamento',en:'Health & Sanitation',es:'Salud & Saneamiento',fr:'Santé',de:'Gesundheit',ar:'الصحة'},
    {emoji:'⚖️',pt:'Segurança & Justiça',en:'Safety & Justice',es:'Seguridad & Justicia',fr:'Sécurité & Justice',de:'Sicherheit',ar:'الأمن'},
    {emoji:'🌿',pt:'Meio Ambiente & Clima',en:'Environment & Climate',es:'Medio Ambiente & Clima',fr:'Environnement & Climat',de:'Umwelt',ar:'البيئة'},
    {emoji:'🤝',pt:'Assistência Social',en:'Social Assistance',es:'Asistencia Social',fr:'Assistance Sociale',de:'Soziales',ar:'الرعاية'},
    {emoji:'🏛️',pt:'Direitos Humanos',en:'Human Rights',es:'Derechos Humanos',fr:'Droits Humains',de:'Menschenrechte',ar:'حقوق الإنسان'},
    {emoji:'🏗️',pt:'Infraestrutura',en:'Infrastructure',es:'Infraestructura',fr:'Infrastructure',de:'Infrastruktur',ar:'البنية التحتية'},
    {emoji:'⚙️',pt:'Governança & Reforma',en:'Governance & Reform',es:'Gobernanza & Reforma',fr:'Gouvernance',de:'Regierungsführung',ar:'الحوكمة'},
  ]

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           WORLD CONTRAST v16 — "QUIET LUXURY"
           Director of Art: Generous negative space.
           Typographic rhythm. Platinum on Onyx.
           Borders only for data separation.
           ═══════════════════════════════════════════════════ */

        :root {
          /* Palette */
          --onyx:       #0A0A0B;
          --onyx-2:     #111113;
          --onyx-3:     #18181B;
          --onyx-hover: #141416;
          --onyx-sheet: #161618;
          --platinum:   #E4E4E7;      /* never #FFF — reduces eye strain */
          --plat-muted: #71717A;
          --plat-faint: #3F3F46;
          --gold:       #C8A96E;
          --gold-dim:   rgba(200,169,110,0.10);
          --gold-bdr:   rgba(200,169,110,0.30);
          --emerald:    #10B981;
          --rule-soft:  rgba(255,255,255,0.07);
          --rule-faint: rgba(255,255,255,0.04);

          /* Typography */
          --font-display: 'IBM Plex Sans', system-ui, sans-serif;
          --font-mono:    'IBM Plex Mono', 'Courier New', monospace;

          /* Spacing — generous */
          --px:          clamp(24px, 6vw, 96px);
          --section-gap: clamp(96px, 14vw, 160px);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wc-root {
          font-family: var(--font-display);
          background: var(--onyx);
          color: var(--platinum);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── HEADER ──────────────────────────────────────── */
        .wc-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px;
          display: flex; align-items: center;
          padding: 0 var(--px);
          gap: 20px;
          background: rgba(10,10,11,0.90);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid var(--rule-faint);
        }
        .wc-logo {
          font-size: 14px; font-weight: 700;
          letter-spacing: -0.3px; color: var(--platinum);
          white-space: nowrap;
        }
        .wc-logo-gold { color: var(--gold); }
        .wc-header-status {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--emerald);
          display: flex; align-items: center; gap: 6px;
        }
        .pulse-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--emerald);
          animation: blink 2.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .wc-header-spacer { flex: 1; }
        .wc-header-ent {
          font-family: var(--font-mono); font-size: 9px;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--gold);
          border: 1px solid var(--gold-bdr);
          padding: 7px 14px; border-radius: 2px;
          text-decoration: none; white-space: nowrap;
          transition: background 0.18s;
        }
        .wc-header-ent:hover { background: var(--gold-dim); }

        /* ── HERO ────────────────────────────────────────── */
        .wc-hero {
          padding-top: 60px; /* fixed header */
          min-height: 100svh;
          display: flex; flex-direction: column;
          justify-content: center;
          padding-left: var(--px); padding-right: var(--px);
          position: relative;
        }

        /* Subtle grid — architectural texture */
        .wc-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        /* Gold ambient top-right */
        .wc-hero::after {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 50%; height: 50%;
          background: radial-gradient(ellipse at top right,
            rgba(200,169,110,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero-inner { position: relative; z-index: 1; }

        .hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 3.5px;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 40px;
          display: flex; align-items: center; gap: 8px;
        }
        .hero-eyebrow::before {
          content: ''; display: inline-block;
          width: 24px; height: 1px; background: var(--gold);
          opacity: 0.5;
        }

        /* Typographic scale — the central statement */
        .hero-h1 {
          font-size: clamp(52px, 9vw, 120px);
          font-weight: 800;
          color: var(--platinum);
          line-height: 0.92;
          letter-spacing: -3px;
          margin-bottom: 4px;
        }
        .hero-h1-light {
          font-size: clamp(52px, 9vw, 120px);
          font-weight: 200;
          color: var(--plat-muted);
          line-height: 0.92;
          letter-spacing: -3px;
          margin-bottom: 4px;
        }
        .hero-h1-accent {
          font-size: clamp(52px, 9vw, 120px);
          font-weight: 800;
          color: var(--gold);
          line-height: 0.92;
          letter-spacing: -3px;
          margin-bottom: 64px;
        }

        .hero-sub {
          font-size: clamp(13px, 1.6vw, 16px);
          font-weight: 300;
          color: var(--plat-muted);
          line-height: 1.9;
          max-width: 480px;
          margin-bottom: 56px;
          letter-spacing: 0.01em;
        }

        /* ── COUNTERS ────────────────────────────────────── */
        .hero-counters {
          display: flex; gap: 0;
          border-top: 1px solid var(--rule-soft);
          border-bottom: 1px solid var(--rule-soft);
          margin-bottom: 56px;
          max-width: 640px;
        }
        .counter {
          flex: 1; padding: 28px 0;
          padding-right: 32px;
        }
        .counter + .counter {
          padding-left: 32px;
          border-left: 1px solid var(--rule-faint);
        }
        @media(max-width: 560px) {
          .hero-counters { flex-wrap: wrap; }
          .counter { flex: 0 0 50%; }
          .counter:nth-child(3) { border-left: none; padding-left: 0; }
          .counter:nth-child(3),
          .counter:nth-child(4) { border-top: 1px solid var(--rule-faint); padding-top: 28px; }
        }
        .ctr-val {
          font-size: clamp(32px, 4.5vw, 52px);
          font-weight: 800; color: var(--platinum);
          line-height: 1; letter-spacing: -2px;
          margin-bottom: 6px;
        }
        .ctr-val.gold    { color: var(--gold); }
        .ctr-val.emerald { color: var(--emerald); }
        .ctr-suffix { font-size: 0.45em; font-weight: 300; vertical-align: super; color: var(--gold); }
        .ctr-label {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--plat-faint);
        }

        /* ── CTA ROW ─────────────────────────────────────── */
        .hero-ctas {
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .btn-primary {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          background: var(--gold); color: var(--onyx);
          border: none; padding: 16px 28px; cursor: pointer;
          border-radius: 2px; text-decoration: none;
          display: inline-flex; align-items: center;
          min-height: 52px; transition: opacity 0.18s;
          white-space: nowrap;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-ghost {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 400;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--plat-muted);
          background: transparent;
          border: 1px solid var(--rule-soft);
          padding: 15px 24px; cursor: pointer; border-radius: 2px;
          text-decoration: none; display: inline-flex;
          align-items: center; min-height: 52px;
          transition: border-color 0.18s, color 0.18s;
          white-space: nowrap;
        }
        .btn-ghost:hover { border-color: var(--plat-faint); color: var(--platinum); }

        /* ── SECTION SCAFFOLD ────────────────────────────── */
        .wc-sec {
          padding: var(--section-gap) var(--px);
        }
        .wc-sec.alt { background: var(--onyx-2); }
        .wc-sec.alt2 { background: var(--onyx-3); }

        .sec-divider { border: none; border-top: 1px solid var(--rule-faint); }

        .sec-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 3.5px;
          text-transform: uppercase; color: var(--gold);
          opacity: 0.7; margin-bottom: 16px;
        }
        .sec-title {
          font-size: clamp(24px, 3.5vw, 44px);
          font-weight: 700; color: var(--platinum);
          letter-spacing: -0.8px;
          margin-bottom: clamp(56px, 8vw, 96px);
          line-height: 1.1;
        }
        .sec-title-sub {
          display: block;
          font-size: clamp(13px, 1.5vw, 16px);
          font-weight: 300; color: var(--plat-muted);
          letter-spacing: 0; margin-top: 10px;
          line-height: 1.9;
        }

        /* ── PILLARS ─────────────────────────────────────── */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        @media(max-width: 900px) { .pillars-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width: 480px) { .pillars-grid { grid-template-columns: 1fr; } }

        .pillar {
          padding: 40px 32px;
          border-right: 1px solid var(--rule-faint);
          border-bottom: 1px solid var(--rule-faint);
          transition: background 0.22s;
        }
        .pillar:nth-child(4n) { border-right: none; }
        @media(max-width:900px) {
          .pillar:nth-child(2n) { border-right: none; }
        }
        @media(max-width:480px) {
          .pillar { border-right: none; }
        }
        .pillar:hover { background: var(--onyx-3); }
        .p-num {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 2px;
          color: var(--gold); opacity: 0.6;
          margin-bottom: 20px;
        }
        .p-title {
          font-size: 15px; font-weight: 600;
          color: var(--platinum); margin-bottom: 12px;
          line-height: 1.3;
        }
        .p-desc {
          font-size: 12px; font-weight: 300;
          color: var(--plat-muted); line-height: 1.9;
        }

        /* ── POCVA BAND ──────────────────────────────────── */
        .pocva-inner {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: clamp(48px, 8vw, 120px);
          align-items: start;
        }
        @media(max-width: 768px) {
          .pocva-inner { grid-template-columns: 1fr; }
        }
        .pocva-eq {
          font-family: var(--font-mono);
          font-size: clamp(11px, 1.8vw, 16px);
          color: var(--platinum);
          line-height: 2.2; letter-spacing: 0.5px;
          margin-bottom: 48px;
        }
        .pocva-eq .gold    { color: var(--gold); }
        .pocva-eq .emerald { color: var(--emerald); }
        .pocva-body {
          font-size: clamp(13px, 1.5vw, 15px);
          font-weight: 300; color: var(--plat-muted);
          line-height: 1.9;
        }
        .pocva-body + .pocva-body { margin-top: 24px; }

        /* ── CATEGORIES ──────────────────────────────────── */
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0;
          border-top: 1px solid var(--rule-faint);
          border-left: 1px solid var(--rule-faint);
        }
        @media(max-width: 900px) { .cats-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width: 480px) { .cats-grid { grid-template-columns: repeat(3,1fr); } }

        .cat-box {
          padding: 28px 12px;
          text-align: center;
          border-right: 1px solid var(--rule-faint);
          border-bottom: 1px solid var(--rule-faint);
          transition: background 0.18s;
        }
        .cat-box:hover { background: var(--onyx-3); }
        .cat-emoji { font-size: 20px; display: block; margin-bottom: 10px; }
        .cat-name {
          font-family: var(--font-mono); font-size: 8px;
          letter-spacing: 0.5px; color: var(--plat-faint);
          line-height: 1.5;
        }

        /* ── FOOTER ──────────────────────────────────────── */
        .wc-footer {
          padding: var(--section-gap) var(--px)
                   clamp(32px, 4vw, 48px);
          border-top: 1px solid var(--rule-faint);
        }
        .foot-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 64px;
          padding-bottom: 64px;
          border-bottom: 1px solid var(--rule-faint);
          margin-bottom: 32px;
        }
        @media(max-width: 768px) {
          .foot-top { grid-template-columns: 1fr; gap: 40px; }
        }
        .foot-brand {
          font-size: 16px; font-weight: 700;
          color: var(--platinum); margin-bottom: 12px;
        }
        .foot-brand-gold { color: var(--gold); }
        .foot-tagline {
          font-size: 13px; font-weight: 300;
          color: var(--plat-muted); line-height: 1.9;
          max-width: 300px;
        }
        .foot-record {
          font-family: var(--font-mono); font-size: 9px;
          color: var(--gold); margin-top: 16px;
          letter-spacing: 0.5px; opacity: 0.6;
        }
        .foot-col-label {
          font-family: var(--font-mono); font-size: 8px;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--gold); opacity: 0.6; margin-bottom: 20px;
        }
        .foot-links { list-style: none; }
        .foot-links li { margin-bottom: 0; }
        .foot-links a {
          font-size: 13px; font-weight: 300;
          color: var(--plat-muted); text-decoration: none;
          display: block; padding: 8px 0;
          border-bottom: 1px solid var(--rule-faint);
          transition: color 0.18s;
        }
        .foot-links a:hover { color: var(--platinum); }
        .foot-links li:last-child a { border-bottom: none; }
        .foot-bottom {
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .foot-copy {
          font-family: var(--font-mono); font-size: 9px;
          color: var(--plat-faint); letter-spacing: 0.04em;
        }
        .foot-neutral {
          font-family: var(--font-mono); font-size: 9px;
          color: var(--plat-faint); display: flex;
          align-items: center; gap: 8px;
        }
        .gold-pip {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--gold); opacity: 0.5;
        }
      `}</style>

      <div className="wc-root" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── FIXED HEADER ─────────────────────────────── */}
        <header className="wc-header">
          <div className="wc-logo">
            World<span className="wc-logo-gold">Contrast</span>
          </div>
          <div className="wc-header-status">
            <div className="pulse-dot" aria-hidden="true" />
            {c.eyebrow}
          </div>
          <div className="wc-header-spacer" />
          <Link href={`/${locale}/enterprise`} className="wc-header-ent">
            {c.ctaEnterprise}
          </Link>
        </header>

        {/* ── HERO — DATA-FIRST ──────────────────────────── */}
        <section className="wc-hero" aria-label="Registry overview">
          <div className="hero-inner">

            <p className="hero-eyebrow">{c.h1a}</p>

            <div className="hero-h1">{c.h1b}</div>
            <div className="hero-h1-accent">{c.h1c}</div>

            <p className="hero-sub">{c.sub}</p>

            {/* Live counters */}
            <div className="hero-counters" role="region" aria-label="System metrics">
              <div className="counter">
                <div className="ctr-val gold">
                  {totalPromises}<span className="ctr-suffix">+</span>
                </div>
                <div className="ctr-label">{c.c1label}</div>
              </div>
              <div className="counter">
                <div className="ctr-val">{totalElections}</div>
                <div className="ctr-label">{c.c2label}</div>
              </div>
              <div className="counter">
                <div className="ctr-val">{totalCandidates}</div>
                <div className="ctr-label">{c.c3label}</div>
              </div>
              <div className="counter">
                <div className="ctr-val emerald">0<span className="ctr-suffix">%</span></div>
                <div className="ctr-label">{c.c4label}</div>
              </div>
            </div>

            <div className="hero-ctas">
              {elections[0] && (
                <Link
                  href={`/${locale}/compare/${elections[0].id}`}
                  className="btn-primary"
                >
                  {c.ctaRegistry}
                </Link>
              )}
              <a href="#pocva" className="btn-ghost">{c.ctaProtocol}</a>
            </div>

          </div>
        </section>

        {/* ── ELECTIONS — THE DATA ───────────────────────── */}
        <section className="wc-sec alt" id="elections" aria-label={c.sElecTitle}>
          <p className="sec-eyebrow">{c.sElecEye}</p>
          <h2 className="sec-title">{c.sElecTitle}</h2>
          <ElectionGrid elections={elections} locale={locale} />
        </section>

        {/* ── POCVA-01 ───────────────────────────────────── */}
        <section className="wc-sec" id="pocva" aria-label={c.sPocvaTitle}>
          <p className="sec-eyebrow">{c.sPocvaEye}</p>
          <h2 className="sec-title">{c.sPocvaTitle}</h2>
          <div className="pocva-inner">
            <div>
              <div className="pocva-eq">
                <span className="emerald">[P]</span>
                {' = '}
                <span className="gold">[A]</span>
                {' Ator\n+ '}
                <span className="gold">[V]</span>
                {' Verbo de Ação Futura\n+ '}
                <span className="gold">[M]</span>
                {' Alvo Mensurável'}
              </div>
            </div>
            <div>
              <p className="pocva-body">{c.sPocvaBody1}</p>
              <p className="pocva-body">{c.sPocvaBody2}</p>
            </div>
          </div>
        </section>

        {/* ── PILLARS ────────────────────────────────────── */}
        <section className="wc-sec alt" aria-label={c.sPillarsTitle}>
          <p className="sec-eyebrow">{c.sPillarsEye}</p>
          <h2 className="sec-title">{c.sPillarsTitle}</h2>
          <div className="pillars-grid">
            {pillars.map(p => (
              <div key={p.n} className="pillar">
                <p className="p-num">{p.n}</p>
                <h3 className="p-title">
                  {(p.t as any)[locale] || p.t['en']}
                </h3>
                <p className="p-desc">
                  {(p.d as any)[locale] || p.d['en']}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ─────────────────────────────────── */}
        <section className="wc-sec alt2" aria-label={c.sCatsTitle}>
          <p className="sec-eyebrow">{c.sCatsEye}</p>
          <h2 className="sec-title">
            {c.sCatsTitle}
            <span className="sec-title-sub">{c.sCatsSub}</span>
          </h2>
          <div className="cats-grid">
            {cats.map((cat, i) => (
              <div key={i} className="cat-box">
                <span className="cat-emoji" aria-hidden="true">{cat.emoji}</span>
                <p className="cat-name">
                  {(cat as any)[locale] || cat['en']}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────── */}
        <footer className="wc-footer" role="contentinfo">
          <div className="foot-top">
            <div>
              <div className="foot-brand">
                World<span className="foot-brand-gold">Contrast</span>
              </div>
              <p className="foot-tagline">{c.footTagline}</p>
              <p className="foot-record">{c.footRecord}</p>
            </div>
            <div>
              <p className="foot-col-label">
                {locale === 'pt' ? 'Plataforma' : 'Platform'}
              </p>
              <ul className="foot-links">
                <li><a href="#pocva">{c.ctaProtocol}</a></li>
                <li><a href="#elections">{c.sElecTitle}</a></li>
                <li><a href="#">Open Data / REST API</a></li>
                <li>
                  <Link href={`/${locale}/enterprise`}>
                    {c.ctaEnterprise}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="foot-col-label">
                {locale === 'pt' ? 'Institucional' : 'Institutional'}
              </p>
              <ul className="foot-links">
                <li>
                  <a href="https://github.com/worldcontrast/promises"
                     target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                  </a>
                </li>
                <li><a href="#">AGPL v3.0 License</a></li>
                <li><a href="#">Audit Logs</a></li>
                <li><a href="#">TERMS_API.md</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <p className="foot-copy">{c.footCopy}</p>
            <div className="foot-neutral">
              <div className="gold-pip" aria-hidden="true" />
              {c.footNeutral}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
