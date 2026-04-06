// ============================================================
// World Contrast — Compare Page
// File: src/app/[locale]/compare/[electionId]/page.tsx
//
// URL: /compare/brazil-2026
// URL: /pt/compare/brazil-2026
// URL: /es/compare/brazil-2026
// ============================================================

import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getElection, getComparisonData } from '@/lib/data'
import CompareHeader from '@/components/compare/CompareHeader'
import CandidateHeaders from '@/components/compare/CandidateHeaders'
import FilterBar from '@/components/compare/FilterBar'
import PromiseGrid from '@/components/compare/PromiseGrid'
import CompareLegend from '@/components/compare/CompareLegend'
import type { Locale } from '@/i18n'
import type { Category } from '@/types'

interface Props {
  params: { locale: Locale; electionId: string }
  searchParams: { category?: Category }
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, electionId } = params
  const { category } = searchParams

  const election = await getElection(electionId)
  if (!election) notFound()

  // For MVP: compare first two candidates
  // TODO: allow user to select any two candidates
  const candidateA = election.candidates[0]
  const candidateB = election.candidates[1]

  if (!candidateA || !candidateB) notFound()

  const comparisonData = getComparisonData(
    election,
    candidateA.id,
    candidateB.id,
    category
  )

  return (
    <>
      <CompareHeader election={election} locale={locale} />
      <CandidateHeaders
        candidateA={candidateA}
        candidateB={candidateB}
        locale={locale}
      />
      <FilterBar activeCategory={category} electionId={electionId} />
      <PromiseGrid
        data={comparisonData}
        locale={locale}
      />
      <CompareLegend />
    </>
  )
}

// Generate static paths for all elections
export async function generateStaticParams() {
  const { getAllElections } = await import('@/lib/data')
  const elections = await getAllElections()

  return elections.map((e) => ({ electionId: e.id }))
}
