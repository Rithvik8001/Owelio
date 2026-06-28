import { Sparkles, Tag, MessageSquare, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

function ReceiptScanVisual() {
  return (
    <div className="mt-6">
      <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-700">
            BOCA Restaurant
          </span>
          <span className="text-[11px] text-zinc-400">Jun 24</span>
        </div>
        {[
          { item: "Sea bass", amount: "$42" },
          { item: "Burrata", amount: "$18" },
          { item: "Wine ×2", amount: "$54" },
        ].map((row) => (
          <div
            key={row.item}
            className="flex items-center justify-between rounded-lg bg-violet-50/70 px-2 py-1 ring-1 ring-violet-200/50"
          >
            <span className="text-[11px] text-zinc-600">{row.item}</span>
            <span className="text-[11px] font-medium text-zinc-700">
              {row.amount}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-zinc-700">Total</span>
          <span className="text-[11px] font-bold text-zinc-900">$240.00</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-100">
          <Sparkles size={9} className="text-violet-600" />
        </div>
        <span className="text-[11px] text-zinc-500">
          AI extracted · Review before saving
        </span>
      </div>
    </div>
  )
}

function CategorizationVisual() {
  const tags = [
    { label: "Dining", color: "bg-orange-100 text-orange-700" },
    { label: "Transport", color: "bg-blue-100 text-blue-700" },
    { label: "Accommodation", color: "bg-violet-100 text-violet-700" },
    { label: "Activities", color: "bg-emerald-100 text-emerald-700" },
    { label: "Groceries", color: "bg-amber-100 text-amber-700" },
    { label: "Shopping", color: "bg-pink-100 text-pink-700" },
  ]
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t.label}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            t.color
          )}
        >
          {t.label}
        </span>
      ))}
    </div>
  )
}

function ExplanationVisual() {
  return (
    <div className="mt-6 space-y-2.5">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
          Why this payment?
        </p>
        <p className="text-xs leading-relaxed text-zinc-700">
          Alex pays you{" "}
          <span className="font-semibold text-zinc-900">$120</span> to resolve{" "}
          <span className="font-semibold text-zinc-900">3 expenses</span> from
          the Lisbon trip: dinner, taxi, and the museum.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100">
          <MessageSquare size={9} className="text-amber-600" />
        </div>
        <span className="text-[11px] text-zinc-500">Plain English, always</span>
      </div>
    </div>
  )
}

function AssistantVisual() {
  return (
    <div className="mt-6 space-y-2">
      <div className="max-w-[90%] rounded-xl bg-zinc-100 px-3 py-2">
        <p className="text-[11px] text-zinc-600">
          How much did we spend on food in Lisbon?
        </p>
      </div>
      <div className="ml-auto max-w-[90%] rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-right">
        <p className="text-[11px] font-medium text-blue-700">
          $487 across 6 dining expenses
        </p>
        <p className="mt-0.5 text-[10px] text-blue-500">
          avg. $81 per meal · 5 people
        </p>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100">
          <Bot size={9} className="text-blue-600" />
        </div>
        <span className="text-[11px] text-zinc-500">
          Instant · Always precise
        </span>
      </div>
    </div>
  )
}

interface AiCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  tag: string
  title: string
  description: string
  accent: string
  children?: React.ReactNode
  className?: string
}

function AiCard({
  icon: Icon,
  tag,
  title,
  description,
  accent,
  children,
  className,
}: AiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6",
        className
      )}
    >
      <div
        className="mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: accent + "18", color: accent }}
      >
        <Icon size={18} />
      </div>
      <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
        {tag}
      </p>
      <h3 className="mb-2 font-heading text-[1.05rem] leading-snug font-semibold text-zinc-900">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  )
}

export function AiSection() {
  return (
    <section className="bg-zinc-50/60 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 max-w-xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase shadow-sm">
            <Sparkles size={10} className="text-violet-500" />
            AI-powered
          </div>
          <h2
            className="mb-4 font-heading leading-tight font-bold tracking-[-0.03em] text-zinc-900"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            Intelligent by design.
          </h2>
          <p className="text-base leading-relaxed text-zinc-500">
            Owelio's AI layer works silently in the background — categorizing
            expenses, reading receipts, and synthesizing spending patterns into
            clear, actionable insights.
          </p>
        </div>

        {/* Bento grid — mirrors the features section layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Row 1: large + small */}
          <AiCard
            icon={Sparkles}
            tag="Receipt AI"
            title="Receipt understanding"
            description="Upload a photo of any receipt and AI reads merchant, date, line items, and total. Review, adjust, and confirm. No manual entry."
            accent="#7C3AED"
            className="lg:col-span-2"
          >
            <ReceiptScanVisual />
          </AiCard>

          <AiCard
            icon={Tag}
            tag="Categorization"
            title="Auto-categorization"
            description="Expenses are tagged automatically — Dining, Transport, Accommodation, Activities. Clean categories make budgets and analytics meaningful."
            accent="#059669"
          >
            <CategorizationVisual />
          </AiCard>

          {/* Row 2: small + large */}
          <AiCard
            icon={MessageSquare}
            tag="Settlements"
            title="Settlement explanation"
            description="Before you pay, Owelio explains in plain English why each transfer is suggested and which expenses it resolves."
            accent="#D97706"
          >
            <ExplanationVisual />
          </AiCard>

          <AiCard
            icon={Bot}
            tag="Assistant"
            title="Financial assistant"
            description={`Ask anything about your group's spending. "How much did we spend on food in Lisbon?" Get a precise answer instantly.`}
            accent="#2563EB"
            className="lg:col-span-2"
          >
            <AssistantVisual />
          </AiCard>
        </div>
      </div>
    </section>
  )
}
