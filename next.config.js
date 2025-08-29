/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  images: {
    domains: ['localhost'],
  },
  // Excluir pastas que não devem ser compiladas pelo Next.js
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    // Ignorar arquivos backend e frontend antigo
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /backend/,
        /frontend/,
        /nextjs-crm/
      ],
    })
    
    return config
  },
  // Otimizações para dashboards
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // PWA para melhor performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig