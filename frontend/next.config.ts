import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  // ESSA É A LINHA QUE MATA O 404:
  trailingSlash: true, 
  // Garante que o build seja estático puro
  output: 'export' 
}

export default withNextIntl(nextConfig)
