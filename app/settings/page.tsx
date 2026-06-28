import { SettingsIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { getDashboardData } from "@/lib/groups"

export default async function SettingsPage() {
  const data = await getDashboardData()

  if (!data) {
    return null
  }

  return (
    <AppShell user={data.user} pendingInvites={data.totals.pendingInvites}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
            Settings
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
            Account settings
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Manage your profile, preferences, and account.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6">
          <div className="mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <SettingsIcon className="size-[18px]" />
          </div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
            Coming soon
          </p>
          <h3 className="mb-2 font-heading text-[1.05rem] font-semibold leading-snug text-zinc-900">
            Settings are coming next
          </h3>
          <p className="text-sm leading-relaxed text-zinc-500">
            Groups are the current production focus. Account preferences, profile
            editing, and notification controls will live here.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
