import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  // O Next.js vai interceptar quem acessar a raiz e jogar direto para a página pronta
  async redirects() {
    return [
      {
        source: '/',
        destination: '/pt/compare/brazil-2026',
        permanent: false, 
      },
    ]
  },
}

export default withNextIntl(nextConfig)
