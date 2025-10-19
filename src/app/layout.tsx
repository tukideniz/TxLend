import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Definition - Ödünç Takipçisi',
  description: 'Minimalist Stellar Soroban dApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}



