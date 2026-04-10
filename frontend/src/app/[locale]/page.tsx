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
      tagA: 'Candidate A · Record',
      tagB: 'Candidate B · Record',
      hedA: <>Candidate Promises<br />Side by Side.</>,
      hedB: <>Contrast & Certified<br />Historical Record.</>,
      dekA: "World Contrast is not an opinion platform or a fact-checking agency. We are an open-source, neutral infrastructure focused on the unalterable documentation of political promises.",
      dekB: "Every documented public commitment becomes a collective asset. We extract directly from official primary sources and present them side by side, without bias, editing, or mediation.",
      ctaA: 'Access Official Records',
      ctaB: 'Select a Jurisdiction',
      manifesto: 'Read the Infrastructure Rules',
      liveElections: 'Active Operations',
      stat1: 'Jurisdictions audited',
      stat2: 'Records secured',
      stat3: 'Algorithmic bias',
      stat4: 'Verifiable integrity',
      quote: '"We do not interpret political campaigns. We present the contrast."',
      mbandP1: 'During electoral periods, the excess of speeches and fragmented narratives hinders objective analysis. World Contrast isolates the noise. We exclusively track verified channels—government plans submitted to electoral courts, official websites, and institutional public statements—to record the literal commitments of each candidate. There is no room for human interpretation or resource asymmetry.',
      mbandP2: 'Our approach ensures absolute political detachment. We never contact campaigns. We do not publish opinion pieces. We do not highlight candidates. Each extracted statement receives a cryptographic seal of authenticity (SHA-256) and is permanently archived for civil, academic, and journalistic scrutiny.',
      pillarsEye: '01 — Architecture',
      pillarsHed: 'The Eight Institutional Pillars',
      catsLabel: '9 Categories — enforced rigidly on every candidate, universally.',
      countriesEye: '02 — Operations Map',
      countriesHed: 'Select Jurisdiction',
      compare: 'Access Index →',
      candidatesTxt: 'candidates audited',
      promisesTxt: 'sealed records',
      statusTxt: 'System Status',
      footTagline: 'An independent infrastructure for tracking global political accountability.',
      footCopy: '© 2026 World Contrast — Independent unincorporated initiative. All data open source.',
      footNeutral: 'Zero bias · Zero contact · Zero agenda',
      footPlatform: 'Infrastructure',
      footMission: 'Institutional Policy',
      howItWorks: 'Extraction methodology',
      compareTool: 'Global index',
      liveEl: 'Live jurisdictions',
      openData: 'Open Data / REST API',
      manifestoV: 'Manifesto v2.0',
      eightPillars: 'Operational Rules',
      transparency: 'Audit logs',
      contribute: 'Registry access',
    },
    pt: {
      tagA: 'Candidato A · Registro',
      tagB: 'Candidato B · Registro',
      hedA: <>Promessas dos Candidatos<br />Lado a Lado.</>,
      hedB: <>Contraste & Registro<br />Histórico Certificado.</>,
      dekA: "O World Contrast não é um veículo de opinião nem agência de fact-checking. Somos uma infraestrutura neutra, de código aberto, focada na documentação inalterável de promessas políticas.",
      dekB: "Todo compromisso público documentado torna-se um bem coletivo. Extraímos diretamente de fontes primárias oficiais e os apresentamos lado a lado, sem viés, edição ou mediação.",
      ctaA: 'Acessar Registros Oficiais',
      ctaB: 'Selecionar Jurisdição',
      manifesto: 'Ler Regras da Infraestrutura',
      liveElections: 'Operações Ativas',
      stat1: 'Jurisdições auditadas',
      stat2: 'Registros blindados',
      stat3: 'Viés algorítmico',
      stat4: 'Integridade verificável',
      quote: '"Nós não interpretamos campanhas políticas. Nós apresentamos o contraste."',
      mbandP1: 'Durante períodos eleitorais, o excesso de discursos e narrativas fragmentadas dificulta a análise objetiva. O World Contrast isola o ruído. Rastreamos exclusivamente canais verificados — planos de governo submetidos a tribunais, sites oficiais e declarações públicas institucionais — para registrar os compromissos literais de cada candidato. Não há margem para interpretação humana ou assimetria de recursos.',
      mbandP2: 'Nossa abordagem assegura distanciamento político absoluto. Nunca contatamos campanhas. Não publicamos artigos opinativos. Não destacamos candidatos. Cada declaração extraída recebe um selo criptográfico de autenticidade (SHA-256) e é arquivada de forma permanente para escrutínio civil, acadêmico e jornalístico.',
      pillarsEye: '01 — Arquitetura Central',
      pillarsHed: 'Os Oito Pilares Institucionais',
      catsLabel: '9 Categorias — Exigidas identicamente entre qualquer candidato globalmente.',
      countriesEye: '02 — Tabela Operacional',
      countriesHed: 'Selecione a Jurisdição',
      compare: 'Acessar Índice →',
      candidatesTxt: 'fichas auditadas',
      promisesTxt: 'registros blindados',
      statusTxt: 'Status do Sistema',
      footTagline: 'Infraestrutura independente para vigilância e comparativo de dados eleitorais.',
      footCopy: '© 2026 World Contrast — Iniciativa independente em dados abertos.',
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
      tagA: 'Candidato A · Registro',
      tagB: 'Candidato B · Registro',
      hedA: <>Promesas de los Candidatos<br />Lado a Lado.</>,
      hedB: <>Contraste y Registro<br />Histórico Certificado.</>,
      dekA: "World Contrast no es una plataforma de opinión ni agencia de verificación. Somos una infraestructura neutral de código abierto enfocada en la documentación inalterable de promesas políticas.",
      dekB: "Todo compromiso público documentado se convierte en un bien colectivo. Extraemos directamente de fuentes primarias oficiales y las presentamos lado a lado, sin sesgos, edición ni mediación.",
      ctaA: 'Acceder a Registros',
      ctaB: 'Seleccionar Jurisdicción',
      manifesto: 'Leer Reglas de Infraestructura',
      liveElections: 'Operaciones Activas',
      stat1: 'Jurisdicciones auditadas',
      stat2: 'Registros asegurados',
      stat3: 'Sesgo algorítmico',
      stat4: 'Integridad verificable',
      quote: '"No interpretamos campañas políticas. Solo presentamos el contraste."',
      mbandP1: 'Durante los períodos electorales, el exceso de discursos y narrativas fragmentadas dificulta el análisis objetivo. World Contrast aísla el ruido. Rastreamos exclusivamente canales verificados —planes de gobierno presentados ante tribunales, sitios web oficiales y declaraciones públicas institucionales— para registrar los compromisos literales de cada candidato. No hay margen para interpretación humana o asimetría de recursos.',
      mbandP2: 'Nuestro enfoque asegura un distanciamiento político absoluto. Nunca contactamos campañas. No publicamos artículos de opinión. No destacamos candidatos. Cada declaración extraída recibe un sello criptográfico de autenticidad (SHA-256) y se archiva de forma permanente para el escrutinio civil, académico y periodístico.',
      pillarsEye: '01 — Arquitectura Central',
      pillarsHed: 'Los Ocho Pilares Institucionales',
      catsLabel: '9 Categorías — Exigidas idénticamente a cualquier candidato globalmente.',
      countriesEye: '02 — Despliegue',
      countriesHed: 'Seleccione Jurisdicción',
      compare: 'Acceder al Índice →',
      candidatesTxt: 'fichas auditadas',
      promisesTxt: 'registros blindados',
      statusTxt: 'Estado del Sistema',
      footTagline: 'Infraestructura independiente para la vigilancia comparativa de datos electorales.',
      footCopy: '© 2026 World Contrast — Iniciativa independiente de datos abiertos.',
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
      tagA: 'Candidat A · Dossier',
      tagB: 'Candidat B · Dossier',
      hedA: <>Promesses des Candidats<br />Côte à Côte.</>,
      hedB: <>Contraste & Registre<br />Historique Certifié.</>,
      dekA: "World Contrast n'est ni une plateforme d'opinion ni une agence de vérification. Nous sommes une infrastructure neutre et open-source dédiée à la documentation inaltérable des promesses politiques.",
      dekB: "Tout engagement public documenté devient un bien collectif. Nous extrayons directement des sources primaires officielles et les présentons côte à côte, sans biais, modification ou médiation.",
      ctaA: 'Accéder aux Registres',
      ctaB: 'Sélectionner une Juridiction',
      manifesto: 'Lire les Règles d\'Infrastructure',
      liveElections: 'Opérations Actives',
      stat1: 'Juridictions auditées',
      stat2: 'Registres sécurisés',
      stat3: 'Biais algorithmique',
      stat4: 'Intégrité vérifiable',
      quote: '"Nous n\'interprétons pas les campagnes politiques. Nous présentons le contraste."',
      mbandP1: 'En période électorale, l\'excès de discours et les récits fragmentés entravent l\'analyse objective. World Contrast isole le bruit. Nous suivons exclusivement les canaux vérifiés — plans gouvernementaux soumis aux tribunaux, sites officiels et déclarations publiques institutionnelles — pour consigner les engagements littéraux de chaque candidat. Il n\'y a aucune place pour l\'interprétation humaine ou l\'asymétrie des ressources.',
      mbandP2: 'Notre approche garantit une distanciation politique absolue. Nous ne contactons jamais les campagnes. Nous ne publions pas d\'articles d\'opinion. Aucun candidat n\'est mis en avant. Chaque déclaration extraite reçoit un sceau cryptographique d\'authenticité (SHA-256) et est archivée en permanence pour un examen civil, académique et journalistique.',
      pillarsEye: '01 — Architecture Centrale',
      pillarsHed: 'Les Huit Piliers Institutionnels',
      catsLabel: '9 Catégories — Appliquées de manière identique à chaque candidat mondialement.',
      countriesEye: '02 — Vue Globale',
      countriesHed: 'Sélectionner une Juridiction',
      compare: 'Accéder à l\'Index →',
      candidatesTxt: 'candidats audités',
      promisesTxt: 'registres sécurisés',
      statusTxt: 'État du Système',
      footTagline: 'Une infrastructure indépendante pour le suivi des données électorales.',
      footCopy: '© 2026 World Contrast — Initiative indépendante en open data.',
      footNeutral: 'Zéro biais · Zéro contact · Zéro agenda éditorial',
      footPlatform: 'La Plateforme',
      footMission: 'Politique Institutionnelle',
      howItWorks: 'Méthodologie d\'Extraction',
      compareTool: 'Index Global',
      liveEl: 'Juridictions Actives',
      openData: 'Open Data / REST API',
      manifestoV: 'Manifeste V-02',
      eightPillars: 'Règles Opérationnelles',
      transparency: 'Journaux d\'Audit',
      contribute: 'Accès au Registre',
    },
    de: {
      tagA: 'Kandidat A · Register',
      tagB: 'Kandidat B · Register',
      hedA: <>Kandidatenversprechen<br />Seite an Seite.</>,
      hedB: <>Kontrast & Zertifiziertes<br />Historisches Register.</>,
      dekA: "World Contrast ist keine Meinungsplattform und keine Faktencheck-Agentur. Wir sind eine neutrale, quelloffene Infrastruktur, die sich auf die unveränderliche Dokumentation politischer Versprechen konzentriert.",
      dekB: "Jede dokumentierte öffentliche Verpflichtung wird zu einem kollektiven Gut. Wir extrahieren Daten direkt aus offiziellen Primärquellen und stellen sie ohne Voreingenommenheit, Bearbeitung oder Vermittlung gegenüber.",
      ctaA: 'Zurgiff auf Offizielle Register',
      ctaB: 'Eine Zuständigkeit auswählen',
      manifesto: 'Infrastrukturregeln lesen',
      liveElections: 'Aktive Operationen',
      stat1: 'Geprüfte Zuständigkeiten',
      stat2: 'Gesicherte Register',
      stat3: 'Algorithmische Voreingenommenheit',
      stat4: 'Überprüfbare Integrität',
      quote: '"Wir interpretieren keine politischen Kampagnen. Wir präsentieren den Kontrast."',
      mbandP1: 'In Wahlkampfzeiten erschwert das Übermaß an Reden und fragmentierten Narrativen eine objektive Analyse. World Contrast isoliert das Rauschen. Wir verfolgen ausschließlich verifizierte Kanäle — bei Gerichten eingereichte Regierungspläne, offizielle Websites und institutionelle öffentliche Erklärungen — um die wörtlichen Verpflichtungen jedes Kandidaten aufzuzeichnen. Es gibt keinen Raum für menschliche Interpretation oder Ressourcen-Asymmetrie.',
      mbandP2: 'Unser Ansatz gewährleistet absolute politische Distanz. Wir kontaktieren niemals Kampagnen. Wir veröffentlichen keine Meinungsartikel. Wir heben keine Kandidaten hervor. Jede extrahierte Aussage erhält ein kryptografisches Echtheitssiegel (SHA-256) und wird für zivile, akademische und journalistische Überprüfungen dauerhaft archiviert.',
      pillarsEye: '01 — Architektur',
      pillarsHed: 'Die Acht Institutionellen Säulen',
      catsLabel: '9 Kategorien — Streng und weltweit für jeden Kandidaten durchgesetzt.',
      countriesEye: '02 — Operationskarte',
      countriesHed: 'Zuständigkeit auswählen',
      compare: 'Index Aufrufen →',
      candidatesTxt: 'Geprüfte Kandidaten',
      promisesTxt: 'Gesicherte Datensätze',
      statusTxt: 'Systemstatus',
      footTagline: 'Eine unabhängige Infrastruktur zur Nachverfolgung globaler politischer Verantwortlichkeit.',
      footCopy: '© 2026 World Contrast — Unabhängige Open-Data-Initiative.',
      footNeutral: 'Null Voreingenommenheit · Null Kontakt · Null redaktionelle Agenda',
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
      tagA: 'المرشح أ · السجل',
      tagB: 'المرشح ب · السجل',
      hedA: <>وعود المرشحين<br />جنباً إلى جنب.</>,
      hedB: <>التباين والسجل<br />التاريخي المعتمد.</>,
      dekA: "ورلد كونتراست (World Contrast) ليست منصة للآراء أو وكالة لتقصي الحقائق. نحن بنية تحتية محايدة ومفتوحة المصدر تركز على التوثيق غير القابل للتغيير للوعود السياسية.",
      dekB: "كل التزام عام موثق يصبح أصلاً جماعياً. نحن نستخرج البيانات مباشرة من المصادر الأساسية الرسمية ونعرضها جنباً إلى جنب، دون تحيز أو تعديل أو وساطة.",
      ctaA: 'الوصول إلى السجلات الرسمية',
      ctaB: 'حدد ولاية قضائية',
      manifesto: 'قراءة قواعد البنية التحتية',
      liveElections: 'العمليات النشطة',
      stat1: 'الولايات القضائية المدققة',
      stat2: 'السجلات المضمونة',
      stat3: 'التحيز الخوارزمي',
      stat4: 'النزاهة التي يمكن التحقق منها',
      quote: '"نحن لا نفسر الحملات السياسية. نحن نعرض التباين."',
      mbandP1: 'خلال الفترات الانتخابية، يعيق كثرة الخطابات والروايات المجزأة التحليل الموضوعي. وورلد كونتراست تعزل الضوضاء. نحن نتتبع حصريًا القنوات التي تم التحقق منها — خطط حكومية مقدمة إلى المحاكم، مواقع رسمية، وبيانات عامة مؤسسية — لتسجيل الالتزامات الحرفية لكل مرشح. لا يوجد مجال للتفسير البشري أو عدم التناسق في الموارد.',
      mbandP2: 'يضمن نهجنا انفصالًا سياسيًا مطلقًا. نحن لا نتصل أبدًا بالحملات. لا ننشر مقالات رأي. لا نسلط الضوء على مرشحين معينين. يتلقى كل بيان مستخرج ختم أصالة مشفر (SHA-256) ويتم أرشفته بشكل دائم للمراجعة المدنية والأكاديمية والصحفية.',
      pillarsEye: '01 — البنية الأساسية',
      pillarsHed: 'الركائز المؤسسية الثمانية',
      catsLabel: '9 فئات — تُطبق بدقة على كل مرشح عالمياً.',
      countriesEye: '02 — خريطة العمليات',
      countriesHed: 'حدد ولاية قضائية',
      compare: 'الوصول إلى الفهرس ←',
      candidatesTxt: 'المرشحون المدققون',
      promisesTxt: 'السجلات المحمية',
      statusTxt: 'حالة النظام',
      footTagline: 'بنية تحتية مستقلة لتتبع المساءلة السياسية العالمية.',
      footCopy: '© 2026 World Contrast — مبادرة بيانات مفتوحة مستقلة.',
      footNeutral: 'صفر تحيز · صفر اتصال · صفر أجندة تحريرية',
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
    { num: 'I',    name: { en: 'Strict Editorial Neutrality', pt: 'Neutralidade Editorial Rigorosa', es: 'Neutralidad Editorial Estricta', fr: 'Neutralité Éditoriale Stricte', de: 'Strenge redaktionelle Neutralität', ar: 'حياد تحريري صارم' }, desc: { en: 'We do not opine, interpret, or judge. Contrast is the only artifact exposed.', pt: 'Não opinamos, interpretamos ou julgamos. O contraste é o único artefato exposto.', es: 'No opinamos, interpretamos o juzgamos. El contraste es el único artefacto expuesto.', fr: 'Nous ne jugeons ni n’interprétons. Le contraste est le seul artefact exposé.', de: 'Wir beurteilen oder interpretieren nicht. Der Kontrast ist das einzige exponierte Artefakt.', ar: 'نحن لا نرى أو نفسر أو نحكم. التباين هو الأداة الوحيدة المكشوفة.' } },
    { num: 'II',   name: { en: 'Technological Equivalence', pt: 'Equivalência Tecnológica', es: 'Equivalencia Tecnológica', fr: 'Équivalence Technologique', de: 'Technologische Äquivalenz', ar: 'التكافؤ التكنولوجي' }, desc: { en: 'Processing limits are identical for every political actor, ensuring absolute algorithmic symmetry.', pt: 'Os limites de processamento são idênticos para todo ator político, garantindo simetria algorítmica absoluta.', es: 'Los límites de procesamiento son idénticos para cada actor, asegurando simetría algorítmica.', fr: 'Les limites de traitement sont identiques pour chaque acteur, garantissant une symétrie algorithmique.', de: 'Die Verarbeitungsgrenzen sind für jeden Akteur identisch, was algorithmische Symmetrie gewährleistet.', ar: 'حدود المعالجة متطابقة لكل فاعل سياسي، مما يضمن تناظر خوارزمي.' } },
    { num: 'III',  name: { en: 'Permanent Public Audit', pt: 'Auditoria Pública Permanente', es: 'Auditoría Pública Permanente', fr: 'Audit Public Permanent', de: 'Permanente öffentliche Prüfung', ar: 'تدقيق عام دائم' }, desc: { en: 'Every statement is cryptographically etched into the digital timeline via secure hashes.', pt: 'Toda declaração é gravada criptograficamente na linha do tempo digital via hashes estruturados.', es: 'Toda declaración se graba criptográficamente en la línea de tiempo a través de hashes seguros.', fr: 'Chaque déclaration est gravée cryptographiquement via des hachages sécurisés.', de: 'Jede Aussage wird mithilfe sicherer Hashes kryptografisch in die Timeline eingraviert.', ar: 'يتم حفر كل بيان بشكل مشفر في الجدول الزمني الرقمي عبر تجزئات آمنة.' } },
    { num: 'IV',   name: { en: 'Direct Comparison Right', pt: 'Direito à Comparação Direta', es: 'Derecho a la Comparación Directa', fr: 'Droit à la Comparaison Directe', de: 'Recht auf direkten Vergleich', ar: 'حق المقارنة المباشرة' }, desc: { en: 'Viewing commitments symmetrically is a fundamental civic right without barriers.', pt: 'A visualização simétrica de compromissos é um direito cívico fundamental sem interferências.', es: 'Ver compromisos simétricamente es un derecho cívico fundamental sin interferencias.', fr: 'La visualisation symétrique des engagements est un droit civique fondamental sans entraves.', de: 'Das symmetrische Betrachten von Verpflichtungen ist ein grundlegendes bürgerliches Recht.', ar: 'إن مشاهدة الالتزامات بشكل متماثل هو حق مدني أساسي وبدون حواجز.' } },
    { num: 'V',    name: { en: 'Documentary Traceability', pt: 'Rastreabilidade Documental', es: 'Trazabilidad Documental', fr: 'Traçabilité Documentaire', de: 'Dokumentarische Nachvollziehbarkeit', ar: 'إمكانية تتبع المستندات' }, desc: { en: 'No tuple survives without its exact source URL, temporal identifier, and immutable archive mirror.', pt: 'Nenhuma informação sobrevive sem seu URL exato, registro temporal e espelho de arquivo.', es: 'Ninguna información sobrevive sin su URL de origen, marca temporal y archivo inmutable.', fr: 'Aucune information ne survit sans son URL source, son identifiant temporel et son archive inaltérable.', de: 'Keine Information überlebt ohne exakte Quellen-URL, Zeitstempel und unveränderliches Archiv.', ar: 'لا تبقى أي معلومات دون عنوان URL الأصلي الدقيق والمعرف الزمني وأرشيف غير قابل للتغيير.' } },
    { num: 'VI',   name: { en: 'Political Independence', pt: 'Independência Política', es: 'Independencia Política', fr: 'Indépendance Politique', de: 'Politische Unabhängigkeit', ar: 'الاستقلال السياسي' }, desc: { en: 'The system initiates zero communication with human campaigns. We analyze only public filings.', pt: 'O sistema não se comunica com campanhas humanas. Apenas arquivos e bases públicas são lidos.', es: 'El sistema no se comunica con campañas. Únicamente analiza registros públicos formales.', fr: 'Le système n\'initie aucune communication avec les campagnes. Seuls les dossiers publics sont lus.', de: 'Das System initiiert keine Kommunikation mit Kampagnen. Es werden nur öffentliche Unterlagen analysiert.', ar: 'يبدأ النظام في عدم التواصل مع أي حملات. نحن نحلل الملفات العامة فقط.' } },
    { num: 'VII',  name: { en: 'Open State Infrastructure', pt: 'Infraestrutura de Estado Aberta', es: 'Infraestructura de Estado Abierta', fr: 'Infrastructure d\'État Ouverte', de: 'Offene staatliche Infrastruktur', ar: 'البنية التحتية الحكومية المفتوحة' }, desc: { en: 'Methodology and logic are unpacked as open source. The architecture is globally auditable.', pt: 'A metodologia e a lógica são liberadas como open source. A infraestrutura é globalmente auditável.', es: 'La metodología y arquitectura son de código abierto globalmente auditable y libre.', fr: 'La méthodologie et la logique sont en open source. L\'architecture est auditable mondialement.', de: 'Methodik und Logik sind Open Source. Die Infrastruktur kann weltweit auditiert werden.', ar: 'يتم فك المنهجية والمنطق كمصدر مفتوح. البنية قابلة للتدقيق على مستوى العالم.' } },
    { num: 'VIII', name: { en: 'Commercial Interference Zero', pt: 'Infiltração Comercial Nula', es: 'Interferencia Comercial Nula', fr: 'Zéro Interférence Commerciale', de: 'Null Kommerzielle Einmischung', ar: 'انعدام التدخل التجاري' }, desc: { en: 'No financial transaction can distort search results, buy slots, or sponsor metrics in this registry.', pt: 'Nenhuma transação financeira pode distorcer métricas, comprar slots ou exibir publicidade aqui.', es: 'Ninguna transacción financiera puede alterar la visibilidad ni comprar posiciones en la base de datos.', fr: 'Aucune transaction ne peut altérer la visibilité ou acheter des positions dans ce registre.', de: 'Keine Finanztransaktion kann die Sichtbarkeit verändern oder Positionen im System kaufen.', ar: 'لا يمكن لأي معاملة مالية تشويه نتائج البحث أو شراء مساحات أو دعم مقاييس معينة.' } },
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
        .mband-text{padding:72px 64px;display:flex;flex-direction:column;justify-content:center;gap:24px}
        .mband-text p{font-size:15.5px;font-weight:400;color:rgba(245,240,232,0.85);line-height:2.0;padding-left:24px;border-left:1px solid rgba(200,169,110,0.5)}
        .mband-text strong{color:var(--gold);font-weight:600}
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
