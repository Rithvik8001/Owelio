import {
  BellIcon,
  LockKeyholeIcon,
  MailIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { UsernameForm } from "@/components/app/settings-forms"
import { UserAvatar } from "@/components/app/user-avatar"
import { Badge } from "@/components/ui/badge"
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
          <p className="mb-1 text-xs font-medium text-zinc-400">Settings</p>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
            Account settings
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Manage your profile and account preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar username={data.user.username} />
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs font-medium text-zinc-400">
                    Profile
                  </p>
                  <h2 className="truncate font-heading text-xl font-semibold tracking-tight text-zinc-900">
                    @{data.user.username}
                  </h2>
                </div>
              </div>
              <Badge variant="secondary">
                <UserRoundIcon data-icon="inline-start" />
                Public profile
              </Badge>
            </div>
            <UsernameForm username={data.user.username} />
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
            <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-500">
              <MailIcon className="size-5" />
            </div>
            <p className="mb-1 text-xs font-medium text-zinc-400">Account</p>
            <h2 className="font-heading text-lg font-semibold text-zinc-900">
              Sign-in identity
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <ReadOnlyRow label="Email" value={data.user.email} />
              <ReadOnlyRow label="Account ID" value={data.user.id} mono />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Email changes are not supported. This keeps invitations and
              account ownership stable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FutureSettingsCard
            icon={LockKeyholeIcon}
            iconClass="bg-zinc-100 text-zinc-600"
            label="Security"
            title="Password changes"
            description="Password changes are not available yet. They may be added later without enabling email changes."
          />
          <FutureSettingsCard
            icon={BellIcon}
            iconClass="bg-amber-50 text-amber-500"
            label="Preferences"
            title="Notifications"
            description="Notification controls will live here when invitation and activity notifications are built."
          />
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
          <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
            <SettingsIcon className="size-5" />
          </div>
          <p className="mb-1 text-xs font-medium text-zinc-400">
            Future settings
          </p>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">
            More account controls will be added here
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Profile editing is the current production focus. Future controls
            should stay scoped to account preferences and avoid changing the
            email identity connected to existing invitations.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

function ReadOnlyRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p
        className={`mt-1 truncate text-sm font-medium text-zinc-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function FutureSettingsCard({
  icon: Icon,
  iconClass,
  label,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
  label: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
      <div
        className={`mb-4 flex size-10 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
          <h2 className="font-heading text-lg font-semibold text-zinc-900">
            {title}
          </h2>
        </div>
        <Badge variant="outline">Coming soon</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  )
}
