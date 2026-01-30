import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Code Roast Wrapped',
  description: 'Spotify Wrapped style pour tes commits Git',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
