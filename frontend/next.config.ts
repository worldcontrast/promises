import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  // Redirect removido daqui — feito no middleware para evitar
  // conflito com o next-intl que também intercepta a raiz "/"
}

export default withNextIntl(nextConfig)
