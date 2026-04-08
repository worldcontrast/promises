import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  // Isso ajuda a evitar erros de rota no servidor
  trailingSlash: true,
}

export default withNextIntl(nextConfig)
