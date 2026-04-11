// src/types/index.ts

export type Category =
  | 'economy' | 'education' | 'health' | 'safety'
  | 'environment' | 'social' | 'rights' | 'infrastructure' | 'governance'

export type PromiseStatus = 'stated' | 'partial' | 'fulfilled' | 'retracted'

export type Locale = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'ar' | 'zh' | 'ja' | 'hi' | 'ru'

export interface Candidate {
  id: string
  slug: string
  fullName: string
  displayName: string
  party: string
  partyFullName: string
  electoralNumber: string
  initials: string
  color: string
  photoUrl?: string
  sources: {
    electoralFiling?: string
    officialSite?: string
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
  lastCollected: string
}

export interface CampaignPromise {
  id: string
  candidateId: string
  category: Category
  status: PromiseStatus
  text: Record<string, string>
  quote: Record<string, string> | null
  sourceUrl: string
  sourceType: string
  collectedAt: string
  contentHash: string
  archiveUrl: string
  confidence: number
  ambiguous: boolean
}

export interface Election {
  id: string
  country: string
  countryName: Record<string, string>
  flag: string
  electionType: string
  electionName: Record<string, string>
  electionDate: string
  status: string
  lastUpdated: string
  tribunal: { name: string; url: string }
  candidates: Candidate[]
  promises: CampaignPromise[]
}

// ─────────────────────────────────────────────────────────────
// CATEGORY CONFIG — labels em todos os idiomas suportados
// Adicionar idioma aqui propaga automaticamente para toda a UI
// ─────────────────────────────────────────────────────────────
export const CATEGORY_CONFIG: Record<Category, {
  color: string
  bg: string
  emoji: string
  label: Record<string, string>
}> = {
  economy: {
    color: '#1D4ED8', bg: '#EFF6FF', emoji: '💰',
    label: {
      en: 'Economy',       pt: 'Economia',        es: 'Economía',
      fr: 'Économie',      de: 'Wirtschaft',       ar: 'الاقتصاد',
      zh: '经济',           ja: '経済',             hi: 'अर्थव्यवस्था',
      ru: 'Экономика',
    },
  },
  education: {
    color: '#7C3AED', bg: '#F5F3FF', emoji: '📚',
    label: {
      en: 'Education',     pt: 'Educação',         es: 'Educación',
      fr: 'Éducation',     de: 'Bildung',          ar: 'التعليم',
      zh: '教育',           ja: '教育',             hi: 'शिक्षा',
      ru: 'Образование',
    },
  },
  health: {
    color: '#DC2626', bg: '#FEF2F2', emoji: '🏥',
    label: {
      en: 'Health',        pt: 'Saúde',            es: 'Salud',
      fr: 'Santé',         de: 'Gesundheit',       ar: 'الصحة',
      zh: '卫生',           ja: '医療',             hi: 'स्वास्थ्य',
      ru: 'Здравоохранение',
    },
  },
  safety: {
    color: '#D97706', bg: '#FFFBEB', emoji: '🛡️',
    label: {
      en: 'Public Safety', pt: 'Segurança',        es: 'Seguridad',
      fr: 'Sécurité',      de: 'Sicherheit',       ar: 'الأمن العام',
      zh: '公共安全',       ja: '治安',             hi: 'सार्वजनिक सुरक्षा',
      ru: 'Общественная безопасность',
    },
  },
  environment: {
    color: '#059669', bg: '#ECFDF5', emoji: '🌿',
    label: {
      en: 'Environment',   pt: 'Meio Ambiente',    es: 'Medio Ambiente',
      fr: 'Environnement', de: 'Umwelt',           ar: 'البيئة',
      zh: '环境',           ja: '環境',             hi: 'पर्यावरण',
      ru: 'Экология',
    },
  },
  social: {
    color: '#DB2777', bg: '#FDF2F8', emoji: '🤝',
    label: {
      en: 'Social',        pt: 'Social',           es: 'Social',
      fr: 'Social',        de: 'Soziales',         ar: 'الشأن الاجتماعي',
      zh: '社会',           ja: '社会',             hi: 'सामाजिक',
      ru: 'Социальная сфера',
    },
  },
  rights: {
    color: '#0891B2', bg: '#ECFEFF', emoji: '⚖️',
    label: {
      en: 'Human Rights',  pt: 'Direitos',         es: 'Derechos',
      fr: 'Droits',        de: 'Menschenrechte',   ar: 'حقوق الإنسان',
      zh: '人权',           ja: '人権',             hi: 'मानवाधिकार',
      ru: 'Права человека',
    },
  },
  infrastructure: {
    color: '#6D28D9', bg: '#F5F3FF', emoji: '🏗️',
    label: {
      en: 'Infrastructure', pt: 'Infraestrutura',  es: 'Infraestructura',
      fr: 'Infrastructure', de: 'Infrastruktur',   ar: 'البنية التحتية',
      zh: '基础设施',        ja: 'インフラ',         hi: 'बुनियादी ढांचा',
      ru: 'Инфраструктура',
    },
  },
  governance: {
    color: '#374151', bg: '#F9FAFB', emoji: '🏛️',
    label: {
      en: 'Governance',    pt: 'Governança',       es: 'Gobernanza',
      fr: 'Gouvernance',   de: 'Regierungsführung', ar: 'الحوكمة',
      zh: '治理',           ja: 'ガバナンス',        hi: 'शासन',
      ru: 'Управление',
    },
  },
}
