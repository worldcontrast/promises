/**
 * World Contrast — Homepage v13.0
 * File: frontend/src/app/[locale]/page.tsx
 *
 * Narrativa realinhada:
 * - "A verdade emerge do contraste" → REMOVIDA
 * - Nova âncora: "Registro histórico autenticado, fiel e permanente."
 * - Nova assinatura: "Não somos a verdade. Somos o espelho."
 * - Hero: posicionamento de registro/cartório, não de julgamento
 * - Stats: dinâmicos, dados reais
 * - Manifesto band: nova citação institucional
 * - Eleições: imediatamente após o hero (Sprint 1.5)
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

  // Stats dinâmicos — dados reais
  const totalElections  = elections.length
  const totalPromises   = elections.reduce((s, e) => s + e.promiseCount, 0)
  const totalCandidates = elections.reduce((s, e) => s + e.candidateCount, 0)

  // ── COPY — todos os idiomas ──────────────────────────────────
  const t = {
    en: {
      // HERO
      tagA: 'Official Record · Candidate A',
      tagB: 'Official Record · Candidate B',
      hedA: <>Authenticated.<br />Faithful.<br />Permanent.</>,
      hedB: <>We are not<br />the truth.<br />We are the mirror.</>,
      dekA: "WorldContrast is a permanent authenticated historical registry of political campaign promises. We record what was promised — verbatim, with source, date, and cryptographic seal. The judgment belongs to the citizen.",
      dekB: "Every commitment documented here was extracted directly from official primary sources, under a neutral rule-based algorithm. No human editorial judgment was applied. No candidate is favored.",
      ctaA: 'Access the Registry',
      ctaB: 'Select a Jurisdiction',
      manifesto: 'Read the Operational Rules',
      liveOps: 'Active Operations',
      // STATS
      stat1: 'Active elections',
      stat2: 'Sealed records',
      stat3: 'Algorithmic bias',
      stat4: 'Candidates registered',
      // QUOTE — nova âncora
      quote: {
        before: '"We faithfully register what was promised. ',
        highlight: 'Ipsis litteris.',
        after: ' With source. With date. With seal. The judgment is yours."',
      },
      mbandP1: 'During electoral periods, the excess of speeches and fragmented narratives makes objective analysis difficult. WorldContrast does not analyze. It does not interpret. It does not editorialize. It registers — exclusively from verified official channels: government plans submitted to electoral courts, official websites, and institutional public declarations.',
      mbandP2: 'We never contact campaigns. We never highlight candidates. We never accept funding from political actors. Each extracted commitment receives a cryptographic seal of authenticity (SHA-256) and is permanently archived for civil, academic, and journalistic scrutiny — in 142 countries.',
      // PILLARS
      pillarsEye: '01 — Foundational Architecture',
      pillarsHed: 'The Eight Institutional Pillars',
      catsLabel: '9 categories — applied identically to every candidate in every country.',
      // ELECTIONS
      elecEye: '02 — Active Registry',
      elecHed: 'Select Jurisdiction',
      // FOOTER
      footTagline: 'Permanent authenticated historical registry of political campaign promises.',
      footCopy: '© 2026 WorldContrast — Independent initiative. All data open source.',
      footNeutral: 'Zero bias · Zero contact · Zero agenda',
      footPlatform: 'Infrastructure',
      footMission: 'Institutional Policy',
      howItWorks: 'Extraction methodology',
      compareTool: 'Global index',
      liveEl: 'Active jurisdictions',
      openData: 'Open Data / REST API',
      manifestoV: 'Manifesto v2.0',
      eightPillars: 'Operational rules',
      transparency: 'Audit logs',
      contribute: 'Registry access',
    },
    pt: {
      tagA: 'Registro Oficial · Candidato A',
      tagB: 'Registro Oficial · Candidato B',
      hedA: <>Autenticado.<br />Fiel.<br />Permanente.</>,
      hedB: <>Não somos<br />a verdade.<br />Somos o espelho.</>,
      dekA: "O WorldContrast é um registro histórico autenticado e permanente das promessas de campanha política. Registramos o que foi prometido — ipsis litteris, com fonte, data e selo criptográfico. O julgamento pertence ao cidadão.",
      dekB: "Cada compromisso documentado aqui foi extraído diretamente de fontes primárias oficiais, sob um algoritmo neutro e orientado por regras. Nenhum julgamento editorial humano foi aplicado. Nenhum candidato é favorecido.",
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
        after: ' Com fonte. Com data. Com selo. O julgamento é seu."',
      },
      mbandP1: 'Durante períodos eleitorais, o excesso de discursos e narrativas fragmentadas dificulta a análise objetiva. O WorldContrast não analisa. Não interpreta. Não editorializa. Registra — exclusivamente de canais oficiais verificados: planos de governo submetidos a tribunais, sites oficiais e declarações públicas institucionais.',
      mbandP2: 'Nunca contatamos campanhas. Nunca destacamos candidatos. Nunca aceitamos financiamento de atores políticos. Cada compromisso extraído recebe um selo criptográfico de autenticidade (SHA-256) e é arquivado permanentemente para escrutínio civil, acadêmico e jornalístico — em 142 países.',
      pillarsEye: '01 — Arquitetura Fundacional',
      pillarsHed: 'Os Oito Pilares Institucionais',
      catsLabel: '9 categorias — aplicadas identicamente a qualquer candidato em qualquer país.',
      elecEye: '02 — Registro Ativo',
      elecHed: 'Selecione a Jurisdição',
      footTagline: 'Registro histórico autenticado, fiel e permanente das promessas de campanha política.',
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
    es: {
      tagA: 'Registro Oficial · Candidato A',
      tagB: 'Registro Oficial · Candidato B',
      hedA: <>Autenticado.<br />Fiel.<br />Permanente.</>,
      hedB: <>No somos<br />la verdad.<br />Somos el espejo.</>,
      dekA: "WorldContrast es un registro histórico autenticado y permanente de promesas de campaña política. Registramos lo prometido — ipsis litteris, con fuente, fecha y sello criptográfico. El juicio le pertenece al ciudadano.",
      dekB: "Cada compromiso documentado aquí fue extraído directamente de fuentes primarias oficiales, bajo un algoritmo neutral. Ningún juicio editorial humano fue aplicado. Ningún candidato es favorecido.",
      ctaA: 'Acceder al Registro',
      ctaB: 'Seleccionar Jurisdicción',
      manifesto: 'Leer las Reglas Operativas',
      liveOps: 'Operaciones Activas',
      stat1: 'Elecciones activas',
      stat2: 'Registros asegurados',
      stat3: 'Sesgo algorítmico',
      stat4: 'Candidatos registrados',
      quote: {
        before: '"Registramos fielmente lo prometido. ',
        highlight: 'Ipsis litteris.',
        after: ' Con fuente. Con fecha. Con sello. El juicio es suyo."',
      },
      mbandP1: 'Durante los períodos electorales, el exceso de discursos y narrativas fragmentadas dificulta el análisis objetivo. WorldContrast no analiza. No interpreta. No editorializa. Registra — exclusivamente de canales oficiales verificados.',
      mbandP2: 'Nunca contactamos campañas. Nunca destacamos candidatos. Nunca aceptamos financiación de actores políticos. Cada compromiso extraído recibe un sello criptográfico de autenticidad (SHA-256) y se archiva permanentemente.',
      pillarsEye: '01 — Arquitectura Fundacional',
      pillarsHed: 'Los Ocho Pilares Institucionales',
      catsLabel: '9 categorías — aplicadas idénticamente a cualquier candidato en cualquier país.',
      elecEye: '02 — Registro Activo',
      elecHed: 'Seleccione Jurisdicción',
      footTagline: 'Registro histórico autenticado, fiel y permanente de promesas de campaña política.',
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
      transparency: 'Logs de Auditoría',
      contribute: 'Acceso al Registro',
    },
    fr: {
      tagA: 'Registre Officiel · Candidat A',
      tagB: 'Registre Officiel · Candidat B',
      hedA: <>Authentifié.<br />Fidèle.<br />Permanent.</>,
      hedB: <>Nous ne sommes<br />pas la vérité.<br />Nous sommes le miroir.</>,
      dekA: "WorldContrast est un registre historique authentifié et permanent des promesses de campagne politique. Nous enregistrons ce qui a été promis — ipsis litteris, avec source, date et sceau cryptographique. Le jugement appartient au citoyen.",
      dekB: "Chaque engagement documenté ici a été extrait directement de sources primaires officielles, sous un algorithme neutre. Aucun jugement éditorial humain n'a été appliqué. Aucun candidat n'est favorisé.",
      ctaA: 'Accéder au Registre',
      ctaB: 'Sélectionner une Juridiction',
      manifesto: "Lire les Règles Opérationnelles",
      liveOps: 'Opérations Actives',
      stat1: 'Élections actives',
      stat2: 'Registres sécurisés',
      stat3: 'Biais algorithmique',
      stat4: 'Candidats enregistrés',
      quote: {
        before: '"Nous enregistrons fidèlement ce qui a été promis. ',
        highlight: 'Ipsis litteris.',
        after: ' Avec source. Avec date. Avec sceau. Le jugement vous appartient."',
      },
      mbandP1: "En période électorale, l'excès de discours et de récits fragmentés rend l'analyse objective difficile. WorldContrast n'analyse pas. N'interprète pas. N'éditorialise pas. Il enregistre — exclusivement depuis des canaux officiels vérifiés.",
      mbandP2: "Nous ne contactons jamais les campagnes. Nous ne mettons jamais en avant des candidats. Nous n'acceptons jamais de financement d'acteurs politiques. Chaque engagement extrait reçoit un sceau cryptographique (SHA-256) et est archivé de façon permanente.",
      pillarsEye: '01 — Architecture Fondatrice',
      pillarsHed: 'Les Huit Piliers Institutionnels',
      catsLabel: '9 catégories — appliquées identiquement à chaque candidat dans chaque pays.',
      elecEye: '02 — Registre Actif',
      elecHed: 'Sélectionner une Juridiction',
      footTagline: 'Registre historique authentifié, fidèle et permanent des promesses de campagne politique.',
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
    de: {
      tagA: 'Offizielles Register · Kandidat A',
      tagB: 'Offizielles Register · Kandidat B',
      hedA: <>Authentifiziert.<br />Getreu.<br />Permanent.</>,
      hedB: <>Wir sind nicht<br />die Wahrheit.<br />Wir sind der Spiegel.</>,
      dekA: "WorldContrast ist ein permanentes, authentifiziertes historisches Register politischer Wahlkampfversprechen. Wir zeichnen auf, was versprochen wurde — ipsis litteris, mit Quelle, Datum und kryptografischem Siegel. Das Urteil gehört dem Bürger.",
      dekB: "Jede hier dokumentierte Verpflichtung wurde direkt aus offiziellen Primärquellen unter einem neutralen regelbasierten Algorithmus extrahiert. Kein menschliches redaktionelles Urteil wurde angewendet.",
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
        after: ' Mit Quelle. Mit Datum. Mit Siegel. Das Urteil gehört Ihnen."',
      },
      mbandP1: 'In Wahlkampfzeiten erschwert das Übermaß an Reden und fragmentierten Narrativen eine objektive Analyse. WorldContrast analysiert nicht. Interpretiert nicht. Editorialisiert nicht. Es registriert — ausschließlich aus verifizierten offiziellen Kanälen.',
      mbandP2: 'Wir kontaktieren niemals Kampagnen. Wir heben niemals Kandidaten hervor. Wir akzeptieren niemals Finanzierung von politischen Akteuren. Jede extrahierte Verpflichtung erhält ein kryptografisches Echtheitssigel (SHA-256) und wird dauerhaft archiviert.',
      pillarsEye: '01 — Grundlegende Architektur',
      pillarsHed: 'Die Acht Institutionellen Säulen',
      catsLabel: '9 Kategorien — identisch auf jeden Kandidaten in jedem Land angewendet.',
      elecEye: '02 — Aktives Register',
      elecHed: 'Zuständigkeit auswählen',
      footTagline: 'Permanentes authentifiziertes historisches Register politischer Wahlkampfversprechen.',
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
    ar: {
      tagA: 'السجل الرسمي · المرشح أ',
      tagB: 'السجل الرسمي · المرشح ب',
      hedA: <>موثّق.<br />أمين.<br />دائم.</>,
      hedB: <>لسنا<br />الحقيقة.<br />نحن المرآة.</>,
      dekA: "WorldContrast سجل تاريخي موثّق ودائم لوعود الحملات الانتخابية السياسية. نسجّل ما وُعد به — حرفياً، مع المصدر والتاريخ والختم التشفيري. الحكم يعود للمواطن.",
      dekB: "كل التزام موثّق هنا تم استخراجه مباشرة من المصادر الأولية الرسمية، بموجب خوارزمية محايدة. لم يُطبَّق أي حكم تحريري بشري. لا يُفضَّل أي مرشح.",
      ctaA: 'الوصول إلى السجل',
      ctaB: 'حدد ولاية قضائية',
      manifesto: 'قراءة القواعد التشغيلية',
      liveOps: 'العمليات النشطة',
      stat1: 'انتخابات نشطة',
      stat2: 'السجلات المختومة',
      stat3: 'التحيز الخوارزمي',
      stat4: 'المرشحون المسجّلون',
      quote: {
        before: '"نسجّل بأمانة ما وُعد به. ',
        highlight: 'حرفياً.',
        after: ' مع المصدر. مع التاريخ. مع الختم. الحكم لك."',
      },
      mbandP1: 'خلال الفترات الانتخابية، يعيق كثرة الخطابات والروايات المجزأة التحليل الموضوعي. WorldContrast لا يحلل. لا يفسر. لا يرير رأياً. يسجّل — حصراً من القنوات الرسمية الموثّقة.',
      mbandP2: 'لا نتصل أبداً بالحملات. لا نسلط الضوء أبداً على مرشحين. لا نقبل أبداً تمويلاً من الفاعلين السياسيين. يتلقى كل التزام مستخرج ختم أصالة مشفراً (SHA-256) ويُحفظ بشكل دائم.',
      pillarsEye: '01 — البنية التأسيسية',
      pillarsHed: 'الركائز المؤسسية الثمانية',
      catsLabel: '9 فئات — تُطبق بشكل متطابق على كل مرشح في كل دولة.',
      elecEye: '02 — السجل النشط',
      elecHed: 'حدد الولاية القضائية',
      footTagline: 'سجل تاريخي موثّق وأمين ودائم لوعود الحملات الانتخابية السياسية.',
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
  } as Record<string, any>

  const copy = t[locale] || t['en']

  const pillars = [
    { num: 'I',    name: { en: 'Strict Editorial Neutrality', pt: 'Neutralidade Editorial Rigorosa', es: 'Neutralidad Editorial Estricta', fr: 'Neutralité Éditoriale Stricte', de: 'Strenge redaktionelle Neutralität', ar: 'حياد تحريري صارم' }, desc: { en: 'We do not opine, interpret, or judge. The registry is the only artifact. The citizen is the judge.', pt: 'Não opinamos, interpretamos ou julgamos. O registro é o único artefato. O cidadão é o juiz.', es: 'No opinamos, interpretamos o juzgamos. El registro es el único artefacto. El ciudadano es el juez.', fr: 'Nous ne jugeons ni n\'interprétons. Le registre est le seul artefact. Le citoyen est le juge.', de: 'Wir urteilen nicht. Das Register ist das einzige Artefakt. Der Bürger ist der Richter.', ar: 'لا نرى أو نفسر أو نحكم. السجل هو الأداة الوحيدة. المواطن هو الحكم.' } },
    { num: 'II',   name: { en: 'Technological Equivalence', pt: 'Equivalência Tecnológica', es: 'Equivalencia Tecnológica', fr: 'Équivalence Technologique', de: 'Technologische Äquivalenz', ar: 'التكافؤ التكنولوجي' }, desc: { en: 'Processing limits are identical for every political actor. Algorithmic symmetry is absolute.', pt: 'Os limites de processamento são idênticos para todo ator político. A simetria algorítmica é absoluta.', es: 'Los límites de procesamiento son idénticos para cada actor. La simetría algorítmica es absoluta.', fr: 'Les limites sont identiques pour chaque acteur. La symétrie algorithmique est absolue.', de: 'Die Grenzen sind für jeden Akteur identisch. Die algorithmische Symmetrie ist absolut.', ar: 'حدود المعالجة متطابقة لكل فاعل. التناظر الخوارزمي مطلق.' } },
    { num: 'III',  name: { en: 'Permanent Public Audit', pt: 'Auditoria Pública Permanente', es: 'Auditoría Pública Permanente', fr: 'Audit Public Permanent', de: 'Permanente öffentliche Prüfung', ar: 'تدقيق عام دائم' }, desc: { en: 'Every statement is cryptographically sealed into the permanent record. Nothing is silently discarded.', pt: 'Toda declaração é lacrada criptograficamente no registro permanente. Nada é descartado silenciosamente.', es: 'Toda declaración es sellada criptográficamente en el registro permanente.', fr: 'Chaque déclaration est scellée cryptographiquement dans le registre permanent.', de: 'Jede Aussage wird kryptografisch im permanenten Register versiegelt.', ar: 'يتم ختم كل بيان بشكل مشفر في السجل الدائم.' } },
    { num: 'IV',   name: { en: 'Right to Compare', pt: 'Direito à Comparação Direta', es: 'Derecho a Comparar', fr: 'Droit à la Comparaison', de: 'Recht auf Vergleich', ar: 'حق المقارنة' }, desc: { en: 'Viewing commitments side by side is a fundamental civic right. No barriers. No mediation.', pt: 'Ver compromissos lado a lado é um direito cívico fundamental. Sem barreiras. Sem mediação.', es: 'Ver compromisos lado a lado es un derecho cívico fundamental. Sin barreras. Sin mediación.', fr: 'Voir les engagements côte à côte est un droit civique fondamental. Sans barrières.', de: 'Verpflichtungen nebeneinander zu sehen ist ein bürgerliches Grundrecht.', ar: 'رؤية الالتزامات جنباً إلى جنب هو حق مدني أساسي.' } },
    { num: 'V',    name: { en: 'Documentary Traceability', pt: 'Rastreabilidade Documental', es: 'Trazabilidad Documental', fr: 'Traçabilité Documentaire', de: 'Dokumentarische Nachvollziehbarkeit', ar: 'إمكانية تتبع المستندات' }, desc: { en: 'No record exists without its exact source URL, timestamp, and immutable archive copy.', pt: 'Nenhum registro existe sem URL exato, registro temporal e cópia de arquivo imutável.', es: 'Ningún registro existe sin URL exacta, marca temporal y copia de archivo inmutable.', fr: 'Aucun enregistrement sans URL exacte, horodatage et copie d\'archive immuable.', de: 'Kein Datensatz ohne exakte URL, Zeitstempel und unveränderliche Archivkopie.', ar: 'لا يوجد سجل بدون عنوان URL الدقيق والطابع الزمني ونسخة الأرشيف.' } },
    { num: 'VI',   name: { en: 'Political Independence', pt: 'Independência Política', es: 'Independencia Política', fr: 'Indépendance Politique', de: 'Politische Unabhängigkeit', ar: 'الاستقلال السياسي' }, desc: { en: 'Zero communication with campaigns. Zero funding from political actors. Only public records are read.', pt: 'Zero comunicação com campanhas. Zero financiamento de atores políticos. Apenas registros públicos.', es: 'Cero comunicación con campañas. Cero financiación política. Solo registros públicos.', fr: 'Zéro communication avec les campagnes. Zéro financement politique. Seuls les dossiers publics.', de: 'Null Kommunikation mit Kampagnen. Null politische Finanzierung.', ar: 'صفر تواصل مع الحملات. صفر تمويل سياسي. فقط السجلات العامة.' } },
    { num: 'VII',  name: { en: 'Open Infrastructure', pt: 'Infraestrutura Aberta', es: 'Infraestructura Abierta', fr: 'Infrastructure Ouverte', de: 'Offene Infrastruktur', ar: 'البنية التحتية المفتوحة' }, desc: { en: 'The code, methodology, and protocol are fully open source. Anyone can audit the algorithm.', pt: 'O código, a metodologia e o protocolo são totalmente open source. Qualquer um pode auditar o algoritmo.', es: 'El código, la metodología y el protocolo son completamente open source.', fr: 'Le code, la méthodologie et le protocole sont entièrement open source.', de: 'Code, Methodik und Protokoll sind vollständig Open Source.', ar: 'الكود والمنهجية والبروتوكول مفتوحة المصدر بالكامل.' } },
    { num: 'VIII', name: { en: 'Zero Commercial Interference', pt: 'Infiltração Comercial Nula', es: 'Interferencia Comercial Nula', fr: 'Zéro Interférence Commerciale', de: 'Null Kommerzielle Einmischung', ar: 'انعدام التدخل التجاري' }, desc: { en: 'No financial transaction can distort visibility, buy placement, or sponsor metrics. Ever.', pt: 'Nenhuma transação financeira pode distorcer visibilidade, comprar espaço ou patrocinar métricas. Jamais.', es: 'Ninguna transacción puede distorsionar la visibilidad ni comprar posiciones. Jamás.', fr: 'Aucune transaction ne peut altérer la visibilité ou acheter des positions. Jamais.', de: 'Keine Finanztransaktion kann Sichtbarkeit verzerren oder Positionen kaufen. Nie.', ar: 'لا يمكن لأي معاملة مالية تشويه الرؤية أو شراء المواضع. أبدًا.' } },
  ]

  const categories = [
    { en: 'Economy & Fiscal',           pt: 'Economia & Fiscal',           es: 'Economía & Fiscal',           fr: 'Économie & Fiscal',          de: 'Wirtschaft & Finanzen',  ar: 'الاقتصاد والمالية' },
    { en: 'Education & Culture',        pt: 'Educação & Cultura',          es: 'Educación & Cultura',         fr: 'Éducation & Culture',        de: 'Bildung & Kultur',       ar: 'التعليم والثقافة' },
    { en: 'Health & Sanitation',        pt: 'Saúde & Saneamento',          es: 'Salud & Saneamiento',         fr: 'Santé & Assainissement',     de: 'Gesundheit',             ar: 'الصحة' },
    { en: 'Public Safety & Justice',    pt: 'Segurança & Justiça',         es: 'Seguridad & Justicia',        fr: 'Sécurité & Justice',         de: 'Sicherheit & Justiz',    ar: 'الأمن والعدالة' },
    { en: 'Environment & Climate',      pt: 'Meio Ambiente & Clima',       es: 'Medio Ambiente & Clima',      fr: 'Environnement & Climat',     de: 'Umwelt & Klima',         ar: 'البيئة والمناخ' },
    { en: 'Social Assistance',          pt: 'Assistência Social',          es: 'Asistencia Social',           fr: 'Assistance Sociale',         de: 'Soziale Hilfe',          ar: 'المساعدة الاجتماعية' },
    { en: 'Human Rights',               pt: 'Direitos Humanos',            es: 'Derechos Humanos',            fr: 'Droits de l\'Homme',         de: 'Menschenrechte',         ar: 'حقوق الإنسان' },
    { en: 'Infrastructure & Transport', pt: 'Infraestrutura & Transporte', es: 'Infraestructura & Transporte',fr: 'Infrastructure & Transport',  de: 'Infrastruktur',          ar: 'البنية التحتية' },
    { en: 'Governance & Reform',        pt: 'Governança & Reforma',        es: 'Gobernanza & Reforma',        fr: 'Gouvernance & Réforme',      de: 'Regierungsführung',      ar: 'الحوكمة والإصلاح' },
  ]

  const isRTL = locale === 'ar'

  return (
    <>
      <style>{`
        :root{--ink:#0B1D2E;--paper:#F5F0E8;--gold:#C8A96E;--gold-dark:#8B6914;--rule:rgba(11,29,46,0.12);--muted:rgba(11,29,46,0.5)}
        .wc-body{font-family:'IBM Plex Sans',system-ui,sans-serif;background:var(--paper);color:var(--ink);overflow-x:hidden}
        /* HERO */
        .hero{display:grid;grid-template-columns:1fr 1fr;min-height:90vh;position:relative}
        .hero-divider{position:absolute;left:50%;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,transparent,var(--rule) 15%,var(--rule) 85%,transparent);z-index:5}
        .vs-bubble{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;width:48px;height:48px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;color:var(--ink);letter-spacing:1px;box-shadow:0 0 0 10px rgba(200,169,110,0.10),0 0 0 20px rgba(200,169,110,0.05)}
        .side-a{background:var(--ink);display:flex;flex-direction:column;justify-content:center;padding:72px 64px 80px;position:relative;overflow:hidden}
        .side-b{background:var(--paper);display:flex;flex-direction:column;justify-content:center;padding:72px 64px 80px;position:relative;overflow:hidden}
        .side-a::before{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;border-radius:50%;border:1px solid rgba(200,169,110,0.06)}
        .side-b::after{content:'';position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(11,29,46,0.05)}
        .side-tag{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:28px}
        .side-tag-a{color:rgba(200,169,110,0.7)}
        .side-tag-b{color:var(--gold-dark)}
        .hero-hed-a{font-family:'Playfair Display',serif;font-size:clamp(42px,5.5vw,72px);font-weight:900;color:var(--paper);line-height:1.0;letter-spacing:-1.5px;margin-bottom:28px}
        .hero-hed-b{font-family:'Playfair Display',serif;font-size:clamp(42px,5.5vw,72px);font-weight:400;font-style:italic;color:var(--ink);line-height:1.0;letter-spacing:-1px;margin-bottom:28px}
        .hero-dek{font-size:14px;font-weight:300;line-height:1.9;max-width:380px;margin-bottom:40px}
        .hero-dek-a{color:rgba(245,240,232,0.60)}
        .hero-dek-b{color:rgba(11,29,46,0.55)}
        .cta-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        .btn-solid-a{font-family:'IBM Plex Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;background:var(--gold);color:var(--ink);border:none;padding:12px 24px;cursor:pointer;border-radius:2px;text-decoration:none;display:inline-block;transition:opacity .2s}
        .btn-solid-a:hover{opacity:.85}
        .btn-ghost-a{font-family:'IBM Plex Sans',sans-serif;font-size:10px;font-weight:400;color:rgba(245,240,232,0.4);background:none;border:none;cursor:pointer;letter-spacing:.5px;text-decoration:underline;text-underline-offset:3px}
        .btn-solid-b{font-family:'IBM Plex Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;background:var(--ink);color:var(--paper);border:none;padding:12px 24px;cursor:pointer;border-radius:2px;text-decoration:none;display:inline-block;transition:opacity .2s}
        .btn-solid-b:hover{opacity:.85}
        .btn-ghost-b{font-family:'IBM Plex Sans',sans-serif;font-size:10px;font-weight:400;color:rgba(11,29,46,0.35);background:none;border:none;cursor:pointer;letter-spacing:.5px;text-decoration:underline;text-underline-offset:3px}
        /* STATS */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
        .stat{padding:40px 32px;border-right:1px solid var(--rule)}
        .stat:last-child{border-right:none}
        .stat-val{font-family:'Playfair Display',serif;font-size:44px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:8px}
        .stat-val span{color:var(--gold)}
        .stat-lab{font-family:'IBM Plex Sans',sans-serif;font-size:12px;font-weight:300;color:var(--muted)}
        /* MANIFESTO BAND — nova citação */
        .mband{background:var(--ink);display:grid;grid-template-columns:1fr 1px 1.2fr}
        .mband-quote{padding:64px 64px;display:flex;flex-direction:column;justify-content:center}
        .mband-quote p{font-family:'Playfair Display',serif;font-size:clamp(18px,2.4vw,28px);font-style:italic;font-weight:400;color:rgba(245,240,232,0.75);line-height:1.6}
        .mband-quote p em{color:var(--gold);font-style:normal;font-weight:600}
        .mband-rule{background:rgba(200,169,110,0.2)}
        .mband-text{padding:64px 64px;display:flex;flex-direction:column;justify-content:center;gap:24px}
        .mband-text p{font-size:14.5px;font-weight:400;color:rgba(245,240,232,0.7);line-height:1.95;padding-left:20px;border-left:1px solid rgba(200,169,110,0.35)}
        /* PILLARS */
        .pillars-sec{padding:80px 64px}
        .sec-eyebrow{display:flex;align-items:baseline;gap:16px;margin-bottom:52px}
        .sec-num{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
        .sec-hed{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:var(--ink);letter-spacing:-0.5px}
        .pillars-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--rule);border:1px solid var(--rule)}
        .pillar{background:var(--paper);padding:28px 22px;transition:background .22s}
        .pillar:hover{background:var(--ink)}
        .pillar:hover .p-num,.pillar:hover .p-name,.pillar:hover .p-desc{color:inherit}
        .pillar:hover .p-num{color:var(--gold) !important}
        .pillar:hover .p-name{color:var(--paper) !important}
        .pillar:hover .p-desc{color:rgba(245,240,232,0.5) !important}
        .p-num{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-bottom:14px;transition:color .22s}
        .p-name{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--ink);margin-bottom:12px;line-height:1.25;transition:color .22s}
        .p-desc{font-size:11.5px;font-weight:300;color:rgba(11,29,46,0.55);line-height:1.75;transition:color .22s}
        /* CATEGORIES */
        .cats-sec{background:var(--ink);padding:64px 64px}
        .cats-label{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:rgba(200,169,110,0.7);margin-bottom:24px}
        .cats-grid{display:grid;grid-template-columns:repeat(9,1fr);gap:1px;background:rgba(200,169,110,0.15)}
        .cat-box{background:var(--ink);padding:18px 10px;text-align:center;transition:background .2s}
        .cat-box:hover{background:rgba(200,169,110,0.10)}
        .cat-name{font-family:'IBM Plex Sans',sans-serif;font-size:10px;font-weight:400;color:rgba(245,240,232,0.55);line-height:1.5}
        .cat-bar{width:20px;height:1.5px;background:var(--gold);margin:7px auto 0;border-radius:1px;opacity:.4}
        /* ELECTIONS */
        .elections-sec{padding:80px 64px;background:var(--paper)}
        .elections-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:2px;background:var(--rule);border:1px solid var(--rule)}
        .election-card{background:var(--paper);padding:28px 24px;display:flex;flex-direction:column;gap:14px;transition:background .22s;text-decoration:none;color:inherit}
        .election-card:hover{background:var(--ink)}
        .election-card:hover .ec-name{color:var(--paper)}
        .election-card:hover .ec-meta,.election-card:hover .ec-cands{color:rgba(245,240,232,0.45)}
        .election-card:hover .ec-arrow{color:var(--gold)}
        .election-card:hover .ec-flag{border-color:rgba(200,169,110,0.25)}
        .ec-top{display:flex;align-items:center;gap:12px}
        .ec-flag{font-size:26px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:3px;border:1px solid var(--rule);background:rgba(11,29,46,0.02);transition:border-color .22s;flex-shrink:0}
        .ec-info{flex:1}
        .ec-name{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--ink);line-height:1.25;transition:color .22s}
        .ec-meta{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-top:3px;transition:color .22s}
        .ec-cands{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:300;color:var(--muted);line-height:1.5;transition:color .22s}
        .ec-footer{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--rule)}
        .ec-arrow{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--gold-dark);transition:color .22s}
        /* FOOTER */
        .wc-footer{background:var(--ink);padding:56px 64px 32px}
        .foot-top{display:grid;grid-template-columns:1fr 1fr 1fr;gap:48px;padding-bottom:44px;border-bottom:1px solid rgba(245,240,232,0.07);margin-bottom:28px}
        .foot-brand{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--paper);margin-bottom:8px;letter-spacing:-0.3px}
        .foot-brand span{color:var(--gold)}
        .foot-tagline{font-family:'IBM Plex Sans',sans-serif;font-size:11px;font-weight:300;color:rgba(245,240,232,0.35);line-height:1.8;max-width:240px}
        .foot-mirror{font-family:'IBM Plex Sans',sans-serif;font-size:10px;font-style:italic;color:rgba(200,169,110,0.5);margin-top:12px}
        .foot-col-title{font-family:'IBM Plex Mono',monospace;font-size:8px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(200,169,110,0.6);margin-bottom:14px}
        .foot-links{list-style:none}
        .foot-links li{margin-bottom:9px}
        .foot-links a{font-family:'IBM Plex Sans',sans-serif;font-size:11px;font-weight:300;color:rgba(245,240,232,0.40);text-decoration:none;transition:color .2s}
        .foot-links a:hover{color:rgba(245,240,232,0.75)}
        .foot-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .foot-copy{font-family:'IBM Plex Mono',monospace;font-size:9px;color:rgba(245,240,232,0.20);letter-spacing:0.04em}
        .foot-neutral{display:flex;align-items:center;gap:7px;font-family:'IBM Plex Mono',monospace;font-size:9px;color:rgba(245,240,232,0.25);letter-spacing:0.04em}
        .gold-dot{width:5px;height:5px;border-radius:50%;background:var(--gold);opacity:.6}
        /* RESPONSIVE */
        @media(max-width:768px){
          .hero{grid-template-columns:1fr}
          .hero-divider,.vs-bubble{display:none}
          .side-a,.side-b{padding:52px 28px}
          .stats{grid-template-columns:1fr 1fr}
          .stat{border-right:none;border-bottom:1px solid var(--rule);padding:32px 24px}
          .mband{grid-template-columns:1fr}
          .mband-rule{display:none}
          .mband-quote,.mband-text{padding:44px 28px}
          .pillars-sec,.elections-sec{padding:52px 28px}
          .pillars-grid{grid-template-columns:1fr 1fr}
          .cats-sec{padding:44px 16px}
          .cats-grid{grid-template-columns:repeat(3,1fr)}
          .elections-grid{grid-template-columns:1fr}
          .wc-footer{padding:44px 28px 24px}
          .foot-top{grid-template-columns:1fr;gap:28px}
        }
      `}</style>

      <div className="wc-body" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── HERO ─────────────────────────────────────────────── */}
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
          <div className="vs-bubble">⊕</div>

          <div className="side-b">
            <p className="side-tag side-tag-b">{copy.tagB}</p>
            <h1 className="hero-hed-b">{copy.hedB}</h1>
            <p className="hero-dek hero-dek-b">{copy.dekB}</p>
            <div className="cta-row">
              <a href="#elections" className="btn-solid-b">{copy.ctaB}</a>
              <button className="btn-ghost-b">{copy.liveOps}</button>
            </div>
          </div>
        </section>

        {/* ── ELECTIONS — imediatamente após o hero ────────────── */}
        <section className="elections-sec" id="elections">
          <div className="sec-eyebrow">
            <span className="sec-num">{copy.elecEye}</span>
            <h2 className="sec-hed">{copy.elecHed}</h2>
          </div>
          <ElectionGrid elections={elections} locale={locale} />
        </section>

        {/* ── STATS — dinâmicos ────────────────────────────────── */}
        <div className="stats">
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

        {/* ── MANIFESTO BAND — nova citação ────────────────────── */}
        <div className="mband">
          <div className="mband-quote">
            <p>
              {copy.quote.before}
              <em>{copy.quote.highlight}</em>
              {copy.quote.after}
            </p>
          </div>
          <div className="mband-rule" />
          <div className="mband-text">
            <p>{copy.mbandP1}</p>
            <p>{copy.mbandP2}</p>
          </div>
        </div>

        {/* ── PILLARS ──────────────────────────────────────────── */}
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

        {/* ── CATEGORIES ───────────────────────────────────────── */}
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

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer className="wc-footer">
          <div className="foot-top">
            <div>
              <div className="foot-brand">World<span>Contrast</span></div>
              <p className="foot-tagline">{copy.footTagline}</p>
              <p className="foot-mirror">
                {locale === 'pt' ? 'Não somos a verdade. Somos o espelho.'
                : locale === 'es' ? 'No somos la verdad. Somos el espejo.'
                : locale === 'fr' ? 'Nous ne sommes pas la vérité. Nous sommes le miroir.'
                : locale === 'de' ? 'Wir sind nicht die Wahrheit. Wir sind der Spiegel.'
                : locale === 'ar' ? 'لسنا الحقيقة. نحن المرآة.'
                : 'We are not the truth. We are the mirror.'}
              </p>
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
              <div className="gold-dot" />
              {copy.footNeutral}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
