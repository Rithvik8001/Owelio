import Link from "next/link"
import { BellIcon, UsersIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { CreateGroupDialog } from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Groups</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">
              Manage shared spaces
            </h1>
          </div>
          <CreateGroupDialog />
        </div>

        {data.pendingInvites.length ? (
          <Card className="rounded-2xl border border-zinc-200/80 bg-white">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Invitations waiting</CardTitle>
                  <CardDescription>
                    Review groups you have been invited to join.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <BellIcon data-icon="inline-start" />
                  {data.pendingInvites.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/invitations">Open invitations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {data.groups.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.groups.map(({ group, membership, memberCount }) => (
              <Card
                key={group.id}
                className="rounded-2xl border border-zinc-200/80 bg-white"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{group.name}</CardTitle>
                      <CardDescription>
                        {memberCount} member{memberCount === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    <RoleBadge role={membership.role} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {group.description ? (
                    <p className="line-clamp-2 text-sm text-zinc-500">
                      {group.description}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-400">No description yet.</p>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/groups/${group.id}`}>Open group</Link>
                  </Button>
                </CardContent>
              </Card>
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
