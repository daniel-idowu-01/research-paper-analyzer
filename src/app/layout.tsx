import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "next-themes"

export const metadata = {
  title: "Research Paper Analyzer",
  description: "AI-powered research paper analysis tool",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

