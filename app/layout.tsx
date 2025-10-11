import './globals.css'
import { Toaster } from 'sonner'
import { branding } from '@/lib/config/branding'
import { PHProvider } from '@/lib/analytics/posthog-provider'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  title: branding.meta.title,
  description: branding.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <PHProvider>
            {children}
            <Toaster position="top-right" richColors />
          </PHProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
