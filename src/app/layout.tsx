import type { Metadata } from "next"
import "./globals.css"
import SiteHeader from "@/components/SiteHeader"
import { LanguageProvider } from "@/lib/i18n"
import { AuthProvider } from "@/lib/firebase"

export const metadata: Metadata = {
  title: "ग्राम व्यापार AI मित्र — Rural Business Advisory Assistant",
  description:
    "AI-driven hyper-local business advisory and financial structuring assistant for rural micro-entrepreneurs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <AuthProvider>
          <LanguageProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
