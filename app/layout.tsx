import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Owelio — The honest way to split expenses",
  description:
    "Track group costs with precision, minimize payments needed to settle, and keep money out of the way of friendship.",
  keywords: [
    "expense splitting",
    "group expenses",
    "split bills",
    "shared costs",
  ],
  openGraph: {
    title: "Owelio — The honest way to split expenses",
    description:
      "Track group costs with precision, minimize payments needed to settle, and keep money out of the way of friendship.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
