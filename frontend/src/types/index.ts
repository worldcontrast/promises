// CampaignPromise (not Promise) to avoid conflict with native TypeScript Promise type
export type Category =
  | 'economy' | 'education' | 'health' | 'safety'
  | 'environment' | 'social' | 'rights' | 'infrastructure' | 'governance'

export type PromiseStatus = 'stated' | 'partial' | 'fulfilled' | 'retracted'

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
  sources: {
    electoralFiling?: string
    officialSite?: string
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
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

export const CATEGORY_CONFIG: Record<Category, {
  color: string; bg: string; emoji: string
  label: Record<string, string>
}> = {
  economy:        { color: '#1D4ED8', bg: '#EFF6FF', emoji: '💰', label: { en: 'Economy',       pt: 'Economia' } },
  education:      { color: '#7C3AED', bg: '#F5F3FF', emoji: '📚', label: { en: 'Education',      pt: 'Educação' } },
  health:         { color: '#DC2626', bg: '#FEF2F2', emoji: '🏥', label: { en: 'Health',         pt: 'Saúde' } },
  safety:         { color: '#D97706', bg: '#FFFBEB', emoji: '🛡️', label: { en: 'Public Safety',  pt: 'Segurança' } },
  environment:    { color: '#059669', bg: '#ECFDF5', emoji: '🌿', label: { en: 'Environment',    pt: 'Meio Ambiente' } },
  social:         { color: '#DB2777', bg: '#FDF2F8', emoji: '🤝', label: { en: 'Social',         pt: 'Social' } },
  rights:         { color: '#0891B2', bg: '#ECFEFF', emoji: '⚖️', label: { en: 'Human Rights',   pt: 'Direitos' } },
  infrastructure: { color: '#6D28D9', bg: '#F5F3FF', emoji: '🏗️', label: { en: 'Infrastructure', pt: 'Infraestrutura' } },
  governance:     { color: '#374151', bg: '#F9FAFB', emoji: '🏛️', label: { en: 'Governance',     pt: 'Governança' } },
}
