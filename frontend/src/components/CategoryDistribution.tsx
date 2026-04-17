/**
 * World Contrast — Category Distribution
 * File: frontend/src/components/CategoryDistribution.tsx
 *
 * Mostra distribuição de promessas por categoria de UM candidato.
 * NUNCA compara A vs B — cada candidato tem seu próprio gráfico.
 * Barras proporcionais ao máximo daquele candidato, não do outro.
 */
import type { CampaignPromise, Category } from '@/types'
import { CATEGORY_CONFIG } from '@/types'

const TITLE: Record<string, string> = {
  en: 'Promise distribution',
  pt: 'Distribuição de promessas',
  es: 'Distribución de promesas',
  fr: 'Répartition des promesses',
  de: 'Versprechen-Verteilung',
  ar: 'توزيع الوعود',
  zh: '承诺分布',
  ja: '公約の分布',
  hi: 'वादों का वितरण',
  ru: 'Распределение обещаний',
}

interface Props {
  promises: CampaignPromise[]
  locale: string
}

export default function CategoryDistribution({ promises, locale }: Props) {
  if (!promises || promises.length === 0) return null

  const allCats = Object.keys(CATEGORY_CONFIG) as Category[]

  // Conta promessas por categoria DESTE candidato
  const counts = allCats.map(cat => ({
    cat,
    count: promises.filter(p => p.category === cat).length,
  })).filter(r => r.count > 0)

  if (counts.length === 0) return null

  const max = Math.max(...counts.map(r => r.count))
  const title = TITLE[locale] ?? TITLE['en']

  return (
    <div className="cat-dist" aria-label={title}>
      <p className="t-eyebrow" style={{ marginBottom: 'var(--space-1)' }}>
        {title}
      </p>
      {counts.map(({ cat, count }) => {
        const cfg = CATEGORY_CONFIG[cat]
        const pct = max > 0 ? (count / max) * 100 : 0
        const label = cfg.label[locale] || cfg.label['en']

        return (
          <div key={cat} className="cat-dist-row">
            <span className="cat-dist-emoji" aria-hidden="true">
              {cfg.emoji}
            </span>
            <div
              className="cat-dist-bar-wrap"
              role="progressbar"
              aria-valuenow={count}
              aria-valuemax={max}
              aria-label={label}
            >
              <div
                className="cat-dist-bar-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="cat-dist-count">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
