import Link from "next/link"
import { BellIcon, UsersIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { GroupAvatar } from "@/components/app/group-avatar"
import { CreateGroupDialog } from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getGroupsForCurrentUser } from "@/lib/groups"

export default async function GroupsPage() {
  const data = await getGroupsForCurrentUser()

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
              Groups
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
              Shared spaces
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Create a group for a trip, household, or project.
            </p>
          </div>
          <CreateGroupDialog />
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
                  {data.pendingInvites.length} invitation
                  {data.pendingInvites.length === 1 ? "" : "s"} waiting
                </p>
                <p className="text-sm text-zinc-500">
                  Review groups you have been invited to join.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-zinc-900 hover:bg-zinc-700">
              <Link href="/invitations">Open invitations</Link>
            </Button>
          </div>
        ) : null}

        {/* Groups grid */}
        {data.groups.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.groups.map(({ group, membership, memberCount }) => (
              <div
                key={group.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start gap-3">
                  <GroupAvatar name={group.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-[0.95rem] font-semibold leading-snug text-zinc-900 truncate">
                        {group.name}
                      </p>
                      <RoleBadge role={membership.role} />
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {memberCount} member{memberCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {group.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                    {group.description}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">No description yet.</p>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/groups/${group.id}`}>Open group</Link>
                </Button>
              </div>
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
                Create a group for a trip, household, or project.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateGroupDialog />
            </EmptyContent>
          </Empty>
        )}
      </div>
    </AppShell>
  )
}
