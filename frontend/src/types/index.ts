// ============================================================
// World Contrast — TypeScript Types
// File: src/types/index.ts
// ============================================================

export type Locale = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'ar'

export type ElectionStatus = 'live' | 'coming_soon' | 'planned' | 'archived'

export type PromiseStatus = 'stated' | 'partial' | 'fulfilled' | 'retracted' | 'unavailable'

export type SourceType =
  | 'electoral_filing'
  | 'official_site'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'youtube'
  | 'tiktok'
  | 'press_release'

export type Category =
  | 'economy'
  | 'education'
  | 'health'
  | 'safety'
  | 'environment'
  | 'social'
  | 'rights'
  | 'infrastructure'
  | 'governance'

// ── LOCALISED STRING ──────────────────────────────────────────
// A string that has a value per language
export type LocalisedString = Partial<Record<Locale, string>>

// ── CANDIDATE ────────────────────────────────────────────────
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
    tiktok?: string
  }
  lastCollected: string // ISO 8601
}

// ── PROMISE ───────────────────────────────────────────────────
export interface Promise {
  id: string
  candidateId: string
  category: Category
  status: PromiseStatus
  text: LocalisedString           // verbatim in original language + translations
  quote: LocalisedString | null   // direct quote if available
  sourceUrl: string               // exact URL visited
  sourceType: SourceType
  collectedAt: string             // ISO 8601
  contentHash: string             // SHA-256 of archived page
  archiveUrl: string              // Wayback Machine URL
  confidence: number              // 0.0 - 1.0
  ambiguous: boolean
}

// ── ELECTION ─────────────────────────────────────────────────
export interface Election {
  id: string
  country: string                 // ISO 3166-1 alpha-2
  countryName: LocalisedString
  flag: string
  electionType: 'presidential' | 'legislative' | 'municipal' | 'regional'
  electionName: LocalisedString
  electionDate: string            // ISO 8601 date
  status: ElectionStatus
  lastUpdated: string             // ISO 8601
  tribunal: {
    name: string
    url: string
  }
  candidates: Candidate[]
  promises: Promise[]
}

// ── CATEGORY CONFIG ───────────────────────────────────────────
export interface CategoryConfig {
  id: Category
  color: string
  bgColor: string
  emoji: string
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'economy',        color: '#1D4ED8', bgColor: '#EFF6FF', emoji: '💰' },
  { id: 'education',      color: '#7C3AED', bgColor: '#F5F3FF', emoji: '📚' },
  { id: 'health',         color: '#DC2626', bgColor: '#FEF2F2', emoji: '🏥' },
  { id: 'safety',         color: '#D97706', bgColor: '#FFFBEB', emoji: '🛡️' },
  { id: 'environment',    color: '#059669', bgColor: '#ECFDF5', emoji: '🌿' },
  { id: 'social',         color: '#DB2777', bgColor: '#FDF2F8', emoji: '🤝' },
  { id: 'rights',         color: '#0891B2', bgColor: '#ECFEFF', emoji: '⚖️' },
  { id: 'infrastructure', color: '#6D28D9', bgColor: '#F5F3FF', emoji: '🏗️' },
  { id: 'governance',     color: '#374151', bgColor: '#F9FAFB', emoji: '🏛️' },
]

// ── AUDIT ─────────────────────────────────────────────────────
export interface AgentRun {
  id: string
  startedAt: string
  completedAt: string
  status: 'completed' | 'failed' | 'running'
  country: string
  election: string
  sourcesVisited: number
  promisesExtracted: number
  promisesRejected: number
  agentVersion: string
}

// ── API RESPONSES ─────────────────────────────────────────────
export interface ElectionSummary {
  id: string
  country: string
  countryName: LocalisedString
  flag: string
  electionName: LocalisedString
  electionDate: string
  status: ElectionStatus
  candidateCount: number
  promiseCount: number
}
