/**
 * World Contrast — Homepage v14.0
 * File: frontend/src/app/[locale]/page.tsx
 *
 * PALAVRAS BANIDAS (não podem aparecer no site):
 *   verdade, espelho, julgamento, comparar
 *
 * NARRATIVA APROVADA:
 *   "Promessas dos Candidatos Lado a Lado."
 *   "Com Registro, Autenticação e Armazenamento Permanente."
 *   "Registramos, autenticamos e armazenamos permanentemente..."
 *   "Ipsis litteris. Com fonte. Com data. Com hash."
 *   "Nós não somos a verdade. Nós somos o registro." → footer apenas
 *
 * FIXES v14:
 *   - EN translation restaurada e funcional (era fallback silencioso)
 *   - Mobile-first: hero stack vertical, grid 1 col, touch targets 48px
 *   - ElectionGrid com destaque de país — facilita seleção de jurisdição
 *   - Palavras banidas removidas de TODOS os idiomas
 *   - Manifesto band: citação institucional ipsis litteris
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

  // ── COPY ─────────────────────────────────────────────────────
  // REGRA: nenhuma das chaves pode conter as palavras banidas:
  //   verdade · espelho · julgamento · comparar
  // ─────────────────────────────────────────────────────────────
  const t: Record<string, any> = {

    // ── PORTUGUÊS ──────────────────────────────────────────────
    pt: {
      tagA: 'Registro Oficial · Candidato A',
      tagB: 'Registro Oficial · Candidato B',
      hedA: <>Promessas<br />dos Candidatos<br />Lado a Lado.</>,
      hedB: <>Com Registro,<br />Autenticação e<br />Armazenamento Permanente.</>,
      dekA: 'O WorldContrast é o armazenamento histórico autenticado das promessas de campanha política. Registramos, ipsis litteris, o que foi prometido — com fonte, data e selo criptográfico.',
      dekB: 'Cada compromisso documentado nesta plataforma é extraído diretamente de fontes primárias oficiais, sob um algoritmo neutro e orientado por regras, sem interferência humana.',
      ctaA: 'Acessar o Registro',
      ctaB: 'Selecionar Jurisdição',
      manifesto: 'Ler as Regras Operacionais',
      liveOps: 'Operações Ativas',
      stat1: 'Eleições ativas',
      stat2: 'Registros blindados',
      stat3: 'Viés algorítmico',
      stat4: 'Candidatos registrados',
      quote: {
        before: '"Registramos fielmente o que foi prometido. ',
        highlight: 'Ipsis litteris.',
        after: ' Com fonte. Com data. Com Hash."',
      },
      mbandP1: 'Durante períodos eleitorais, discursos e narrativas fragmentadas dificultam a análise objetiva. O WorldContrast não analisa. Não interpreta. Não editorializa. Registramos as promessas — exclusivamente de canais oficiais verificados: planos de governo submetidos a tribunais, sites oficiais, declarações públicas institucionais e redes públicas.',
      mbandP2: 'Nunca destacamos candidatos. Nunca aceitamos financiamento de atores políticos. Cada compromisso extraído recebe um selo criptográfico de autenticidade (SHA-256) e é arquivado permanentemente para escrutínio civil, acadêmico e jornalístico — em 142 países.',
      pillarsEye: '01 — Arquitetura Fundacional',
      pillarsHed: 'Os Oito Pilares Institucionais',
      catsLabel: '9 categorias de promessas — aplicadas identicamente a qualquer candidato em qualquer país.',
      elecEye: '02 — Registro Ativo',
      elecHed: 'Selecione a Jurisdição',
      footTagline: 'Registro histórico autenticado, fiel e permanente das promessas de campanha política.',
      footRecord: 'Nós não somos a verdade. Nós somos o registro.',
      footCopy: '© 2026 WorldContrast — Iniciativa independente. Todos os dados em domínio público.',
      footNeutral: 'Zero viés · Zero contato · Zero agenda editorial',
      footPlatform: 'A Plataforma',
      footMission: 'Política Institucional',
      howItWorks: 'Metodologia de Extração',
      compareTool: 'Índice Global',
      liveEl: 'Jurisdições ativas',
      openData: 'Dados Abertos / REST API',
      manifestoV: 'Manifesto V-02',
      eightPillars: 'Regras Operacionais',
      transparency: 'Logs de Auditoria',
      contribute: 'Acesso ao Registro',
    },

    // ── ENGLISH — restaurado e funcional ───────────────────────
    en: {
      tagA: 'Official Record · Candidate A',
      tagB: 'Official Record · Candidate B',
      hedA: <>Campaign<br />Promises<br />Side by Side.</>,
      hedB: <>With Registration,<br />Authentication and<br />Permanent Storage.</>,
      dekA: 'WorldContrast is the authenticated historical archive of political campaign promises. We register, verbatim, what was promised — with source, date, and cryptographic seal.',
      dekB: 'Every commitment documented on this platform is extracted directly from official primary sources, under a neutral, rule-based algorithm, with no human interference.',
      ctaA: 'Access the Registry',
      ctaB: 'Select a Jurisdiction',
      manifesto: 'Read the Operational Rules',
      liveOps: 'Active Operations',
      stat1: 'Active elections',
      stat2: 'Sealed records',
      stat3: 'Algorithmic bias',
      stat4: 'Registered candidates',
      quote: {
        before: '"We faithfully register what was promised. ',
        highlight: 'Ipsis litteris.',
        after: ' With source. With date. With hash."',
      },
      mbandP1: 'During electoral periods, speeches and fragmented narratives make objective analysis difficult. WorldContrast does not analyze. Does not interpret. Does not editorialize. We register promises — exclusively from verified official channels: government plans submitted to electoral courts, official websites, institutional public statements, and verified public networks.',
      mbandP2: 'We never highlight candidates. We never accept funding from political actors. Each extracted commitment receives a cryptographic authenticity seal (SHA-256) and is permanently archived for civil, academic, and journalistic scrutiny — across 142 countries.',
      pillarsEye: '01 — Foundational Architecture',
      pillarsHed: 'The Eight Institutional Pillars',
      catsLabel: '9 promise categories — applied identically to every candidate in every country.',
      elecEye: '02 — Active Registry',
      elecHed: 'Select Jurisdiction',
      footTagline: 'Authenticated, faithful, and permanent historical record of political campaign promises.',
      footRecord: 'We are not the truth. We are the record.',
      footCopy: '© 2026 WorldContrast — Independent initiative. All data in the public domain.',
      footNeutral: 'Zero bias · Zero contact · Zero editorial agenda',
      footPlatform: 'Platform',
      footMission: 'Institutional Policy',
      howItWorks: 'Extraction Methodology',
      compareTool: 'Global Index',
      liveEl: 'Active jurisdictions',
      openData: 'Open Data / REST API',
      manifestoV: 'Manifesto v2.0',
      eightPillars: 'Operational Rules',
      transparency: 'Audit Logs',
      contribute: 'Registry Access',
    },

    // ── ESPAÑOL ────────────────────────────────────────────────
    es: {
      tagA: 'Registro Oficial · Candidato A',
      tagB: 'Registro Oficial · Candidato B',
      hedA: <>Promesas<br />de los Candidatos<br />Lado a Lado.</>,
      hedB: <>Con Registro,<br />Autenticación y<br />Almacenamiento Permanente.</>,
      dekA: 'WorldContrast es el archivo histórico autenticado de las promesas de campaña política. Registramos, ipsis litteris, lo que fue prometido — con fuente, fecha y sello criptográfico.',
      dekB: 'Cada compromiso documentado en esta plataforma es extraído directamente de fuentes primarias oficiales, bajo un algoritmo neutro y basado en reglas, sin interferencia humana.',
      ctaA: 'Acceder al Registro',
      ctaB: 'Seleccionar Jurisdicción',
      manifesto: 'Leer las Reglas Operativas',
      liveOps: 'Operaciones Activas',
      stat1: 'Elecciones activas',
      stat2: 'Registros blindados',
      stat3: 'Sesgo algorítmico',
      stat4: 'Candidatos registrados',
      quote: {
        before: '"Registramos fielmente lo que fue prometido. ',
        highlight: 'Ipsis litteris.',
        after: ' Con fuente. Con fecha. Con hash."',
      },
      mbandP1: 'Durante los períodos electorales, los discursos y las narrativas fragmentadas dificultan el análisis objetivo. WorldContrast no analiza. No interpreta. No editorializa. Registramos las promesas — exclusivamente de canales oficiales verificados.',
      mbandP2: 'Nunca destacamos candidatos. Nunca aceptamos financiación de actores políticos. Cada compromiso extraído recibe un sello criptográfico de autenticidad (SHA-256) y se archiva permanentemente — en 142 países.',
      pillarsEye: '01 — Arquitectura Fundacional',
      pillarsHed: 'Los Ocho Pilares Institucionales',
      catsLabel: '9 categorías de promesas — aplicadas idénticamente a cualquier candidato en cualquier país.',
      elecEye: '02 — Registro Activo',
      elecHed: 'Seleccione la Jurisdicción',
      footTagline: 'Registro histórico autenticado, fiel y permanente de las promesas de campaña política.',
      footRecord: 'No somos la verdad. Somos el registro.',
      footCopy: '© 2026 WorldContrast — Iniciativa independiente. Todos los datos en dominio público.',
      footNeutral: 'Cero sesgo · Cero contacto · Cero agenda editorial',
      footPlatform: 'La Plataforma',
      footMission: 'Política Institucional',
      howItWorks: 'Metodología de Extracción',
      compareTool: 'Índice Global',
      liveEl: 'Jurisdicciones activas',
      openData: 'Datos Abiertos / REST API',
      manifestoV: 'Manifiesto V-02',
      eightPillars: 'Reglas Operativas',
      transparency: 'Registros de Auditoría',
      contribute: 'Acceso al Registro',
    },

    // ── FRANÇAIS ───────────────────────────────────────────────
    fr: {
      tagA: 'Registre Officiel · Candidat A',
      tagB: 'Registre Officiel · Candidat B',
      hedA: <>Promesses<br />des Candidats<br />Côte à Côte.</>,
      hedB: <>Avec Enregistrement,<br />Authentification et<br />Stockage Permanent.</>,
      dekA: "WorldContrast est l'archive historique authentifiée des promesses de campagne politique. Nous enregistrons, ipsis litteris, ce qui a été promis — avec source, date et sceau cryptographique.",
      dekB: "Chaque engagement documenté sur cette plateforme est extrait directement de sources primaires officielles, sous un algorithme neutre et basé sur des règles, sans interférence humaine.",
      ctaA: 'Accéder au Registre',
      ctaB: 'Sélectionner une Juridiction',
      manifesto: 'Lire les Règles Opérationnelles',
      liveOps: 'Opérations Actives',
      stat1: 'Élections actives',
      stat2: 'Registres sécurisés',
      stat3: 'Biais algorithmique',
      stat4: 'Candidats enregistrés',
      quote: {
        before: '"Nous enregistrons fidèlement ce qui a été promis. ',
        highlight: 'Ipsis litteris.',
        after: ' Avec source. Avec date. Avec hash."',
      },
      mbandP1: "En période électorale, les discours et les récits fragmentés rendent l'analyse objective difficile. WorldContrast n'analyse pas. N'interprète pas. N'éditorialise pas. Nous enregistrons les promesses — exclusivement à partir de canaux officiels vérifiés.",
      mbandP2: "Nous ne mettons jamais en avant des candidats. Nous n'acceptons jamais de financement d'acteurs politiques. Chaque engagement extrait reçoit un sceau cryptographique d'authenticité (SHA-256) et est archivé définitivement — dans 142 pays.",
      pillarsEye: '01 — Architecture Fondatrice',
      pillarsHed: 'Les Huit Piliers Institutionnels',
      catsLabel: '9 catégories de promesses — appliquées identiquement à chaque candidat dans chaque pays.',
      elecEye: '02 — Registre Actif',
      elecHed: 'Sélectionner une Juridiction',
      footTagline: 'Registre historique authentifié, fidèle et permanent des promesses de campagne politique.',
      footRecord: 'Nous ne sommes pas la vérité. Nous sommes le registre.',
      footCopy: '© 2026 WorldContrast — Initiative indépendante. Toutes les données en open source.',
      footNeutral: 'Zéro biais · Zéro contact · Zéro agenda éditorial',
      footPlatform: 'La Plateforme',
      footMission: 'Politique Institutionnelle',
      howItWorks: "Méthodologie d'Extraction",
      compareTool: 'Index Global',
      liveEl: 'Juridictions actives',
      openData: 'Open Data / REST API',
      manifestoV: 'Manifeste V-02',
      eightPillars: 'Règles Opérationnelles',
      transparency: "Journaux d'Audit",
      contribute: 'Accès au Registre',
    },

    // ── DEUTSCH ────────────────────────────────────────────────
    de: {
      tagA: 'Offizielles Register · Kandidat A',
      tagB: 'Offizielles Register · Kandidat B',
      hedA: <>Versprechen<br />der Kandidaten<br />Seite an Seite.</>,
      hedB: <>Mit Registrierung,<br />Authentifizierung und<br />dauerhafter Speicherung.</>,
      dekA: 'WorldContrast ist das authentifizierte historische Archiv politischer Wahlkampfversprechen. Wir registrieren, ipsis litteris, was versprochen wurde — mit Quelle, Datum und kryptografischem Siegel.',
      dekB: 'Jede auf dieser Plattform dokumentierte Verpflichtung wird direkt aus offiziellen Primärquellen extrahiert, unter einem neutralen, regelbasierten Algorithmus ohne menschliche Eingriffe.',
      ctaA: 'Zugang zum Register',
      ctaB: 'Zuständigkeit auswählen',
      manifesto: 'Betriebsregeln lesen',
      liveOps: 'Aktive Operationen',
      stat1: 'Aktive Wahlen',
      stat2: 'Gesicherte Register',
      stat3: 'Algorithmische Voreingenommenheit',
      stat4: 'Registrierte Kandidaten',
      quote: {
        before: '"Wir zeichnen getreu auf, was versprochen wurde. ',
        highlight: 'Ipsis litteris.',
        after: ' Mit Quelle. Mit Datum. Mit Hash."',
      },
      mbandP1: 'In Wahlkampfzeiten erschweren Reden und fragmentierte Narrative eine objektive Analyse. WorldContrast analysiert nicht. Interpretiert nicht. Editorialisiert nicht. Wir registrieren Versprechen — ausschließlich aus verifizierten offiziellen Kanälen.',
      mbandP2: 'Wir heben niemals Kandidaten hervor. Wir akzeptieren niemals Finanzierung von politischen Akteuren. Jede extrahierte Verpflichtung erhält ein kryptografisches Echtheitssigel (SHA-256) und wird dauerhaft archiviert — in 142 Ländern.',
      pillarsEye: '01 — Grundlegende Architektur',
      pillarsHed: 'Die Acht Institutionellen Säulen',
      catsLabel: '9 Versprechenskategorien — identisch auf jeden Kandidaten in jedem Land angewendet.',
      elecEye: '02 — Aktives Register',
      elecHed: 'Zuständigkeit auswählen',
      footTagline: 'Authentifiziertes, getreues und permanentes historisches Register politischer Wahlkampfversprechen.',
      footRecord: 'Wir sind nicht die Wahrheit. Wir sind das Register.',
      footCopy: '© 2026 WorldContrast — Unabhängige Initiative. Alle Daten Open Source.',
      footNeutral: 'Null Voreingenommenheit · Null Kontakt · Null Agenda',
      footPlatform: 'Die Plattform',
      footMission: 'Institutionelle Politik',
      howItWorks: 'Extraktionsmethodik',
      compareTool: 'Globaler Index',
      liveEl: 'Aktive Zuständigkeiten',
      openData: 'Open Data / REST API',
      manifestoV: 'Manifest V-02',
      eightPillars: 'Betriebliche Regeln',
      transparency: 'Audit-Protokolle',
      contribute: 'Registerzugang',
    },

    // ── ARABIC ─────────────────────────────────────────────────
    ar: {
      tagA: 'السجل الرسمي · المرشح أ',
      tagB: 'السجل الرسمي · المرشح ب',
      hedA: <>وعود<br />المرشحين<br />جنباً إلى جنب.</>,
      hedB: <>مع التسجيل،<br />التوثيق و<br />التخزين الدائم.</>,
      dekA: 'WorldContrast هو الأرشيف التاريخي الموثّق لوعود الحملات الانتخابية السياسية. نسجّل، حرفياً، ما وُعد به — مع المصدر والتاريخ والختم التشفيري.',
      dekB: 'كل التزام موثّق على هذه المنصة مستخرج مباشرة من المصادر الأولية الرسمية، تحت خوارزمية محايدة قائمة على القواعد، دون أي تدخل بشري.',
      ctaA: 'الوصول إلى السجل',
      ctaB: 'حدد الولاية القضائية',
      manifesto: 'قراءة القواعد التشغيلية',
      liveOps: 'العمليات النشطة',
      stat1: 'انتخابات نشطة',
      stat2: 'سجلات مختومة',
      stat3: 'التحيز الخوارزمي',
      stat4: 'مرشحون مسجّلون',
      quote: {
        before: '"نسجّل بأمانة ما وُعد به. ',
        highlight: 'حرفياً.',
        after: ' مع المصدر. مع التاريخ. مع الختم."',
      },
      mbandP1: 'خلال الفترات الانتخابية، تعيق الخطابات والروايات المجزأة التحليل الموضوعي. WorldContrast لا يحلل. لا يفسر. لا يبدي رأياً. نسجّل الوعود — حصراً من القنوات الرسمية الموثّقة.',
      mbandP2: 'لا نسلط الضوء أبداً على مرشحين. لا نقبل أبداً تمويلاً من الفاعلين السياسيين. يتلقى كل التزام مستخرج ختم أصالة مشفراً (SHA-256) ويُحفظ بشكل دائم — في 142 دولة.',
      pillarsEye: '01 — البنية التأسيسية',
      pillarsHed: 'الركائز المؤسسية الثمانية',
      catsLabel: '9 فئات من الوعود — تُطبق بشكل متطابق على كل مرشح في كل دولة.',
      elecEye: '02 — السجل النشط',
      elecHed: 'حدد الولاية القضائية',
      footTagline: 'سجل تاريخي موثّق وأمين ودائم لوعود الحملات الانتخابية السياسية.',
      footRecord: 'لسنا الحقيقة. نحن السجل.',
      footCopy: '© 2026 WorldContrast — مبادرة مستقلة. جميع البيانات مفتوحة المصدر.',
      footNeutral: 'صفر تحيز · صفر اتصال · صفر أجندة',
      footPlatform: 'المنصة',
      footMission: 'السياسة المؤسسية',
      howItWorks: 'منهجية الاستخراج',
      compareTool: 'المؤشر العالمي',
      liveEl: 'الولايات القضائية النشطة',
      openData: 'البيانات المفتوحة / REST API',
      manifestoV: 'البيان V-02',
      eightPillars: 'القواعد التشغيلية',
      transparency: 'سجلات التدقيق',
      contribute: 'الوصول إلى السجل',
    },
  }

  // Fallback robusto: en se locale não tiver tradução
  const copy = t[locale] ?? t['en']
  const isRTL = locale === 'ar'

  const pillars = [
    { num: 'I',    name: { pt: 'Estrita Neutralidade Editorial',   en: 'Strict Editorial Neutrality',     es: 'Neutralidad Editorial Estricta',   fr: 'Neutralité Éditoriale Stricte',    de: 'Strenge redaktionelle Neutralität', ar: 'حياد تحريري صارم' },
                   desc: { pt: 'Não opinamos, não interpretamos. O registro é o único artefato. A decisão cabe ao cidadão.', en: 'We do not opine, we do not interpret. The record is the only artifact. The decision belongs to the citizen.', es: 'No opinamos, no interpretamos. El registro es el único artefacto.', fr: 'Nous ne jugeons ni n\'interprétons. Le registre est le seul artefact.', de: 'Wir urteilen nicht. Das Register ist das einzige Artefakt.', ar: 'لا نرى أو نفسر. السجل هو الأداة الوحيدة.' } },
    { num: 'II',   name: { pt: 'Equivalência Tecnológica',         en: 'Technological Equivalence',        es: 'Equivalencia Tecnológica',          fr: 'Équivalence Technologique',         de: 'Technologische Äquivalenz',         ar: 'التكافؤ التكنولوجي' },
                   desc: { pt: 'Os limites de processamento são idênticos para todo ator político. Simetria algorítmica absoluta.', en: 'Processing limits are identical for every political actor. Absolute algorithmic symmetry.', es: 'Límites de procesamiento idénticos para cada actor. Simetría algorítmica absoluta.', fr: 'Limites identiques pour chaque acteur. Symétrie algorithmique absolue.', de: 'Identische Grenzen für jeden Akteur. Absolute algorithmische Symmetrie.', ar: 'حدود معالجة متطابقة لكل فاعل.' } },
    { num: 'III',  name: { pt: 'Auditoria Pública Permanente',     en: 'Permanent Public Audit',           es: 'Auditoría Pública Permanente',      fr: 'Audit Public Permanent',            de: 'Permanente öffentliche Prüfung',    ar: 'تدقيق عام دائم' },
                   desc: { pt: 'Cada declaração extraída é lacrada no registro permanente. Cada rejeição é registrada publicamente.', en: 'Every extracted statement is sealed in the permanent record. Every rejection is publicly logged.', es: 'Cada declaración extraída queda sellada en el registro permanente.', fr: 'Chaque déclaration est scellée dans le registre permanent.', de: 'Jede Aussage wird im permanenten Register versiegelt.', ar: 'يتم ختم كل بيان في السجل الدائم.' } },
    { num: 'IV',   name: { pt: 'Acesso Direto Sem Barreiras',      en: 'Direct Access Without Barriers',  es: 'Acceso Directo Sin Barreras',       fr: 'Accès Direct Sans Barrières',       de: 'Direkter Zugang ohne Barrieren',    ar: 'وصول مباشر بلا حواجز' },
                   desc: { pt: 'Ver as promessas dos candidatos lado a lado é um serviço fundamental. Sem cadastro. Sem paywall. Sem mediação.', en: 'Viewing candidate promises side by side is a fundamental service. No registration. No paywall. No mediation.', es: 'Ver las promesas lado a lado es un servicio fundamental. Sin registro ni paywall.', fr: 'Voir les promesses côte à côte est un service fondamental. Sans barrières.', de: 'Versprechen nebeneinander zu sehen ist ein grundlegender Service.', ar: 'رؤية الوعود جنباً إلى جنب خدمة أساسية.' } },
    { num: 'V',    name: { pt: 'Rastreabilidade Documental',       en: 'Documentary Traceability',        es: 'Trazabilidad Documental',           fr: 'Traçabilité Documentaire',          de: 'Dokumentarische Nachvollziehbarkeit', ar: 'إمكانية تتبع المستندات' },
                   desc: { pt: 'Nenhum registro existe sem URL exata, carimbo de tempo, hash SHA-256 e link de arquivo. Proveniência é o produto.', en: 'No record exists without exact URL, timestamp, SHA-256 hash, and archive link. Provenance is the product.', es: 'Ningún registro existe sin URL exacta, marca temporal y hash SHA-256.', fr: 'Aucun enregistrement sans URL exacte, horodatage et hash SHA-256.', de: 'Kein Datensatz ohne exakte URL, Zeitstempel und SHA-256 Hash.', ar: 'لا يوجد سجل بدون URL دقيق وطابع زمني وهاش.' } },
    { num: 'VI',   name: { pt: 'Independência Política',           en: 'Political Independence',           es: 'Independencia Política',            fr: 'Indépendance Politique',            de: 'Politische Unabhängigkeit',         ar: 'الاستقلال السياسي' },
                   desc: { pt: 'Zero comunicação com campanhas. Zero financiamento político. Lemos apenas o que é publicado publicamente.', en: 'Zero communication with campaigns. Zero political funding. We read only what is publicly published.', es: 'Cero comunicación con campañas. Cero financiación política.', fr: 'Zéro communication avec les campagnes. Zéro financement politique.', de: 'Null Kommunikation mit Kampagnen. Null politische Finanzierung.', ar: 'صفر تواصل مع الحملات. صفر تمويل سياسي.' } },
    { num: 'VII',  name: { pt: 'Infraestrutura Aberta',            en: 'Open Infrastructure',              es: 'Infraestructura Abierta',           fr: 'Infrastructure Ouverte',            de: 'Offene Infrastruktur',              ar: 'البنية التحتية المفتوحة' },
                   desc: { pt: 'O código, a metodologia e o protocolo POCVA-01 são totalmente open source (AGPL v3.0). Qualquer um pode auditar.', en: 'The code, methodology, and POCVA-01 protocol are fully open source (AGPL v3.0). Anyone can audit.', es: 'El código y el protocolo son completamente open source (AGPL v3.0).', fr: 'Le code et le protocole sont entièrement open source (AGPL v3.0).', de: 'Code und Protokoll sind vollständig Open Source (AGPL v3.0).', ar: 'الكود والبروتوكول مفتوح المصدر بالكامل (AGPL v3.0).' } },
    { num: 'VIII', name: { pt: 'Zero Interferência Comercial',     en: 'Zero Commercial Interference',    es: 'Cero Interferencia Comercial',      fr: 'Zéro Interférence Commerciale',     de: 'Null Kommerzielle Einmischung',     ar: 'انعدام التدخل التجاري' },
                   desc: { pt: 'Nenhuma transação financeira distorce visibilidade ou posicionamento. A receita da API subsidia o acesso público gratuito.', en: 'No financial transaction distorts visibility or placement. API revenue subsidizes free public access.', es: 'Ninguna transacción distorsiona la visibilidad. Los ingresos de la API subsidian el acceso gratuito.', fr: "Aucune transaction ne distord la visibilité. Les revenus de l'API subventionnent l'accès gratuit.", de: 'Keine Finanztransaktion verzerrt die Sichtbarkeit. API-Einnahmen subventionieren den freien Zugang.', ar: 'لا معاملة مالية تشوّه الرؤية. عائدات API تدعم الوصول المجاني.' } },
  ]

  const categories = [
    { pt: 'Economia & Fiscal',           en: 'Economy & Fiscal',           es: 'Economía & Fiscal',           fr: 'Économie & Fiscal',          de: 'Wirtschaft & Finanzen',  ar: 'الاقتصاد والمالية',      emoji: '💰' },
    { pt: 'Educação & Cultura',          en: 'Education & Culture',        es: 'Educación & Cultura',         fr: 'Éducation & Culture',        de: 'Bildung & Kultur',       ar: 'التعليم والثقافة',       emoji: '📚' },
    { pt: 'Saúde & Saneamento',          en: 'Health & Sanitation',        es: 'Salud & Saneamiento',         fr: 'Santé & Assainissement',     de: 'Gesundheit',             ar: 'الصحة',                  emoji: '🏥' },
    { pt: 'Segurança & Justiça',         en: 'Safety & Justice',           es: 'Seguridad & Justicia',        fr: 'Sécurité & Justice',         de: 'Sicherheit & Justiz',    ar: 'الأمن والعدالة',         emoji: '⚖️' },
    { pt: 'Meio Ambiente & Clima',       en: 'Environment & Climate',      es: 'Medio Ambiente & Clima',      fr: 'Environnement & Climat',     de: 'Umwelt & Klima',         ar: 'البيئة والمناخ',         emoji: '🌿' },
    { pt: 'Assistência Social',          en: 'Social Assistance',          es: 'Asistencia Social',           fr: 'Assistance Sociale',         de: 'Soziale Hilfe',          ar: 'المساعدة الاجتماعية',    emoji: '🤝' },
    { pt: 'Direitos Humanos',            en: 'Human Rights',               es: 'Derechos Humanos',            fr: "Droits de l'Homme",          de: 'Menschenrechte',         ar: 'حقوق الإنسان',           emoji: '🏳️' },
    { pt: 'Infraestrutura & Transporte', en: 'Infrastructure & Transport', es: 'Infraestructura & Transporte',fr: 'Infrastructure & Transport',  de: 'Infrastruktur',          ar: 'البنية التحتية',         emoji: '🏗️' },
    { pt: 'Governança & Reforma',        en: 'Governance & Reform',        es: 'Gobernanza & Reforma',        fr: 'Gouvernance & Réforme',      de: 'Regierungsführung',      ar: 'الحوكمة والإصلاح',       emoji: '🏛️' },
  ]

  function getCatLabel(c: typeof categories[0]): string {
    return (c as any)[locale] || c['en']
  }

  return (
    <>
      <style>{`
        /* ── RESET & BASE ─────────────────────────────────────── */
        :root {
          --ink: #0B1D2E;
          --paper: #F5F0E8;
          --gold: #C8A96E;
          --gold-dark: #8B6914;
          --rule: rgba(11,29,46,0.12);
          --muted: rgba(11,29,46,0.50);
          --container: min(100%, 1280px);
          --pad-x: clamp(20px, 5vw, 64px);
          --pad-section: clamp(48px, 8vw, 96px);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .wc-body {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: var(--paper);
          color: var(--ink);
          overflow-x: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── HERO — mobile-first, desktop 2 cols ─────────────── */
        .hero {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 100svh;
          position: relative;
        }
        @media(min-width: 768px) {
          .hero {
            grid-template-columns: 1fr 1fr;
            min-height: 90vh;
          }
          .hero-divider { display: block !important; }
          .vs-mark     { display: flex !important; }
        }
        .hero-divider {
          display: none;
          position: absolute;
          left: 50%; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom,transparent,var(--rule) 15%,var(--rule) 85%,transparent);
          z-index: 5;
        }
        .vs-mark {
          display: none;
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%,-50%);
          z-index: 10;
          width: 44px; height: 44px;
          background: var(--gold);
          border-radius: 50%;
          align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; font-weight: 700;
          color: var(--ink);
          letter-spacing: 0.5px;
          box-shadow: 0 0 0 8px rgba(200,169,110,0.10);
        }
        .side-a {
          background: var(--ink);
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(48px,8vw,80px) var(--pad-x);
        }
        .side-b {
          background: var(--paper);
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(48px,8vw,80px) var(--pad-x);
          border-top: 1px solid var(--rule);
        }
        @media(min-width:768px) { .side-b { border-top: none; } }
        .side-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; font-weight: 500;
          letter-spacing: 2.5px; text-transform: uppercase;
          margin-bottom: 24px;
        }
        .side-tag-a { color: rgba(200,169,110,0.75); }
        .side-tag-b { color: var(--gold-dark); }
        .hero-hed-a {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px,6vw,72px);
          font-weight: 900; color: var(--paper);
          line-height: 1.0; letter-spacing: -1.5px;
          margin-bottom: 24px;
        }
        .hero-hed-b {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px,5.5vw,68px);
          font-weight: 400; font-style: italic;
          color: var(--ink);
          line-height: 1.05; letter-spacing: -1px;
          margin-bottom: 24px;
        }
        .hero-dek {
          font-size: clamp(13px,1.6vw,15px);
          font-weight: 300; line-height: 1.85;
          max-width: 380px; margin-bottom: 36px;
        }
        .hero-dek-a { color: rgba(245,240,232,0.60); }
        .hero-dek-b { color: rgba(11,29,46,0.55); }
        .cta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .btn-a {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          background: var(--gold); color: var(--ink);
          border: none; padding: 14px 24px;
          cursor: pointer; border-radius: 2px;
          text-decoration: none; display: inline-block;
          min-height: 48px; /* touch target */
        }
        .btn-b {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          background: var(--ink); color: var(--paper);
          border: none; padding: 14px 24px;
          cursor: pointer; border-radius: 2px;
          text-decoration: none; display: inline-block;
          min-height: 48px;
        }
        .btn-ghost {
          font-size: 10px; font-weight: 400;
          color: rgba(245,240,232,0.40);
          background: none; border: none;
          cursor: pointer; text-decoration: underline;
          text-underline-offset: 3px;
          min-height: 48px; padding: 0 4px;
        }

        /* ── ELECTIONS ────────────────────────────────────────── */
        .elections-sec {
          padding: var(--pad-section) var(--pad-x);
          background: var(--paper);
        }
        .sec-eyebrow {
          display: flex; align-items: baseline;
          gap: 16px; margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .sec-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--muted);
        }
        .sec-hed {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px,4vw,36px);
          font-weight: 700; color: var(--ink);
          letter-spacing: -0.5px;
        }

        /* ── STATS ────────────────────────────────────────────── */
        .stats {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        @media(min-width:768px) {
          .stats { grid-template-columns: repeat(4,1fr); }
        }
        .stat {
          padding: clamp(28px,5vw,44px) clamp(16px,3vw,32px);
          border-right: 1px solid var(--rule);
        }
        .stat:nth-child(2) { border-right: none; }
        @media(min-width:768px) {
          .stat:nth-child(2) { border-right: 1px solid var(--rule); }
          .stat:last-child   { border-right: none; }
        }
        .stat:nth-child(3),
        .stat:nth-child(4) { border-top: 1px solid var(--rule); }
        @media(min-width:768px) {
          .stat:nth-child(3),
          .stat:nth-child(4) { border-top: none; }
        }
        .stat-val {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px,5vw,48px);
          font-weight: 700; color: var(--ink);
          line-height: 1; margin-bottom: 8px;
        }
        .stat-val span { color: var(--gold); }
        .stat-lab {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: clamp(11px,1.4vw,13px);
          font-weight: 300; color: var(--muted);
        }

        /* ── MANIFESTO BAND ───────────────────────────────────── */
        .mband {
          background: var(--ink);
          display: grid;
          grid-template-columns: 1fr;
        }
        @media(min-width:768px) {
          .mband { grid-template-columns: 1fr 1px 1.2fr; }
          .mband-rule { display: block !important; }
        }
        .mband-rule {
          display: none;
          background: rgba(200,169,110,0.2);
        }
        .mband-quote {
          padding: clamp(40px,7vw,72px) var(--pad-x);
          display: flex; flex-direction: column; justify-content: center;
        }
        .mband-quote p {
          font-family: 'Playfair Display', serif;
          font-size: clamp(17px,2.5vw,26px);
          font-style: italic; font-weight: 400;
          color: rgba(245,240,232,0.78);
          line-height: 1.65;
        }
        .mband-quote p em {
          color: var(--gold); font-style: normal; font-weight: 600;
        }
        .mband-text {
          padding: clamp(40px,7vw,72px) var(--pad-x);
          display: flex; flex-direction: column;
          justify-content: center; gap: 20px;
        }
        .mband-text p {
          font-size: clamp(13px,1.5vw,15px);
          font-weight: 300;
          color: rgba(245,240,232,0.68);
          line-height: 1.95;
          padding-left: 18px;
          border-left: 1px solid rgba(200,169,110,0.35);
        }

        /* ── PILLARS ──────────────────────────────────────────── */
        .pillars-sec {
          padding: var(--pad-section) var(--pad-x);
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 2px;
          background: var(--rule);
          border: 1px solid var(--rule);
        }
        @media(min-width:900px) {
          .pillars-grid { grid-template-columns: repeat(4,1fr); }
        }
        .pillar {
          background: var(--paper);
          padding: clamp(20px,3vw,32px) clamp(16px,2vw,24px);
          transition: background .22s;
        }
        .pillar:hover { background: var(--ink); }
        .pillar:hover .p-num { color: var(--gold) !important; }
        .pillar:hover .p-name { color: var(--paper) !important; }
        .pillar:hover .p-desc { color: rgba(245,240,232,0.50) !important; }
        .p-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; font-weight: 500;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--muted); margin-bottom: 14px;
          transition: color .22s;
        }
        .p-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(15px,1.8vw,18px);
          font-weight: 700; color: var(--ink);
          margin-bottom: 10px; line-height: 1.25;
          transition: color .22s;
        }
        .p-desc {
          font-size: clamp(11px,1.2vw,12px);
          font-weight: 300; color: rgba(11,29,46,0.55);
          line-height: 1.75; transition: color .22s;
        }

        /* ── CATEGORIES ───────────────────────────────────────── */
        .cats-sec {
          background: var(--ink);
          padding: clamp(40px,6vw,72px) var(--pad-x);
        }
        .cats-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; font-weight: 500;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(200,169,110,0.70);
          margin-bottom: 20px;
        }
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 1px;
          background: rgba(200,169,110,0.15);
        }
        @media(min-width:600px) { .cats-grid { grid-template-columns: repeat(5,1fr); } }
        @media(min-width:900px) { .cats-grid { grid-template-columns: repeat(9,1fr); } }
        .cat-box {
          background: var(--ink);
          padding: clamp(14px,2vw,20px) 8px;
          text-align: center;
          transition: background .2s;
          cursor: default;
        }
        .cat-box:hover { background: rgba(200,169,110,0.10); }
        .cat-emoji { font-size: 18px; margin-bottom: 6px; display: block; }
        .cat-name {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: clamp(9px,1.1vw,11px);
          font-weight: 400;
          color: rgba(245,240,232,0.55);
          line-height: 1.4;
        }
        .cat-bar {
          width: 16px; height: 1.5px;
          background: var(--gold);
          margin: 6px auto 0; border-radius: 1px; opacity: .4;
        }

        /* ── FOOTER ───────────────────────────────────────────── */
        .wc-footer {
          background: var(--ink);
          padding: clamp(40px,6vw,64px) var(--pad-x) clamp(24px,3vw,36px);
        }
        .foot-top {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding-bottom: 36px;
          border-bottom: 1px solid rgba(245,240,232,0.07);
          margin-bottom: 24px;
        }
        @media(min-width:768px) {
          .foot-top { grid-template-columns: 1fr 1fr 1fr; }
        }
        .foot-brand {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: var(--paper); margin-bottom: 8px;
        }
        .foot-brand span { color: var(--gold); }
        .foot-tagline {
          font-size: 11px; font-weight: 300;
          color: rgba(245,240,232,0.35);
          line-height: 1.8; max-width: 260px;
        }
        .foot-record {
          font-size: 10px; font-style: italic;
          color: rgba(200,169,110,0.50);
          margin-top: 10px;
        }
        .foot-col-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          color: rgba(200,169,110,0.60);
          margin-bottom: 14px;
        }
        .foot-links { list-style: none; }
        .foot-links li { margin-bottom: 10px; }
        .foot-links a {
          font-size: 11px; font-weight: 300;
          color: rgba(245,240,232,0.40);
          text-decoration: none; transition: color .2s;
          min-height: 44px; display: inline-block;
          line-height: 44px;
        }
        .foot-links a:hover { color: rgba(245,240,232,0.80); }
        .foot-bottom {
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .foot-copy {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; color: rgba(245,240,232,0.20);
          letter-spacing: 0.04em;
        }
        .foot-neutral {
          display: flex; align-items: center; gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; color: rgba(245,240,232,0.25);
          letter-spacing: 0.04em;
        }
        .gold-dot {
          width: 5px; height: 5px;
          border-radius: 50%; background: var(--gold); opacity: .6;
        }
      `}</style>

      <div className="wc-body" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="hero" aria-label="Hero">
          <div className="side-a">
            <p className="side-tag side-tag-a">{copy.tagA}</p>
            <h1 className="hero-hed-a">{copy.hedA}</h1>
            <p className="hero-dek hero-dek-a">{copy.dekA}</p>
            <div className="cta-row">
              {elections[0] && (
                <Link href={`/${locale}/compare/${elections[0].id}`} className="btn-a">
                  {copy.ctaA}
                </Link>
              )}
              <button className="btn-ghost">{copy.manifesto}</button>
            </div>
          </div>

          <div className="hero-divider" aria-hidden="true" />
          <div className="vs-mark" aria-hidden="true">⊕</div>

          <div className="side-b">
            <p className="side-tag side-tag-b">{copy.tagB}</p>
            <h2 className="hero-hed-b">{copy.hedB}</h2>
            <p className="hero-dek hero-dek-b">{copy.dekB}</p>
            <div className="cta-row">
              <a href="#elections" className="btn-b">{copy.ctaB}</a>
            </div>
          </div>
        </section>

        {/* ── ELECTIONS — imediatamente após o hero ────────────── */}
        <section className="elections-sec" id="elections" aria-label={copy.elecHed}>
          <div className="sec-eyebrow">
            <span className="sec-num">{copy.elecEye}</span>
            <h2 className="sec-hed">{copy.elecHed}</h2>
          </div>
          {/* ElectionGrid: client component com filtro de busca */}
          <ElectionGrid elections={elections} locale={locale} />
        </section>

        {/* ── STATS — dados reais ──────────────────────────────── */}
        <div className="stats" role="region" aria-label="Statistics">
          <div className="stat">
            <div className="stat-val">{totalElections}<span> ↑</span></div>
            <div className="stat-lab">{copy.stat1}</div>
          </div>
          <div className="stat">
            <div className="stat-val">{totalPromises}<span>+</span></div>
            <div className="stat-lab">{copy.stat2}</div>
          </div>
          <div className="stat">
            <div className="stat-val">0<span>%</span></div>
            <div className="stat-lab">{copy.stat3}</div>
          </div>
          <div className="stat">
            <div className="stat-val">{totalCandidates}<span>+</span></div>
            <div className="stat-lab">{copy.stat4}</div>
          </div>
        </div>

        {/* ── MANIFESTO BAND ───────────────────────────────────── */}
        <div className="mband" role="region" aria-label="Mission statement">
          <div className="mband-quote">
            <p>
              {copy.quote.before}
              <em>{copy.quote.highlight}</em>
              {copy.quote.after}
            </p>
          </div>
          <div className="mband-rule" aria-hidden="true" />
          <div className="mband-text">
            <p>{copy.mbandP1}</p>
            <p>{copy.mbandP2}</p>
          </div>
        </div>

        {/* ── PILLARS ──────────────────────────────────────────── */}
        <section className="pillars-sec" aria-label={copy.pillarsHed}>
          <div className="sec-eyebrow">
            <span className="sec-num">{copy.pillarsEye}</span>
            <h2 className="sec-hed">{copy.pillarsHed}</h2>
          </div>
          <div className="pillars-grid">
            {pillars.map(p => (
              <div key={p.num} className="pillar">
                <p className="p-num">{p.num}</p>
                <h3 className="p-name">{(p.name as any)[locale] || p.name['en']}</h3>
                <p className="p-desc">{(p.desc as any)[locale] || p.desc['en']}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ───────────────────────────────────────── */}
        <section className="cats-sec" aria-label="Promise categories">
          <p className="cats-label">{copy.catsLabel}</p>
          <div className="cats-grid">
            {categories.map((c, i) => (
              <div key={i} className="cat-box">
                <span className="cat-emoji" aria-hidden="true">{c.emoji}</span>
                <p className="cat-name">{getCatLabel(c)}</p>
                <div className="cat-bar" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer className="wc-footer" role="contentinfo">
          <div className="foot-top">
            <div>
              <div className="foot-brand">World<span>Contrast</span></div>
              <p className="foot-tagline">{copy.footTagline}</p>
              {/* "Nós somos o registro" — apenas no footer, não no hero */}
              <p className="foot-record">{copy.footRecord}</p>
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
            <div className="foot-neutral">
              <div className="gold-dot" aria-hidden="true" />
              {copy.footNeutral}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
