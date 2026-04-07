import type { Election, Category } from '@/types'

export interface ElectionSummary {
  id: string
  country: string
  countryName: Record<string, string>
  flag: string
  electionName: Record<string, string>
  electionDate: string
  status: string
  candidateCount: number
  promiseCount: number
}

export async function getElection(id: string): Promise<Election | null> {
  try {
    const data = await import(`../../data/${id}.json`)
    return data.default as Election
  } catch {
    return null
  }
}

export async function getAllElections(): Promise<ElectionSummary[]> {
  const ids = ['brazil-2026']
  const out: ElectionSummary[] = []
  for (const id of ids) {
    const e = await getElection(id)
    if (e) out.push({
      id: e.id,
      country: e.country,
      countryName: e.countryName,
      flag: e.flag,
      electionName: e.electionName,
      electionDate: e.electionDate,
      status: e.status,
      candidateCount: e.candidates.length,
      promiseCount: e.promises.length,
    })
  }
  return out
}

export function getLocalised(
  text: Record<string, string> | null | undefined,
  locale: string
): string {
  if (!text) return ''
  return text[locale] || text['en'] || Object.values(text)[0] || ''
}

export function getComparisonData(
  election: Election,
  candAId: string,
  candBId: string,
  category?: Category
) {
  const allCats: Category[] = [
    'economy', 'education', 'health', 'safety',
    'environment', 'social', 'rights', 'infrastructure', 'governance',
  ]
  const cats = category ? [category] : allCats

  return cats.map(cat => {
    const pA = election.promises.filter(p => p.candidateId === candAId && p.category === cat)
    const pB = election.promises.filter(p => p.candidateId === candBId && p.category === cat)
    const len = Math.max(pA.length, pB.length)
    if (len === 0) return null
    return {
      category: cat,
      rows: Array.from({ length: len }, (_, i) => ({
        promiseA: pA[i] || null,
        promiseB: pB[i] || null,
      })),
    }
  }).filter(Boolean) as { category: Category; rows: { promiseA: any; promiseB: any }[] }[]
}
