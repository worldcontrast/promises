import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  // Removemos qualquer menção a 'export' ou 'static'
}

export default withNextIntl(nextConfig)
