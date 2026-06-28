import type { Metadata } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Owelio — The honest way to split expenses",
  description:
    "Track group costs with precision, minimize payments needed to settle, and keep money out of the way of friendship.",
  keywords: ["expense splitting", "group expenses", "split bills", "shared costs"],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        spaceGrotesk.variable,
        geistMono.variable,
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
