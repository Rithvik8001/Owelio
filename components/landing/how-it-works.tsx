import { Users, Receipt, BarChart3, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

function CreateGroupVisual() {
  const invites = [
    { email: "alex@email.com", status: "accepted", color: "#818CF8" },
    { email: "sarah@email.com", status: "accepted", color: "#F472B6" },
    { email: "dev@email.com", status: "pending", color: "#94A3B8" },
  ]
  return (
    <div className="mt-6 space-y-2">
      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 mb-3">
        <span className="text-xs font-semibold text-zinc-700">Lisbon Trip 🇵🇹</span>
        <span className="text-[10px] text-zinc-400">5 members</span>
      </div>
      {invites.map((inv) => (
        <div key={inv.email} className="flex items-center justify-between py-1.5 px-2">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: inv.color }}
            />
            <span className="text-[11px] text-zinc-600">{inv.email}</span>
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              inv.status === "accepted"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-zinc-100 text-zinc-400",
            )}
          >
            {inv.status === "accepted" ? "Joined" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  )
}

function LogExpenseVisual() {
  return (
    <div className="mt-6 space-y-2.5">
      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-800">Dinner at BOCA</span>
          <span className="text-xs font-bold text-zinc-900">$240</span>
        </div>
        <div className="flex gap-1.5">
          {["Equal", "Exact", "%" , "Shares"].map((m, i) => (
            <span
              key={m}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                i === 0
                  ? "bg-violet-100 text-violet-700 ring-1 ring-violet-300/60"
                  : "bg-zinc-100 text-zinc-500",
              )}
            >
              {m}
            </span>
          ))}
        </div>
        <div className="text-[11px] text-zinc-500 pt-0.5">4 people · $60 each</div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center">
          <Receipt size={9} className="text-violet-600" />
        </div>
        <span className="text-[11px] text-zinc-500">Or scan a receipt with AI</span>
      </div>
    </div>
  )
}

function TrackLedgerVisual() {
  return (
    <div className="mt-6 space-y-2">
      {[
        { name: "Alex M.", amount: "+$120.00", dir: "up", color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Sarah K.", amount: "−$45.00", dir: "down", color: "text-rose-500", bg: "bg-rose-50" },
        { name: "Dev P.", amount: "+$60.00", dir: "up", color: "text-emerald-600", bg: "bg-emerald-50" },
      ].map((row) => (
        <div key={row.name} className={cn("flex items-center justify-between py-2 px-3 rounded-xl", row.bg)}>
          <span className="text-xs text-zinc-600">{row.name}</span>
          <span className={cn("text-xs font-semibold tabular-nums", row.color)}>{row.amount}</span>
        </div>
      ))}
      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-100 mt-1">
        <span className="text-xs font-medium text-zinc-700">Your net balance</span>
        <span className="text-xs font-bold text-zinc-900">+$135.00</span>
      </div>
    </div>
  )
}

function SettleVisual() {
  return (
    <div className="mt-6 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">
        Suggested payments
      </p>
      {[
        { from: "Alex", to: "You", amount: "$120.00" },
        { from: "Dev", to: "Sarah", amount: "$45.00" },
      ].map((s) => (
        <div
          key={`${s.from}-${s.to}`}
          className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white border border-zinc-200"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-700">{s.from}</span>
            <span className="text-[10px] text-zinc-400">→</span>
            <span className="text-xs font-medium text-zinc-700">{s.to}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 tabular-nums">{s.amount}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Confirm
            </span>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-emerald-600 font-medium">3 fewer transfers than manual</p>
    </div>
  )
}

interface StepCardProps {
  number: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  accent: string
  children?: React.ReactNode
  className?: string
}

function StepCard({ number, icon: Icon, title, description, accent, children, className }: StepCardProps) {
  return (
    <div className={cn("rounded-2xl bg-white border border-zinc-200/80 p-6 flex flex-col overflow-hidden", className)}>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: accent + "18", color: accent }}
        >
          <Icon size={18} />
        </div>
        <span
          className="font-heading font-bold text-[2.25rem] leading-none tracking-[-0.04em] select-none"
          style={{ color: accent + "20" }}
        >
          {number}
        </span>
      </div>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
        style={{ color: accent }}
      >
        Step {number}
      </p>
      <h3 className="font-heading font-semibold text-zinc-900 text-[1.05rem] leading-snug mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-violet-600 mb-3">
            How it works
          </p>
          <h2
            className="font-heading font-bold tracking-[-0.03em] text-zinc-900 leading-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            Four steps. No confusion.
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            Owelio is designed to get out of your way. The happy path is short;
            the power is there when you need it.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1 */}
          <StepCard
            number="01"
            icon={Users}
            title="Create a group"
            description="Name it, invite members by email or link. Assign roles so everyone knows what they can do."
            accent="#2563EB"
            className="lg:col-span-2"
          >
            <CreateGroupVisual />
          </StepCard>

          <StepCard
            number="02"
            icon={Receipt}
            title="Log expenses as they happen"
            description="Add manually or scan a receipt with AI. Choose how to split. Done in seconds."
            accent="#7C3AED"
          >
            <LogExpenseVisual />
          </StepCard>

          {/* Row 2 */}
          <StepCard
            number="03"
            icon={BarChart3}
            title="Owelio tracks the ledger"
            description="Every expense creates precise ledger entries. Balances update in real time — no spreadsheets."
            accent="#059669"
          >
            <TrackLedgerVisual />
          </StepCard>

          <StepCard
            number="04"
            icon={CheckCircle2}
            title="Settle with fewer payments"
            description="Owelio suggests the minimum transfers to clear all debts. Confirm and the ledger closes."
            accent="#D97706"
            className="lg:col-span-2"
          >
            <SettleVisual />
          </StepCard>
        </div>
      </div>
    </section>
  )
}
