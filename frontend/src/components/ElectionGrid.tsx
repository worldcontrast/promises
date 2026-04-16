/**
 * World Contrast — Election Grid com filtro de busca
 * File: frontend/src/components/ElectionGrid.tsx
 *
 * Client Component — recebe elections[] do servidor.
 * Filtra localmente sem nenhuma chamada de rede.
 * Normaliza acentos para "Brasil" == "brazil" == "Brésil".
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ElectionSummary } from '@/lib/data'

const SEARCH_PLACEHOLDER: Record<string, string> = {
  en: 'Search election or country...',
  pt: 'Buscar eleição ou país...',
  es: 'Buscar elección o país...',
  fr: 'Rechercher une élection ou un pays...',
  de: 'Wahl oder Land suchen...',
  ar: 'البحث عن انتخابات أو دولة...',
  zh: '搜索选举或国家...',
  ja: '選挙または国を検索...',
  hi: 'चुनाव या देश खोजें...',
  ru: 'Поиск выборов или страны...',
}

const STATUS_LABEL: Record<string, Record<string, string>> = {
  live:      { en: 'Live', pt: 'Ao vivo', es: 'En vivo', fr: 'En direct', de: 'Live', ar: 'مباشر', zh: '直播', ja: 'ライブ', hi: 'लाइव', ru: 'Прямой эфир' },
  scheduled: { en: 'Scheduled', pt: 'Agendado', es: 'Programado', fr: 'Planifié', de: 'Geplant', ar: 'مجدول', zh: '已预定', ja: '予定済み', hi: 'निर्धारित', ru: 'Запланировано' },
  closed:    { en: 'Closed', pt: 'Encerrado', es: 'Cerrado', fr: 'Terminé', de: 'Abgeschlossen', ar: 'مغلق', zh: '已结束', ja: '終了', hi: 'बंद', ru: 'Закрыто' },
}

const COMPARE_LABEL: Record<string, string> = {
  en: 'Compare →', pt: 'Comparar →', es: 'Comparar →',
  fr: 'Comparer →', de: 'Vergleichen →', ar: 'قارن →',
  zh: '比较 →', ja: '比較する →', hi: 'तुलना करें →', ru: 'Сравнить →',
}

const CANDIDATES_LABEL: Record<string, string> = {
  en: 'candidates', pt: 'candidatos', es: 'candidatos',
  fr: 'candidats', de: 'Kandidaten', ar: 'مرشحون',
  zh: '候选人', ja: '候補者', hi: 'उम्मीदवार', ru: 'кандидатов',
}

const PROMISES_LABEL: Record<string, string> = {
  en: 'promises', pt: 'promessas', es: 'promesas',
  fr: 'promesses', de: 'Versprechen', ar: 'وعود',
  zh: '承诺', ja: '公約', hi: 'वादे', ru: 'обещаний',
}

// Normaliza string para comparação sem acentos e case-insensitive
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

interface Props {
  elections: ElectionSummary[]
  locale: string
}

export default function ElectionGrid({ elections, locale }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? elections.filter(e => {
        const q = normalize(query)
        // Testa contra todos os nomes em todos os idiomas + country + flag
        const names = Object.values(e.electionName).map(normalize)
        const countryNames = Object.values(e.countryName ?? {}).map(normalize)
        return (
          names.some(n => n.includes(q)) ||
          countryNames.some(n => n.includes(q)) ||
          normalize(e.country).includes(q) ||
          normalize(e.flag).includes(q)
        )
      })
    : elections

  const placeholder = SEARCH_PLACEHOLDER[locale] ?? SEARCH_PLACEHOLDER['en']
  const compareLabel = COMPARE_LABEL[locale] ?? COMPARE_LABEL['en']
  const candidatesLabel = CANDIDATES_LABEL[locale] ?? CANDIDATES_LABEL['en']
  const promisesLabel = PROMISES_LABEL[locale] ?? PROMISES_LABEL['en']

  function getElectionName(e: ElectionSummary): string {
    return e.electionName[locale] || e.electionName['en'] || Object.values(e.electionName)[0] || ''
  }

  function getStatusLabel(status: string): string {
    return STATUS_LABEL[status]?.[locale] ?? STATUS_LABEL[status]?.['en'] ?? status
  }

  return (
    <>
      {/* Filtro discreto — sem ícone, sem label, sem hero search */}
      <div className="election-search-wrap">
        <input
          type="text"
          className="election-search"
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Grid de eleições */}
      <div className="elections-grid">
        {filtered.map(election => (
          <Link
            key={election.id}
            href={`/${locale}/compare/${election.id}`}
            className="election-card"
          >
            <div className="ec-top">
              <div className="ec-flag" aria-hidden="true">{election.flag}</div>
              <div className="ec-info">
                <div className="ec-name">{getElectionName(election)}</div>
                <div className="ec-meta">
                  <span
                    className="t-proof"
                    style={{
                      color: election.status === 'live' ? 'var(--gold-deep)' : 'var(--ink-30)',
                    }}
                  >
                    {getStatusLabel(election.status)}
                  </span>
                  {' · '}
                  <span className="t-proof">{election.electionDate}</span>
                </div>
              </div>
            </div>

            <div className="ec-cands t-proof">
              {election.candidateCount} {candidatesLabel}
              {' · '}
              {election.promiseCount} {promisesLabel}
            </div>

            <div className="ec-footer">
              <span className="ec-arrow">{compareLabel}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
