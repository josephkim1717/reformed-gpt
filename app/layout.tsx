import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reformed GPT',
  description: 'A Reformed theology chatbot grounded in the Westminster Standards',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
