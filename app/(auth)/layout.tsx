import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Owelio — Account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/60 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Home</span>
        </Link>

        <div className="mb-6 text-center">
          <span className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Owelio
          </span>
        </div>

        {children}
      </div>
    </div>
  )
}
