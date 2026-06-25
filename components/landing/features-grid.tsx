import { BarChart3, Sparkles, Zap, Users, Target, RefreshCw, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

function SplitVisual() {
  const bars = [
    { label: "You", pct: 40, color: "bg-violet-500" },
    { label: "Alex", pct: 25, color: "bg-indigo-400" },
    { label: "Sarah", pct: 20, color: "bg-pink-400" },
    { label: "Dev", pct: 15, color: "bg-amber-400" },
  ]
  return (
    <div className="mt-6 space-y-2.5">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 w-10 shrink-0 tabular-nums">{b.label}</span>
          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", b.color)}
              style={{ width: `${b.pct}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400 w-7 text-right tabular-nums">{b.pct}%</span>
        </div>
      ))}
      <div className="pt-2 flex items-center gap-2 flex-wrap">
        {["Equal", "Exact", "Percent", "Shares"].map((mode) => (
          <span
            key={mode}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500"
          >
            {mode}
          </span>
        ))}
      </div>
    </div>
  )
}

function BalanceVisual() {
  return (
    <div className="mt-6 space-y-2">
      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-emerald-50">
        <span className="text-xs text-zinc-600">Alex owes you</span>
        <span className="text-xs font-semibold text-emerald-600">+$120.00</span>
      </div>
      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-rose-50">
        <span className="text-xs text-zinc-600">You owe Sarah</span>
        <span className="text-xs font-semibold text-rose-500">−$45.00</span>
      </div>
      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-100">
        <span className="text-xs font-medium text-zinc-700">Net balance</span>
        <span className="text-xs font-bold text-zinc-900">+$75.00</span>
      </div>
    </div>
  )
}

function SettlementVisual() {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400 mb-2.5">
            Before
          </p>
          <div className="space-y-1.5">
            {["A → B", "A → C", "B → C", "C → D", "D → A"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
                <span className="text-[11px] text-zinc-400">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400 mb-2.5">
            After
          </p>
          <div className="space-y-1.5">
            {["A → C", "D → B"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[11px] text-zinc-700 font-medium">{t}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3">3 fewer payments</p>
        </div>
      </div>
    </div>
  )
}

function GroupsVisual() {
  const avatars = [
    { initial: "A", bg: "#818CF8" },
    { initial: "S", bg: "#F472B6" },
    { initial: "D", bg: "#34D399" },
    { initial: "R", bg: "#FB923C" },
    { initial: "L", bg: "#F87171" },
  ]
  return (
    <div className="mt-6">
      <div className="flex -space-x-2.5">
        {avatars.map((a, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: a.bg }}
          >
            {a.initial}
          </div>
        ))}
        <div className="w-9 h-9 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-zinc-500 text-xs font-medium">
          +4
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        Owner · Admin · Member · Viewer
      </p>
    </div>
  )
}

function BudgetVisual() {
  const items = [
    { label: "Dining", pct: 78, color: "bg-amber-400", spent: "$390", total: "$500" },
    { label: "Transport", pct: 45, color: "bg-violet-400", spent: "$90", total: "$200" },
    { label: "Activities", pct: 92, color: "bg-rose-400", spent: "$460", total: "$500" },
  ]
  return (
    <div className="mt-6 space-y-3.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-zinc-600">{item.label}</span>
            <span className="text-[11px] text-zinc-400 tabular-nums">
              {item.spent} / {item.total}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", item.color)}
              style={{ width: `${item.pct}%` }}
            />
          </div>
          {item.pct >= 90 && (
            <p className="text-[10px] text-rose-500 font-medium mt-1">Near limit</p>
          )}
        </div>
      ))}
    </div>
  )
}

function ReceiptVisual() {
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-zinc-700">BOCA Restaurant</span>
          <span className="text-[11px] text-zinc-400">Jun 24</span>
        </div>
        {[
          { item: "Sea bass", amount: "$42" },
          { item: "Burrata", amount: "$18" },
          { item: "Wine ×2", amount: "$54" },
        ].map((row) => (
          <div key={row.item} className="flex justify-between items-center py-1 px-2 rounded-lg bg-violet-50/60 ring-1 ring-violet-200/40">
            <span className="text-[11px] text-zinc-600">{row.item}</span>
            <span className="text-[11px] font-medium text-zinc-700">{row.amount}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] font-bold text-zinc-700">Total</span>
          <span className="text-[11px] font-bold text-zinc-900">$240.00</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center">
          <Sparkles size={9} className="text-violet-600" />
        </div>
        <span className="text-[11px] text-zinc-500">AI extracted · Review before saving</span>
      </div>
    </div>
  )
}

function RecurringVisual() {
  return (
    <div className="mt-6 space-y-2">
      {[
        { name: "Rent", cycle: "Monthly", amount: "$1,200" },
        { name: "Netflix", cycle: "Monthly", amount: "$18" },
        { name: "Gym", cycle: "Monthly", amount: "$45" },
      ].map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50"
        >
          <div>
            <p className="text-xs font-medium text-zinc-800">{item.name}</p>
            <p className="text-[10px] text-zinc-400">{item.cycle}</p>
          </div>
          <span className="text-xs font-semibold text-zinc-700">{item.amount}</span>
        </div>
      ))}
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  tag: string
  title: string
  description: string
  accent: string
  children?: React.ReactNode
  className?: string
}

function FeatureCard({
  icon: Icon,
  tag,
  title,
  description,
  accent,
  children,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-zinc-200/80 p-6 flex flex-col overflow-hidden",
        className,
      )}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 shrink-0"
        style={{ backgroundColor: accent + "18", color: accent }}
      >
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-2">{tag}</p>
      <h3 className="font-heading font-semibold text-zinc-900 text-[1.05rem] leading-snug mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  )
}

export function FeaturesGrid() {
  return (
    <section id="features" className="py-28 px-6 bg-zinc-50/60">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-xl mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-violet-600 mb-3">
            Features
          </p>
          <h2
            className="font-heading font-bold tracking-[-0.03em] text-zinc-900 leading-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            Everything you need to track shared money.
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            From splitting a dinner to managing a group trip budget — Owelio
            handles it all with precision.
          </p>
        </div>

        {/* Bento grid — 3 cols on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1 */}
          <FeatureCard
            icon={Scale}
            tag="Splitting"
            title="Split any way you like"
            description="Equal amounts, exact figures, percentages, or custom shares. Define it once and Owelio handles the arithmetic forever."
            accent="#7C3AED"
            className="lg:col-span-2"
          >
            <SplitVisual />
          </FeatureCard>

          <FeatureCard
            icon={Sparkles}
            tag="AI"
            title="Receipt scanning"
            description="Photograph a receipt and AI extracts items, totals, and suggests a split. Review before confirming."
            accent="#7C3AED"
          >
            <ReceiptVisual />
          </FeatureCard>

          {/* Row 2 */}
          <FeatureCard
            icon={BarChart3}
            tag="Balances"
            title="Always know the score"
            description="A live ledger across all your groups. Net balances update the moment an expense is added."
            accent="#059669"
          >
            <BalanceVisual />
          </FeatureCard>

          <FeatureCard
            icon={Zap}
            tag="Settlements"
            title="Settle in fewer moves"
            description="Our algorithm minimizes the number of payments needed to fully settle a group's debts."
            accent="#D97706"
          >
            <SettlementVisual />
          </FeatureCard>

          <FeatureCard
            icon={Users}
            tag="Groups"
            title="Groups for every occasion"
            description="Trips, households, projects. Invite by link or email. Fine-grained roles so the right people can edit."
            accent="#2563EB"
          >
            <GroupsVisual />
          </FeatureCard>

          {/* Row 3 */}
          <FeatureCard
            icon={Target}
            tag="Budgets"
            title="Set limits. Stay honest."
            description="Define budgets per category, group, or trip. Get warnings before you overspend, not after."
            accent="#E11D48"
            className="lg:col-span-2"
          >
            <BudgetVisual />
          </FeatureCard>

          <FeatureCard
            icon={RefreshCw}
            tag="Recurring"
            title="Bills on autopilot"
            description="Monthly rent, utilities, subscriptions. Auto-generate expenses, send reminders, skip or pause anytime."
            accent="#64748B"
          >
            <RecurringVisual />
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}
