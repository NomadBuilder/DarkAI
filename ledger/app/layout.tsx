import type { Metadata, Viewport } from 'next'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'

// Get basePath for favicon paths
const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  title: 'The Ledger — Ontario\'s Quiet Privatization (Americanization)',
  description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
  icons: {
    icon: `${basePath}/favicon.svg`,
    apple: `${basePath}/favicon.svg`,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
