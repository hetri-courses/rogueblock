import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Layout from './components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RogueBlock - Interactive Media Platform',
  description: 'Professional interactive media platform with embedded content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/rogueblock/favicon.svg" />

        {/* Content Security Policy to block tracking domains */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' https://player.twitch.tv https://assets.twitch.tv; script-src 'self' https://player.twitch.tv https://assets.twitch.tv 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://player.twitch.tv https://assets.twitch.tv; frame-src https://player.twitch.tv; object-src 'none'; base-uri 'self'; form-action 'self';"
        />
        {/* Block specific tracking domains */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="block-all-mixed-content; upgrade-insecure-requests; frame-ancestors 'none';"
        />
      </head>
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}
