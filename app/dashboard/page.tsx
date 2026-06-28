import Link from "next/link"
import { BellIcon, FolderPlusIcon, UsersIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { GroupAvatar } from "@/components/app/group-avatar"
import { CreateGroupDialog } from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { getDashboardData } from "@/lib/groups"

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return null
  }

  return (
    <AppShell user={data.user} pendingInvites={data.totals.pendingInvites}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
              Overview
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
              Welcome back, @{data.user.username}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Here&apos;s what&apos;s happening across your groups.
            </p>
          </div>
          <CreateGroupDialog />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Active groups"
            value={data.totals.groups}
            description="Groups you belong to or manage"
            icon={UsersIcon}
          />
          <MetricCard
            title="Memberships"
            value={data.totals.memberships}
            description="Active roles across all groups"
            icon={FolderPlusIcon}
          />
          <MetricCard
            title="Invitations"
            value={data.totals.pendingInvites}
            description="Waiting for your response"
            icon={BellIcon}
          />
        </div>

        {/* Pending invitations banner */}
        {data.pendingInvites.length ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                <BellIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {data.pendingInvites.length} pending invitation
                  {data.pendingInvites.length === 1 ? "" : "s"}
                </p>
                <p className="text-sm text-zinc-500">
                  You have group invitations waiting for your response.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-zinc-900 hover:bg-zinc-700">
              <Link href="/invitations">Review invitations</Link>
            </Button>
          </div>
        ) : null}

        {/* Recent groups */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
                Groups
              </p>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-zinc-900">
                Recent groups
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Shared spaces where expenses will live.
              </p>
            </div>
            {data.groups.length ? (
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/groups">View all</Link>
              </Button>
            ) : null}
          </div>

          {data.groups.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.groups.slice(0, 6).map(({ group, membership, memberCount }) => (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  description={group.description ?? null}
                  memberCount={memberCount}
                  role={membership.role}
                />
              ))}
            </div>
          ) : (
            <Empty className="rounded-2xl border border-dashed border-zinc-200/80 bg-white">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>No groups yet</EmptyTitle>
                <EmptyDescription>
                  Create your first group to start tracking shared expenses.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <CreateGroupDialog />
              </EmptyContent>
            </Empty>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: number
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
            {title}
          </p>
          <p className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
            {value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  )
}

function GroupCard({
  id,
  name,
  description,
  memberCount,
  role,
}: {
  id: string
  name: string
  description: string | null
  memberCount: number
  role: "owner" | "admin" | "member"
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex items-start gap-3">
        <GroupAvatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-heading text-[0.95rem] font-semibold leading-snug text-zinc-900 truncate">
              {name}
            </p>
            <RoleBadge role={role} />
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      {description ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : (
        <p className="text-sm text-zinc-400">No description yet.</p>
      )}
      <Button asChild variant="outline" className="w-full">
        <Link href={`/groups/${id}`}>Open group</Link>
      </Button>
    </div>
  )
}
