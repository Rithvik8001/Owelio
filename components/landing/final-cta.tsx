import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="bg-white px-6 py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="mb-5 font-heading leading-[1.08] font-bold tracking-[-0.035em] text-zinc-900"
          style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
        >
          Ready to stop guessing?
        </h2>
        <p className="mx-auto mb-10 max-w-md text-[1.05rem] leading-relaxed text-zinc-500">
          Join the waitlist. Owelio is launching soon — and early users get
          priority access and lifetime perks.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-auto w-full rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 sm:w-auto"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Get early access <ArrowRight size={14} />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="h-auto w-full rounded-full px-7 py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 sm:w-auto"
          >
            <Link href="/login">Already have an account?</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
