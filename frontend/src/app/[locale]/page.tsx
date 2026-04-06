// ============================================================
// World Contrast — Home Page
// File: src/app/[locale]/page.tsx
// ============================================================

import { useTranslations } from 'next-intl'
import { getAllElections } from '@/lib/data'
import HeroSearch from '@/components/layout/HeroSearch'
import HowItWorks from '@/components/layout/HowItWorks'
import CategoryGrid from '@/components/layout/CategoryGrid'
import CountryList from '@/components/layout/CountryList'
import BottomCta from '@/components/layout/BottomCta'
import type { Locale } from '@/i18n'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const elections = await getAllElections()

  return (
    <>
      <HeroSearch elections={elections} locale={locale} />
      <HowItWorks />
      <CategoryGrid />
      <CountryList elections={elections} locale={locale} />
      <BottomCta />
    </>
  )
}
