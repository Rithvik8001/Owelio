import { Sparkles, Tag, MessageSquare, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

function ReceiptScanVisual() {
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
          <div
            key={row.item}
            className="flex justify-between items-center py-1 px-2 rounded-lg bg-violet-50/70 ring-1 ring-violet-200/50"
          >
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
          className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold", t.color)}
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
      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
          Why this payment?
        </p>
        <p className="text-xs text-zinc-700 leading-relaxed">
          Alex pays you <span className="font-semibold text-zinc-900">$120</span> to resolve{" "}
          <span className="font-semibold text-zinc-900">3 expenses</span> from the Lisbon trip:
          dinner, taxi, and the museum.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
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
      <div className="rounded-xl bg-zinc-100 px-3 py-2 max-w-[90%]">
        <p className="text-[11px] text-zinc-600">How much did we spend on food in Lisbon?</p>
      </div>
      <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 max-w-[90%] ml-auto text-right">
        <p className="text-[11px] text-blue-700 font-medium">$487 across 6 dining expenses</p>
        <p className="text-[10px] text-blue-500 mt-0.5">avg. $81 per meal · 5 people</p>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot size={9} className="text-blue-600" />
        </div>
        <span className="text-[11px] text-zinc-500">Instant · Always precise</span>
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

function AiCard({ icon: Icon, tag, title, description, accent, children, className }: AiCardProps) {
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

export function AiSection() {
  return (
    <section className="py-28 px-6 bg-zinc-50/60">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-full bg-white border border-zinc-200 shadow-sm text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">
            <Sparkles size={10} className="text-violet-500" />
            AI-powered
          </div>
          <h2
            className="font-heading font-bold tracking-[-0.03em] text-zinc-900 leading-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            Intelligent by design.
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            Owelio's AI layer works silently in the background — categorizing
            expenses, reading receipts, and synthesizing spending patterns into
            clear, actionable insights.
          </p>
        </div>

        {/* Bento grid — mirrors the features section layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
