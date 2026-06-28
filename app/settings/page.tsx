import { SettingsIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getDashboardData } from "@/lib/groups"

export default async function SettingsPage() {
  const data = await getDashboardData()

  if (!data) {
    return null
  }

  return (
    <AppShell user={data.user} pendingInvites={data.totals.pendingInvites}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm text-zinc-500">Settings</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">
            Account settings
          </h1>
        </div>

        <Card className="rounded-2xl border border-zinc-200/80 bg-white">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <SettingsIcon />
            </div>
            <CardTitle>Settings are coming next</CardTitle>
            <CardDescription>
              Groups are the current production focus. Account preferences will
              live here.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  )
}
