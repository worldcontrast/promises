// ============================================================
// World Contrast — Data Access Library
// File: src/lib/data.ts
//
// All functions that read election data from JSON files.
// In production, these will be replaced by API calls
// to the FastAPI backend connected to Supabase.
// ============================================================

import type { Election, Candidate, Promise, Category, ElectionSummary, Locale } from '@/types'

// ── LOAD ELECTION DATA ────────────────────────────────────────
// Loads the full election data from a JSON file.
// In production: GET /api/v1/elections/{id}
export async function getElection(id: string): Promise<Election | null> {
  try {
    const data = await import(`../../data/${id}.json`)
    return data.default as Election
  } catch {
    return null
  }
}

// ── LIST ALL ELECTIONS ────────────────────────────────────────
// Returns a summary list of all available elections.
// In production: GET /api/v1/elections
export async function getAllElections(): Promise<ElectionSummary[]> {
  // Hardcoded for MVP — replace with dynamic discovery
  const elections = [
    'brazil-2026',
  ]

  const summaries: ElectionSummary[] = []

  for (const id of elections) {
    const election = await getElection(id)
    if (election) {
      summaries.push({
        id: election.id,
        country: election.country,
        countryName: election.countryName,
        flag: election.flag,
        electionName: election.electionName,
        electionDate: election.electionDate,
        status: election.status,
        candidateCount: election.candidates.length,
        promiseCount: election.promises.length,
      })
    }
  }

  return summaries
}

// ── GET CANDIDATE ─────────────────────────────────────────────
export async function getCandidate(
  electionId: string,
  candidateSlug: string
): Promise<{ candidate: Candidate; election: Election } | null> {
  const election = await getElection(electionId)
  if (!election) return null

  const candidate = election.candidates.find((c) => c.slug === candidateSlug)
  if (!candidate) return null

  return { candidate, election }
}

// ── GET PROMISES FOR COMPARISON ───────────────────────────────
// Returns promises organised by category for the compare screen.
// Pairs up promises from two candidates.
export function getComparisonData(
  election: Election,
  candidateAId: string,
  candidateBId: string,
  category?: Category
) {
  const categories: Category[] = [
    'economy', 'education', 'health', 'safety',
    'environment', 'social', 'rights', 'infrastructure', 'governance',
  ]

  const filteredCategories = category ? [category] : categories

  return filteredCategories.map((cat) => {
    const promisesA = election.promises.filter(
      (p) => p.candidateId === candidateAId && p.category === cat
    )
    const promisesB = election.promises.filter(
      (p) => p.candidateId === candidateBId && p.category === cat
    )

    // Pair up promises row by row
    const maxRows = Math.max(promisesA.length, promisesB.length)
    const rows = Array.from({ length: maxRows }, (_, i) => ({
      promiseA: promisesA[i] || null,
      promiseB: promisesB[i] || null,
    }))

    return { category: cat, rows }
  }).filter((cat) => cat.rows.length > 0)
}

// ── GET LOCALISED TEXT ────────────────────────────────────────
// Returns the text in the requested locale, falling back to English.
export function getLocalised(
  text: Record<string, string> | null | undefined,
  locale: Locale
): string {
  if (!text) return ''
  return text[locale] || text['en'] || Object.values(text)[0] || ''
}

// ── CANDIDATE PROMISE COUNT BY CATEGORY ───────────────────────
export function getPromiseCountByCategory(
  promises: Promise[],
  candidateId: string
): Record<Category, number> {
  const categories: Category[] = [
    'economy', 'education', 'health', 'safety',
    'environment', 'social', 'rights', 'infrastructure', 'governance',
  ]

  return Object.fromEntries(
    categories.map((cat) => [
      cat,
      promises.filter((p) => p.candidateId === candidateId && p.category === cat).length,
    ])
  ) as Record<Category, number>
}
