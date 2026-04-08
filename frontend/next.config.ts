import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  // Mantemos apenas isso para ajudar no roteamento
  trailingSlash: true
}

export default withNextIntl(nextConfig)
