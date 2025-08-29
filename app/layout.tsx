import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CRMProvider } from './contexts/CRMContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM Analytics Pro - Dashboard Inteligente',
  description: 'Sistema CRM avançado com inteligência artificial para análise de dados e tomada de decisões empresariais',
  keywords: 'CRM, Analytics, Dashboard, Business Intelligence, Vendas, Clientes',
  authors: [{ name: 'CRM Analytics Pro' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <CRMProvider>
          <div className="min-h-full">
            {children}
          </div>
        </CRMProvider>
      </body>
    </html>
  )
}