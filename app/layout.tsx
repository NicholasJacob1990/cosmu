import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/app/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GalaxIA - Marketplace de Serviços Profissionais',
  description: 'Conecte-se com os melhores profissionais do Brasil. Encontre serviços de qualidade com IA e sistema de recomendações inteligentes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} font-galaxia bg-background text-foreground min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}