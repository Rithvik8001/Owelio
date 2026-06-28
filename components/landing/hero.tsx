import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"

function BalanceCard() {
  const members = [
    { initial: "A", name: "Alex M.", amount: "340.00", ring: "#818CF8" },
    { initial: "S", name: "Sarah K.", amount: "267.50", ring: "#F472B6" },
    { initial: "D", name: "Dev P.", amount: "240.00", ring: "#34D399" },
  ]

  return (
    <div className="relative mx-auto w-fit select-none">
      {/* Main balance card */}
      <div className="relative z-10 w-[340px] overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] sm:w-[380px]">
        {/* Group header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <span className="text-sm font-bold text-violet-700">W</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Weekend in Bali
              </p>
              <p className="text-xs text-zinc-400">5 members · 12 expenses</p>
            </div>
          </div>
          <div className="flex shrink-0 -space-x-2">
            {["#818CF8", "#F472B6", "#34D399", "#FB923C"].map((color, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Balance display */}
        <div className="bg-gradient-to-b from-zinc-50/60 to-transparent px-5 py-4">
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
            Your balance
          </p>
          <p className="font-heading text-[2.625rem] leading-none font-bold tracking-[-0.04em] text-zinc-900">
            +$847.50
          </p>
          <p className="mt-1.5 text-xs font-medium text-emerald-600">
            Overall you are owed
          </p>
        </div>

        {/* Member list */}
        <div className="space-y-3.5 px-5 py-4">
          {members.map((m) => (
            <div key={m.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: m.ring }}
                >
                  {m.initial}
                </div>
                <span className="text-sm text-zinc-700">{m.name}</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">
                +${m.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Settle CTA */}
        <div className="border-t border-zinc-100 px-5 pt-3 pb-5">
          <button className="flex w-full items-center justify-center gap-1.5 rounded-[0.75rem] bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
            Settle up <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Floating: recent expense */}
      <div className="absolute -top-5 -right-3 z-20 w-[180px] rotate-[2.5deg] rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.10)] sm:-right-8">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check size={11} className="text-emerald-600" strokeWidth={3} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">
              Dinner at BOCA
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              Split 4 ways · $240
            </p>
          </div>
        </div>
      </div>

      {/* Floating: AI insight */}
      <div className="absolute -bottom-5 -left-3 z-20 w-[180px] -rotate-[1.5deg] rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.10)] sm:-left-8">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100">
            <Sparkles size={11} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">AI insight</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              2 payments settle all
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-32">
      {/* Background: very subtle violet radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute top-0 left-1/2 h-[700px] w-[1000px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at top, oklch(0.95 0.025 301.924) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-4xl text-center">
        {/* Label pill */}
        <div className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-zinc-500 uppercase shadow-sm">
          <Sparkles size={10} className="text-violet-500" />
          Expense splitting, reimagined
        </div>

        {/* Headline */}
        <h1
          className="mb-5 font-heading leading-[1.06] font-bold tracking-[-0.04em] text-zinc-900"
          style={{ fontSize: "clamp(2.6rem, 6.5vw, 5rem)" }}
        >
          The honest way to
          <br className="hidden sm:block" /> split expenses.
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mb-10 max-w-[480px] text-[1.1rem] leading-[1.7] text-zinc-500">
          Track group costs with precision, minimize the payments needed to
          settle, and keep money out of the way of friendship.
        </p>

        {/* CTAs */}
        <div className="mb-24 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 sm:w-auto"
          >
            Start for free
          </Link>
          <Link
            href="#how-it-works"
            className="flex w-full items-center justify-center gap-1.5 rounded-full px-7 py-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100/70 hover:text-zinc-900 sm:w-auto"
          >
            See how it works <ArrowRight size={14} />
          </Link>
        </div>

        {/* Product card */}
        <div className="py-8">
          <BalanceCard />
        </div>
      </div>
    </section>
  )
}
