import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

function BalanceCard() {
  const members = [
    { initial: "A", name: "Alex M.", amount: "340.00", ring: "#818CF8" },
    { initial: "S", name: "Sarah K.", amount: "267.50", ring: "#F472B6" },
    { initial: "D", name: "Dev P.", amount: "240.00", ring: "#34D399" },
  ]

  return (
    <div className="relative mx-auto w-fit select-none">
      {/* Main balance card */}
      <div className="relative z-10 w-[340px] sm:w-[380px] rounded-[1.5rem] bg-white border border-zinc-200/80 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Group header */}
        <div className="px-5 pt-5 pb-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <span className="text-violet-700 text-sm font-bold">W</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Weekend in Bali</p>
              <p className="text-xs text-zinc-400">5 members · 12 expenses</p>
            </div>
          </div>
          <div className="flex -space-x-2 shrink-0">
            {["#818CF8", "#F472B6", "#34D399", "#FB923C"].map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Balance display */}
        <div className="px-5 py-4 bg-gradient-to-b from-zinc-50/60 to-transparent">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-1.5">
            Your balance
          </p>
          <p className="font-heading font-bold text-[2.625rem] tracking-[-0.04em] text-zinc-900 leading-none">
            +$847.50
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1.5">Overall you are owed</p>
        </div>

        {/* Member list */}
        <div className="px-5 py-4 space-y-3.5">
          {members.map((m) => (
            <div key={m.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: m.ring }}
                >
                  {m.initial}
                </div>
                <span className="text-sm text-zinc-700">{m.name}</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">+${m.amount}</span>
            </div>
          ))}
        </div>

        {/* Settle CTA */}
        <div className="px-5 pb-5 pt-3 border-t border-zinc-100">
          <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[0.75rem] bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">
            Settle up <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Floating: recent expense */}
      <div className="absolute -top-5 -right-3 sm:-right-8 z-20 w-[180px] rounded-xl bg-white border border-zinc-200/80 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.10)] p-3.5 rotate-[2.5deg]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Check size={11} className="text-emerald-600" strokeWidth={3} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">Dinner at BOCA</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Split 4 ways · $240</p>
          </div>
        </div>
      </div>

      {/* Floating: AI insight */}
      <div className="absolute -bottom-5 -left-3 sm:-left-8 z-20 w-[180px] rounded-xl bg-white border border-zinc-200/80 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.10)] p-3.5 -rotate-[1.5deg]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <Sparkles size={11} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">AI insight</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">2 payments settle all</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-hidden">
      {/* Background: very subtle violet radial glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px]"
          style={{
            background:
              "radial-gradient(ellipse at top, oklch(0.95 0.025 301.924) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto w-full text-center">
        {/* Label pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-7 rounded-full bg-white border border-zinc-200 shadow-sm text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.06em]">
          <Sparkles size={10} className="text-violet-500" />
          Expense splitting, reimagined
        </div>

        {/* Headline */}
        <h1
          className="font-heading font-bold tracking-[-0.04em] leading-[1.06] text-zinc-900 mb-5"
          style={{ fontSize: "clamp(2.6rem, 6.5vw, 5rem)" }}
        >
          The honest way to<br className="hidden sm:block" /> split expenses.
        </h1>

        {/* Sub-headline */}
        <p className="text-[1.1rem] leading-[1.7] text-zinc-500 max-w-[480px] mx-auto mb-10">
          Track group costs with precision, minimize the payments needed to
          settle, and keep money out of the way of friendship.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-24">
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center px-7 py-3 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-700 transition-colors shadow-sm"
          >
            Start for free
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-7 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100/70"
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
