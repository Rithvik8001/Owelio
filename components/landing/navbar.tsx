"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-zinc-200/60 bg-white/80 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      {/* Grid layout: logo | centered nav | actions */}
      <nav className="mx-auto grid h-16 max-w-6xl grid-cols-3 items-center px-6">
        {/* Left: logo */}
        <Link
          href="/"
          className="font-heading text-[1.15rem] font-bold tracking-tight text-zinc-900"
        >
          Owelio
        </Link>

        {/* Center: nav links */}
        <ul className="hidden items-center justify-center gap-0.5 md:flex">
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="rounded-lg px-3.5 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100/70 hover:text-zinc-900"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            className="hidden h-auto px-3.5 py-2 text-sm text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 md:inline-flex"
          >
            <Link href="/login">Log in</Link>
          </Button>

          <Button
            asChild
            className="ml-1 h-auto rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
