import { logout } from "@/app/actions/auth"
import { getUser } from "@/lib/session"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const user = await getUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
        <div className="mb-1 text-sm text-zinc-400">Signed in as</div>
        <div className="mb-1 font-heading text-2xl font-semibold text-zinc-900">
          @{user?.username}
        </div>
        <div className="mb-6 text-sm text-zinc-500">{user?.email}</div>
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}
