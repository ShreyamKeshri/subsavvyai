import './globals.css'
import { Toaster } from 'sonner'
import { branding } from '@/lib/config/branding'

export const metadata = {
  title: branding.meta.title,
  description: branding.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
