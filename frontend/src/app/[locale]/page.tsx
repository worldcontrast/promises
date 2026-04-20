/**
 * World Contrast — Homepage v15.0
 * File: frontend/src/app/[locale]/page.tsx
 *
 * Design System: "Cryptographic Notary" — Onyx / Platinum / Emerald
 * Architecture: Data-First, Thumb Zone Ready, App-Scaffold
 *
 * BANNED WORDS: verdade · espelho · julgamento · comparar
 * TONE: Institutional. Analytical. Zero marketing rhetoric.
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

  const elections = await getAllElections()
  const totalElections  = elections.length
  const totalPromises   = elections.reduce((s, e) => s + e.promiseCount, 0)
  const totalCandidates = elections.reduce((s, e) => s + e.candidateCount, 0)

  const copy: Record<string, any> = {
    pt: {
      systemLabel: 'POCVA-01 · Sistema Ativo',
      registryLabel: 'O Registro Global de Promessas Políticas',
      searchPlaceholder: 'Buscar país, eleição ou candidato...',
      filterAll: 'Todas as jurisdições',
      filterActive: 'Ativas',
      filterScheduled: 'Agendadas',
      counterPromises: 'Registros SHA-256',
      counterElections: 'Eleições ativas',
      counterCountries: 'Países monitorados',
      counterBias: 'Viés algorítmico',
      sectionLabel: 'Jurisdições',
      promisesUnit: 'registros',
      candidatesUnit: 'candidatos',
      compareBtn: 'Acessar Registro →',
      liveTag: 'AO VIVO',
      scheduledTag: 'AGENDADO',
      closedTag: 'ENCERRADO',
      manifestoBtn: 'Protocolo POCVA-01',
      enterpriseBtn: 'Acesso Enterprise →',
      pillarTitle: 'Os Oito Pilares Inegociáveis',
      pillarSub: 'Matriz de Fundação do Sistema',
      catTitle: '9 Categorias Universais',
      catSub: 'Aplicadas identicamente a qualquer candidato em qualquer país',
      footTagline: 'Registro histórico autenticado, fiel e permanente.',
      footRecord: 'Nós não somos a verdade. Nós somos o registro.',
      footCopy: '© 2026 WorldContrast — Iniciativa independente. Dados em domínio público.',
      footNeutral: 'Zero viés · Zero contato · Zero agenda editorial',
    },
    en: {
      systemLabel: 'POCVA-01 · System Active',
      registryLabel: 'The Global Registry of Political Promises',
      searchPlaceholder: 'Search country, election or candidate...',
      filterAll: 'All jurisdictions',
      filterActive: 'Active',
      filterScheduled: 'Scheduled',
      counterPromises: 'SHA-256 Records',
      counterElections: 'Active elections',
      counterCountries: 'Countries monitored',
      counterBias: 'Algorithmic bias',
      sectionLabel: 'Jurisdictions',
      promisesUnit: 'records',
      candidatesUnit: 'candidates',
      compareBtn: 'Access Registry →',
      liveTag: 'LIVE',
      scheduledTag: 'SCHEDULED',
      closedTag: 'CLOSED',
      manifestoBtn: 'POCVA-01 Protocol',
      enterpriseBtn: 'Enterprise Access →',
      pillarTitle: 'The Eight Non-Negotiable Pillars',
      pillarSub: 'System Foundation Matrix',
      catTitle: '9 Universal Categories',
      catSub: 'Applied identically to every candidate in every country',
      footTagline: 'Authenticated, faithful, and permanent historical record.',
      footRecord: 'We are not the truth. We are the record.',
      footCopy: '© 2026 WorldContrast — Independent initiative. All data public domain.',
      footNeutral: 'Zero bias · Zero contact · Zero editorial agenda',
    },
    es: {
      systemLabel: 'POCVA-01 · Sistema Activo',
      registryLabel: 'El Registro Global de Promesas Políticas',
      searchPlaceholder: 'Buscar país, elección o candidato...',
      filterAll: 'Todas las jurisdicciones',
      filterActive: 'Activas',
      filterScheduled: 'Programadas',
      counterPromises: 'Registros SHA-256',
      counterElections: 'Elecciones activas',
      counterCountries: 'Países monitoreados',
      counterBias: 'Sesgo algorítmico',
      sectionLabel: 'Jurisdicciones',
      promisesUnit: 'registros',
      candidatesUnit: 'candidatos',
      compareBtn: 'Acceder al Registro →',
      liveTag: 'EN VIVO',
      scheduledTag: 'PROGRAMADO',
      closedTag: 'CERRADO',
      manifestoBtn: 'Protocolo POCVA-01',
      enterpriseBtn: 'Acceso Enterprise →',
      pillarTitle: 'Los Ocho Pilares Innegociables',
      pillarSub: 'Matriz de Fundación del Sistema',
      catTitle: '9 Categorías Universales',
      catSub: 'Aplicadas idénticamente a cualquier candidato en cualquier país',
      footTagline: 'Registro histórico autenticado, fiel y permanente.',
      footRecord: 'No somos la verdad. Somos el registro.',
      footCopy: '© 2026 WorldContrast — Iniciativa independiente. Datos en dominio público.',
      footNeutral: 'Cero sesgo · Cero contacto · Cero agenda editorial',
    },
    fr: {
      systemLabel: 'POCVA-01 · Système Actif',
      registryLabel: 'Le Registre Mondial des Promesses Politiques',
      searchPlaceholder: 'Rechercher pays, élection ou candidat...',
      filterAll: 'Toutes les juridictions',
      filterActive: 'Actives',
      filterScheduled: 'Planifiées',
      counterPromises: 'Enregistrements SHA-256',
      counterElections: 'Élections actives',
      counterCountries: 'Pays surveillés',
      counterBias: 'Biais algorithmique',
      sectionLabel: 'Juridictions',
      promisesUnit: 'enregistrements',
      candidatesUnit: 'candidats',
      compareBtn: 'Accéder au Registre →',
      liveTag: 'EN DIRECT',
      scheduledTag: 'PLANIFIÉ',
      closedTag: 'TERMINÉ',
      manifestoBtn: 'Protocole POCVA-01',
      enterpriseBtn: 'Accès Enterprise →',
      pillarTitle: 'Les Huit Piliers Innégociables',
      pillarSub: 'Matrice de Fondation du Système',
      catTitle: '9 Catégories Universelles',
      catSub: 'Appliquées identiquement à chaque candidat dans chaque pays',
      footTagline: 'Registre historique authentifié, fidèle et permanent.',
      footRecord: 'Nous ne sommes pas la vérité. Nous sommes le registre.',
      footCopy: '© 2026 WorldContrast — Initiative indépendante. Données en open source.',
      footNeutral: 'Zéro biais · Zéro contact · Zéro agenda éditorial',
    },
    de: {
      systemLabel: 'POCVA-01 · System Aktiv',
      registryLabel: 'Das Globale Register Politischer Versprechen',
      searchPlaceholder: 'Land, Wahl oder Kandidat suchen...',
      filterAll: 'Alle Zuständigkeiten',
      filterActive: 'Aktive',
      filterScheduled: 'Geplante',
      counterPromises: 'SHA-256 Datensätze',
      counterElections: 'Aktive Wahlen',
      counterCountries: 'Länder überwacht',
      counterBias: 'Algorithmische Voreingenommenheit',
      sectionLabel: 'Zuständigkeiten',
      promisesUnit: 'Datensätze',
      candidatesUnit: 'Kandidaten',
      compareBtn: 'Register aufrufen →',
      liveTag: 'LIVE',
      scheduledTag: 'GEPLANT',
      closedTag: 'ABGESCHLOSSEN',
      manifestoBtn: 'POCVA-01 Protokoll',
      enterpriseBtn: 'Enterprise-Zugang →',
      pillarTitle: 'Die Acht Unnegotierbaren Säulen',
      pillarSub: 'System-Grundlagenmatrix',
      catTitle: '9 Universelle Kategorien',
      catSub: 'Identisch auf jeden Kandidaten in jedem Land angewendet',
      footTagline: 'Authentifiziertes, getreues und permanentes historisches Register.',
      footRecord: 'Wir sind nicht die Wahrheit. Wir sind das Register.',
      footCopy: '© 2026 WorldContrast — Unabhängige Initiative. Alle Daten Open Source.',
      footNeutral: 'Null Voreingenommenheit · Null Kontakt · Null Agenda',
    },
    ar: {
      systemLabel: 'POCVA-01 · النظام نشط',
      registryLabel: 'السجل العالمي للوعود السياسية',
      searchPlaceholder: 'ابحث عن دولة أو انتخابات أو مرشح...',
      filterAll: 'جميع الولايات القضائية',
      filterActive: 'نشطة',
      filterScheduled: 'مجدولة',
      counterPromises: 'سجلات SHA-256',
      counterElections: 'انتخابات نشطة',
      counterCountries: 'دول مراقبة',
      counterBias: 'التحيز الخوارزمي',
      sectionLabel: 'الولايات القضائية',
      promisesUnit: 'سجل',
      candidatesUnit: 'مرشح',
      compareBtn: 'الوصول إلى السجل ←',
      liveTag: 'مباشر',
      scheduledTag: 'مجدول',
      closedTag: 'مغلق',
      manifestoBtn: 'بروتوكول POCVA-01',
      enterpriseBtn: '← وصول Enterprise',
      pillarTitle: 'الركائز الثمانية غير القابلة للتفاوض',
      pillarSub: 'مصفوفة تأسيس النظام',
      catTitle: '9 فئات عالمية',
      catSub: 'تُطبق بشكل متطابق على كل مرشح في كل دولة',
      footTagline: 'سجل تاريخي موثّق وأمين ودائم.',
      footRecord: 'لسنا الحقيقة. نحن السجل.',
      footCopy: '© 2026 WorldContrast — مبادرة مستقلة. جميع البيانات مفتوحة المصدر.',
      footNeutral: 'صفر تحيز · صفر اتصال · صفر أجندة',
    },
  }

  const c = copy[locale] ?? copy['en']
  const isRTL = locale === 'ar'

  const pillars = [
    { n: '[01]', t: { pt:'Neutralidade Editorial', en:'Editorial Neutrality', es:'Neutralidad Editorial', fr:'Neutralité Éditoriale', de:'Redaktionelle Neutralität', ar:'الحياد التحريري' }, d: { pt:'Sem opinião, sem interpretação. O registro é o único artefato.', en:'No opinion, no interpretation. The record is the only artifact.', es:'Sin opinión, sin interpretación. El registro es el único artefacto.', fr:'Sans opinion, sans interprétation. Le registre est le seul artefact.', de:'Keine Meinung, keine Interpretation.', ar:'لا رأي، لا تفسير. السجل هو الأداة الوحيدة.' } },
    { n: '[02]', t: { pt:'Equivalência Tecnológica', en:'Technological Equivalence', es:'Equivalencia Tecnológica', fr:'Équivalence Technologique', de:'Technologische Äquivalenz', ar:'التكافؤ التكنولوجي' }, d: { pt:'Limites idênticos para todo ator político. Simetria algorítmica absoluta.', en:'Identical limits for every political actor. Absolute algorithmic symmetry.', es:'Límites idénticos para cada actor. Simetría algorítmica absoluta.', fr:'Limites identiques pour chaque acteur. Symétrie algorithmique absolue.', de:'Identische Grenzen für jeden Akteur. Absolute algorithmische Symmetrie.', ar:'حدود متطابقة لكل فاعل سياسي.' } },
    { n: '[03]', t: { pt:'Auditoria Pública Permanente', en:'Permanent Public Audit', es:'Auditoría Pública Permanente', fr:'Audit Public Permanent', de:'Permanente öffentliche Prüfung', ar:'تدقيق عام دائم' }, d: { pt:'Toda declaração lacrada no registro. Toda rejeição registrada publicamente.', en:'Every statement sealed in the record. Every rejection publicly logged.', es:'Cada declaración sellada. Cada rechazo registrado públicamente.', fr:'Chaque déclaration scellée. Chaque rejet enregistré publiquement.', de:'Jede Aussage versiegelt. Jede Ablehnung öffentlich protokolliert.', ar:'كل بيان مختوم. كل رفض مسجل علنًا.' } },
    { n: '[04]', t: { pt:'Acesso Direto Sem Barreiras', en:'Direct Access Without Barriers', es:'Acceso Directo Sin Barreras', fr:'Accès Direct Sans Barrières', de:'Direkter Zugang ohne Barrieren', ar:'وصول مباشر بلا حواجز' }, d: { pt:'Ver as promessas lado a lado é serviço fundamental. Sem cadastro. Sem paywall.', en:'Viewing promises side by side is a fundamental service. No registration. No paywall.', es:'Ver promesas lado a lado es servicio fundamental. Sin registro. Sin paywall.', fr:'Voir les promesses côte à côte est un service fondamental. Sans barrières.', de:'Versprechen nebeneinander sehen ist ein grundlegender Service.', ar:'رؤية الوعود جنباً إلى جنب خدمة أساسية.' } },
    { n: '[05]', t: { pt:'Rastreabilidade Documental', en:'Documentary Traceability', es:'Trazabilidad Documental', fr:'Traçabilité Documentaire', de:'Dokumentarische Nachvollziehbarkeit', ar:'إمكانية تتبع المستندات' }, d: { pt:'Nenhum registro sem URL exata, timestamp, SHA-256 e link Wayback. Proveniência é o produto.', en:'No record without exact URL, timestamp, SHA-256 and Wayback link. Provenance is the product.', es:'Ningún registro sin URL exacta, timestamp y SHA-256. La procedencia es el producto.', fr:'Aucun enregistrement sans URL exacte, horodatage et SHA-256.', de:'Kein Datensatz ohne exakte URL, Zeitstempel und SHA-256.', ar:'لا سجل بدون URL دقيق وطابع زمني وSHA-256.' } },
    { n: '[06]', t: { pt:'Independência Política', en:'Political Independence', es:'Independencia Política', fr:'Indépendance Politique', de:'Politische Unabhängigkeit', ar:'الاستقلال السياسي' }, d: { pt:'Zero comunicação com campanhas. Zero financiamento político. Apenas fontes públicas.', en:'Zero communication with campaigns. Zero political funding. Public sources only.', es:'Cero comunicación con campañas. Cero financiación política.', fr:'Zéro communication avec les campagnes. Zéro financement politique.', de:'Null Kommunikation mit Kampagnen. Null politische Finanzierung.', ar:'صفر تواصل مع الحملات. صفر تمويل سياسي.' } },
    { n: '[07]', t: { pt:'Infraestrutura Aberta', en:'Open Infrastructure', es:'Infraestructura Abierta', fr:'Infrastructure Ouverte', de:'Offene Infrastruktur', ar:'البنية التحتية المفتوحة' }, d: { pt:'Código, metodologia e protocolo POCVA-01 em AGPL v3.0. Qualquer um pode auditar.', en:'Code, methodology, and POCVA-01 protocol under AGPL v3.0. Anyone can audit.', es:'Código y protocolo POCVA-01 bajo AGPL v3.0. Cualquiera puede auditar.', fr:'Code et protocole POCVA-01 sous AGPL v3.0. Chacun peut auditer.', de:'Code und POCVA-01 Protokoll unter AGPL v3.0. Jeder kann prüfen.', ar:'الكود وبروتوكول POCVA-01 تحت AGPL v3.0.' } },
    { n: '[08]', t: { pt:'Zero Interferência Comercial', en:'Zero Commercial Interference', es:'Cero Interferencia Comercial', fr:'Zéro Interférence Commerciale', de:'Null Kommerzielle Einmischung', ar:'انعدام التدخل التجاري' }, d: { pt:'Nenhuma transação distorce visibilidade. Receita da API subsidia o acesso gratuito.', en:'No transaction distorts visibility. API revenue subsidizes free access.', es:'Ninguna transacción distorsiona la visibilidad. Los ingresos API financian el acceso gratuito.', fr:'Aucune transaction ne distord la visibilité. Les revenus API financent l\'accès gratuit.', de:'Keine Transaktion verzerrt Sichtbarkeit. API-Einnahmen subventionieren freien Zugang.', ar:'لا معاملة تشوّه الرؤية. عائدات API تدعم الوصول المجاني.' } },
  ]

  const categories = [
    { emoji:'💰', pt:'Economia & Fiscal', en:'Economy & Fiscal', es:'Economía & Fiscal', fr:'Économie & Fiscal', de:'Wirtschaft', ar:'الاقتصاد' },
    { emoji:'📚', pt:'Educação & Cultura', en:'Education & Culture', es:'Educación & Cultura', fr:'Éducation & Culture', de:'Bildung', ar:'التعليم' },
    { emoji:'🏥', pt:'Saúde & Saneamento', en:'Health & Sanitation', es:'Salud & Saneamiento', fr:'Santé', de:'Gesundheit', ar:'الصحة' },
    { emoji:'⚖️', pt:'Segurança & Justiça', en:'Safety & Justice', es:'Seguridad & Justicia', fr:'Sécurité & Justice', de:'Sicherheit', ar:'الأمن' },
    { emoji:'🌿', pt:'Meio Ambiente & Clima', en:'Environment & Climate', es:'Medio Ambiente & Clima', fr:'Environnement & Climat', de:'Umwelt', ar:'البيئة' },
    { emoji:'🤝', pt:'Assistência Social', en:'Social Assistance', es:'Asistencia Social', fr:'Assistance Sociale', de:'Soziales', ar:'الرعاية' },
    { emoji:'🏛️', pt:'Direitos Humanos', en:'Human Rights', es:'Derechos Humanos', fr:'Droits Humains', de:'Menschenrechte', ar:'حقوق الإنسان' },
    { emoji:'🏗️', pt:'Infraestrutura', en:'Infrastructure', es:'Infraestructura', fr:'Infrastructure', de:'Infrastruktur', ar:'البنية التحتية' },
    { emoji:'⚙️', pt:'Governança & Reforma', en:'Governance & Reform', es:'Gobernanza & Reforma', fr:'Gouvernance & Réforme', de:'Regierungsführung', ar:'الحوكمة' },
  ]

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           WORLD CONTRAST — DESIGN SYSTEM v15
           "Cryptographic Notary" — Dark Mode Institutional
           Onyx / Platinum / Emerald / Gold Seal
           ═══════════════════════════════════════════════════ */

        :root {
          /* Core palette */
          --onyx:         #0A0A0B;
          --onyx-2:       #111113;
          --onyx-3:       #18181B;
          --onyx-4:       #27272A;
          --onyx-5:       #3F3F46;
          --platinum:     #E4E4E7;
          --platinum-dim: #A1A1AA;
          --platinum-low: #52525B;
          --gold:         #C8A96E;
          --gold-dim:     rgba(200,169,110,0.15);
          --gold-border:  rgba(200,169,110,0.25);
          --emerald:      #10B981;
          --emerald-dim:  rgba(16,185,129,0.12);
          --red-oxide:    #EF4444;
          --red-dim:      rgba(239,68,68,0.12);
          --rule:         rgba(255,255,255,0.06);
          --rule-gold:    rgba(200,169,110,0.12);

          /* Typography */
          --font-display:  'IBM Plex Sans', system-ui, sans-serif;
          --font-body:     'IBM Plex Sans', system-ui, sans-serif;
          --font-mono:     'IBM Plex Mono', 'Courier New', monospace;

          /* Spacing */
          --px: clamp(20px, 5vw, 72px);
          --section-py: clamp(56px, 8vw, 112px);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wc-root {
          font-family: var(--font-body);
          background: var(--onyx);
          color: var(--platinum);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        /* ── SYSTEM HEADER ──────────────────────────────── */
        .sys-header {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 200;
          background: rgba(10,10,11,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--rule);
          height: 52px;
          display: flex; align-items: center;
          padding: 0 var(--px);
          gap: 16px;
        }
        .sys-logo {
          font-family: var(--font-display);
          font-size: 14px; font-weight: 700;
          color: var(--platinum);
          letter-spacing: -0.3px;
          white-space: nowrap;
        }
        .sys-logo span { color: var(--gold); }
        .sys-status {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 400;
          color: var(--emerald);
          letter-spacing: 1.5px;
          display: flex; align-items: center; gap: 5px;
        }
        .sys-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--emerald);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .sys-spacer { flex: 1; }
        .sys-enterprise {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--gold);
          border: 1px solid var(--gold-border);
          padding: 5px 10px; border-radius: 2px;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .sys-enterprise:hover { background: var(--gold-dim); }

        /* ── DATA HERO — FIRST FOLD ─────────────────────── */
        .data-hero {
          padding-top: 52px; /* offset for fixed header */
          min-height: 100svh;
          display: flex; flex-direction: column;
          justify-content: center;
          padding-left: var(--px); padding-right: var(--px);
          position: relative;
          overflow: hidden;
        }

        /* Grid texture background */
        .data-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        /* Gold gradient wash top-right */
        .data-hero::after {
          content: '';
          position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content { position: relative; z-index: 1; max-width: 1200px; }

        .hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 400;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(40px, 7vw, 96px);
          font-weight: 800;
          color: var(--platinum);
          line-height: 0.95;
          letter-spacing: -2px;
          margin-bottom: 8px;
        }
        .hero-title-b {
          font-family: var(--font-display);
          font-size: clamp(40px, 7vw, 96px);
          font-weight: 200;
          color: var(--platinum-dim);
          line-height: 0.95;
          letter-spacing: -2px;
          margin-bottom: 32px;
        }

        /* ── COUNTERS ────────────────────────────────────── */
        .counters {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--rule);
          margin-bottom: 32px;
          max-width: 720px;
        }
        @media(max-width: 640px) {
          .counters { grid-template-columns: repeat(2, 1fr); }
        }
        .counter {
          padding: 20px 16px;
          border-right: 1px solid var(--rule);
        }
        .counter:last-child { border-right: none; }
        @media(max-width: 640px) {
          .counter:nth-child(2) { border-right: none; }
          .counter:nth-child(3),
          .counter:nth-child(4) { border-top: 1px solid var(--rule); }
        }
        .counter-val {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          color: var(--platinum);
          line-height: 1;
          letter-spacing: -1px;
        }
        .counter-val.gold { color: var(--gold); }
        .counter-val.emerald { color: var(--emerald); }
        .counter-val span { font-size: 0.5em; font-weight: 300; color: var(--gold); vertical-align: super; }
        .counter-label {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 400;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--platinum-low);
          margin-top: 4px;
        }

        /* ── HERO CTA ROW ────────────────────────────────── */
        .hero-cta {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap;
        }
        .btn-primary {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          background: var(--gold); color: var(--onyx);
          border: none; padding: 14px 24px; cursor: pointer;
          border-radius: 2px; text-decoration: none;
          display: inline-block; min-height: 48px;
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-ghost {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 400;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--platinum-dim);
          background: none; border: 1px solid var(--rule);
          padding: 13px 20px; cursor: pointer; border-radius: 2px;
          min-height: 48px; white-space: nowrap; text-decoration: none;
          display: inline-block; transition: border-color 0.2s;
        }
        .btn-ghost:hover { border-color: var(--platinum-low); }

        /* ── SECTION WRAPPER ─────────────────────────────── */
        .wc-section {
          padding: var(--section-py) var(--px);
          border-top: 1px solid var(--rule);
        }
        .wc-section.bg-2 { background: var(--onyx-2); }
        .wc-section.bg-3 { background: var(--onyx-3); }

        .section-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 400;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(22px, 3vw, 36px);
          font-weight: 700; color: var(--platinum);
          letter-spacing: -0.5px;
          margin-bottom: clamp(32px, 5vw, 56px);
        }
        .section-sub {
          font-size: 13px; color: var(--platinum-low);
          margin-top: 4px; font-weight: 300;
        }

        /* ── ELECTION GRID ───────────────────────────────── */
        .elections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
        }
        .election-card {
          background: var(--onyx-2);
          padding: 24px 20px;
          display: flex; flex-direction: column; gap: 12px;
          text-decoration: none; color: inherit;
          transition: background 0.2s;
          position: relative;
        }
        .election-card:hover { background: var(--onyx-3); }
        .election-card:hover .ec-arrow { color: var(--gold); }

        .ec-top { display: flex; align-items: flex-start; gap: 12px; }
        .ec-flag { font-size: 28px; line-height: 1; flex-shrink: 0; }
        .ec-info { flex: 1; }
        .ec-name {
          font-family: var(--font-display);
          font-size: 15px; font-weight: 600;
          color: var(--platinum); line-height: 1.3;
        }
        .ec-status {
          font-family: var(--font-mono);
          font-size: 8px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          margin-top: 4px; display: flex; align-items: center; gap: 5px;
        }
        .ec-status.live { color: var(--emerald); }
        .ec-status.scheduled { color: var(--platinum-low); }
        .ec-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }

        .ec-hash {
          font-family: var(--font-mono);
          font-size: 8px; color: var(--platinum-low);
          letter-spacing: 0.5px;
          padding: 4px 8px;
          background: var(--onyx-4);
          border-radius: 2px;
          border: 1px solid var(--rule);
        }
        .ec-footer {
          display: flex; justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid var(--rule);
        }
        .ec-meta {
          font-family: var(--font-mono);
          font-size: 9px; color: var(--platinum-low);
        }
        .ec-arrow {
          font-family: var(--font-mono);
          font-size: 10px; color: var(--platinum-low);
          transition: color 0.2s;
        }

        /* Election search */
        .election-search-wrap { margin-bottom: 16px; }
        .election-search {
          width: 100%; max-width: 480px;
          padding: 10px 16px;
          font-family: var(--font-mono);
          font-size: 11px; color: var(--platinum);
          background: var(--onyx-3);
          border: 1px solid var(--rule);
          border-radius: 2px; outline: none;
          transition: border-color 0.2s;
          letter-spacing: 0.03em;
        }
        .election-search::placeholder { color: var(--platinum-low); }
        .election-search:focus { border-color: var(--gold-border); }

        /* ── PILLARS ─────────────────────────────────────── */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
        }
        @media(max-width: 900px) { .pillars-grid { grid-template-columns: repeat(2, 1fr); } }
        @media(max-width: 500px) { .pillars-grid { grid-template-columns: 1fr; } }

        .pillar {
          background: var(--onyx-2);
          padding: 24px 20px;
          transition: background 0.22s;
        }
        .pillar:hover { background: var(--onyx-3); }
        .p-num {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 400;
          letter-spacing: 1.5px; color: var(--gold);
          margin-bottom: 12px;
        }
        .p-title {
          font-family: var(--font-display);
          font-size: 14px; font-weight: 600;
          color: var(--platinum); margin-bottom: 8px;
          line-height: 1.3;
        }
        .p-desc {
          font-size: 12px; font-weight: 300;
          color: var(--platinum-low); line-height: 1.7;
        }

        /* ── CATEGORIES ──────────────────────────────────── */
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
        }
        @media(max-width: 900px) { .cats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width: 500px) { .cats-grid { grid-template-columns: repeat(3, 1fr); } }
        .cat-box {
          background: var(--onyx-2);
          padding: 16px 8px; text-align: center;
          transition: background 0.18s;
        }
        .cat-box:hover { background: var(--onyx-3); }
        .cat-emoji { font-size: 18px; display: block; margin-bottom: 6px; }
        .cat-name {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 400;
          letter-spacing: 0.5px;
          color: var(--platinum-low); line-height: 1.4;
        }
        .cat-rule {
          width: 16px; height: 1px;
          background: var(--gold); margin: 6px auto 0;
          opacity: 0.4;
        }

        /* ── POCVA BAND ──────────────────────────────────── */
        .pocva-band {
          background: var(--onyx-3);
          padding: var(--section-py) var(--px);
          border-top: 1px solid var(--rule-gold);
          border-bottom: 1px solid var(--rule-gold);
        }
        .pocva-equation {
          font-family: var(--font-mono);
          font-size: clamp(14px, 2.5vw, 22px);
          color: var(--platinum);
          letter-spacing: 1px;
          margin-bottom: 24px;
          line-height: 1.8;
        }
        .pocva-equation .gold { color: var(--gold); }
        .pocva-equation .emerald { color: var(--emerald); }
        .pocva-equation .dim { color: var(--platinum-low); }
        .pocva-desc {
          font-size: 14px; font-weight: 300;
          color: var(--platinum-low); line-height: 1.85;
          max-width: 600px;
        }
        .pocva-desc + .pocva-desc { margin-top: 16px; }

        /* ── FOOTER ──────────────────────────────────────── */
        .wc-footer {
          background: var(--onyx);
          padding: clamp(40px,6vw,72px) var(--px) clamp(24px,3vw,40px);
          border-top: 1px solid var(--rule);
        }
        .foot-top {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid var(--rule);
          margin-bottom: 28px;
        }
        @media(max-width: 768px) {
          .foot-top { grid-template-columns: 1fr; gap: 28px; }
        }
        .foot-brand {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 700;
          color: var(--platinum); margin-bottom: 8px;
        }
        .foot-brand span { color: var(--gold); }
        .foot-tagline {
          font-size: 12px; font-weight: 300;
          color: var(--platinum-low); line-height: 1.8;
          max-width: 280px;
        }
        .foot-record {
          font-family: var(--font-mono);
          font-size: 10px; color: var(--gold);
          margin-top: 12px; letter-spacing: 0.5px;
          opacity: 0.7;
        }
        .foot-col-title {
          font-family: var(--font-mono);
          font-size: 8px; font-weight: 500;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--gold); opacity: 0.7;
          margin-bottom: 14px;
        }
        .foot-links { list-style: none; }
        .foot-links li { margin-bottom: 10px; }
        .foot-links a {
          font-size: 12px; font-weight: 300;
          color: var(--platinum-low); text-decoration: none;
          transition: color 0.2s; min-height: 44px;
          display: inline-block; line-height: 44px;
        }
        .foot-links a:hover { color: var(--platinum); }
        .foot-bottom {
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .foot-copy {
          font-family: var(--font-mono);
          font-size: 9px; color: var(--platinum-low);
          opacity: 0.5; letter-spacing: 0.04em;
        }
        .foot-neutral {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-mono);
          font-size: 9px; color: var(--platinum-low);
          opacity: 0.5;
        }
        .gold-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); }
      `}</style>

      <div className="wc-root" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── SYSTEM HEADER ──────────────────────────────── */}
        <header className="sys-header">
          <div className="sys-logo">World<span>Contrast</span></div>
          <div className="sys-status">
            <div className="sys-dot" />
            {c.systemLabel}
          </div>
          <div className="sys-spacer" />
          <Link href={`/${locale}/enterprise`} className="sys-enterprise">
            {c.enterpriseBtn}
          </Link>
        </header>

        {/* ── DATA HERO — FIRST FOLD ─────────────────────── */}
        <section className="data-hero" aria-label="Registry overview">
          <div className="hero-content">
            <p className="hero-eyebrow">{c.registryLabel}</p>
            <h1 className="hero-title">Promessas dos</h1>
            <h1 className="hero-title-b" style={{display:'block'}}>Candidatos — Lado a Lado.</h1>

            {/* Live counters — real data */}
            <div className="counters" role="region" aria-label="System counters">
              <div className="counter">
                <div className="counter-val gold">{totalPromises}<span>+</span></div>
                <div className="counter-label">{c.counterPromises}</div>
              </div>
              <div className="counter">
                <div className="counter-val">{totalElections}<span>↑</span></div>
                <div className="counter-label">{c.counterElections}</div>
              </div>
              <div className="counter">
                <div className="counter-val">{totalCandidates}<span>+</span></div>
                <div className="counter-label">{c.counterCountries}</div>
              </div>
              <div className="counter">
                <div className="counter-val emerald">0<span>%</span></div>
                <div className="counter-label">{c.counterBias}</div>
              </div>
            </div>

            <div className="hero-cta">
              {elections[0] && (
                <Link href={`/${locale}/compare/${elections[0].id}`} className="btn-primary">
                  {c.compareBtn}
                </Link>
              )}
              <a href="#pocva" className="btn-ghost">{c.manifestoBtn}</a>
            </div>
          </div>
        </section>

        {/* ── ELECTIONS — DATA FIRST ─────────────────────── */}
        <section className="wc-section bg-2" id="elections" aria-label={c.sectionLabel}>
          <p className="section-eyebrow">02 — {c.sectionLabel}</p>
          <h2 className="section-title">
            {c.filterAll}
            <span className="section-sub" style={{display:'block',marginTop:4}}>
              {c.catSub}
            </span>
          </h2>
          <ElectionGrid elections={elections} locale={locale} />
        </section>

        {/* ── POCVA BAND ────────────────────────────────── */}
        <section className="pocva-band" id="pocva" aria-label="POCVA-01 Protocol">
          <p className="section-eyebrow">POCVA-01 — Protocolo de Extração</p>
          <div className="pocva-equation">
            <span className="gold">[P]</span>
            {' = '}
            <span className="emerald">[A] Ator</span>
            {' + '}
            <span className="gold">[V] Verbo de Ação Futura</span>
            {' + '}
            <span className="emerald">[M] Alvo Mensurável</span>
          </div>
          <p className="pocva-desc">
            {locale === 'pt'
              ? 'Uma declaração só é registrada como promessa se satisfizer os três componentes. O algoritmo não negocia. O algoritmo não tem opiniões. O algoritmo é a resposta.'
              : locale === 'es'
              ? 'Una declaración sólo se registra como promesa si satisface los tres componentes. El algoritmo no negocia. El algoritmo no tiene opiniones. El algoritmo es la respuesta.'
              : locale === 'fr'
              ? "Une déclaration n'est enregistrée comme promesse que si elle satisfait les trois composantes. L'algorithme ne négocie pas. L'algorithme n'a pas d'opinions. L'algorithme est la réponse."
              : locale === 'ar'
              ? 'لا يُسجَّل بيان كوعد إلا إذا استوفى المكونات الثلاثة. الخوارزمية لا تتفاوض. الخوارزمية ليس لها آراء. الخوارزمية هي الإجابة.'
              : locale === 'de'
              ? 'Eine Aussage wird nur dann als Versprechen registriert, wenn sie alle drei Komponenten erfüllt. Der Algorithmus verhandelt nicht. Der Algorithmus hat keine Meinungen. Der Algorithmus ist die Antwort.'
              : 'A statement is only registered as a promise if it satisfies all three components. The algorithm does not negotiate. The algorithm has no opinions. The algorithm is the answer.'}
          </p>
          <p className="pocva-desc" style={{marginTop:16}}>
            {locale === 'pt'
              ? 'O hash SHA-256 do arquivo de prompt é registrado junto com cada promessa extraída — prova irrefutável de qual versão do protocolo estava ativa no momento da extração.'
              : locale === 'es'
              ? 'El hash SHA-256 del archivo de prompt se registra junto con cada promesa extraída — prueba irrefutable de qué versión del protocolo estaba activa en el momento de la extracción.'
              : locale === 'fr'
              ? "Le hash SHA-256 du fichier de prompt est enregistré avec chaque promesse extraite — preuve irréfutable de la version du protocole active au moment de l'extraction."
              : locale === 'ar'
              ? 'يتم تسجيل هاش SHA-256 لملف الـprompt مع كل وعد مستخرج — دليل قاطع على أي إصدار من البروتوكول كان نشطاً وقت الاستخراج.'
              : locale === 'de'
              ? 'Der SHA-256-Hash der Prompt-Datei wird mit jedem extrahierten Versprechen registriert — unwiderlegbarer Beweis, welche Protokollversion zum Zeitpunkt der Extraktion aktiv war.'
              : 'The SHA-256 hash of the prompt file is recorded alongside every extracted promise — irrefutable proof of which version of the protocol was active at the time of extraction.'}
          </p>
        </section>

        {/* ── PILLARS ───────────────────────────────────── */}
        <section className="wc-section" aria-label={c.pillarTitle}>
          <p className="section-eyebrow">01 — Arquitetura Fundacional</p>
          <h2 className="section-title">{c.pillarTitle}</h2>
          <div className="pillars-grid">
            {pillars.map((p) => (
              <div key={p.n} className="pillar">
                <p className="p-num">{p.n}</p>
                <h3 className="p-title">{(p.t as any)[locale] || p.t['en']}</h3>
                <p className="p-desc">{(p.d as any)[locale] || p.d['en']}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ────────────────────────────────── */}
        <section className="wc-section bg-3" aria-label={c.catTitle}>
          <p className="section-eyebrow">03 — Taxonomia Universal</p>
          <h2 className="section-title">
            {c.catTitle}
            <span className="section-sub" style={{display:'block',marginTop:4}}>{c.catSub}</span>
          </h2>
          <div className="cats-grid">
            {categories.map((cat, i) => (
              <div key={i} className="cat-box">
                <span className="cat-emoji" aria-hidden="true">{cat.emoji}</span>
                <p className="cat-name">{(cat as any)[locale] || cat['en']}</p>
                <div className="cat-rule" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────── */}
        <footer className="wc-footer" role="contentinfo">
          <div className="foot-top">
            <div>
              <div className="foot-brand">World<span>Contrast</span></div>
              <p className="foot-tagline">{c.footTagline}</p>
              <p className="foot-record">{c.footRecord}</p>
            </div>
            <div>
              <p className="foot-col-title">Plataforma</p>
              <ul className="foot-links">
                <li><a href="#pocva">{c.manifestoBtn}</a></li>
                <li><a href="#elections">{c.filterAll}</a></li>
                <li><a href="#">Open Data / REST API</a></li>
                <li><Link href={`/${locale}/enterprise`}>{c.enterpriseBtn}</Link></li>
              </ul>
            </div>
            <div>
              <p className="foot-col-title">Institucional</p>
              <ul className="foot-links">
                <li><a href="https://github.com/worldcontrast/promises">GitHub ↗</a></li>
                <li><a href="#">AGPL v3.0 License</a></li>
                <li><a href="#">Audit Logs</a></li>
                <li><a href="#">TERMS_API.md</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <p className="foot-copy">{c.footCopy}</p>
            <div className="foot-neutral">
              <div className="gold-dot" aria-hidden="true" />
              {c.footNeutral}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
