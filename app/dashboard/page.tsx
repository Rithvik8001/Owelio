import Link from "next/link"
import { BellIcon, FolderPlusIcon, UsersIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDashboardData } from "@/lib/groups"

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return null
  }

  return (
    <AppShell user={data.user} pendingInvites={data.totals.pendingInvites}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Welcome back</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">
              @{data.user.username}
            </h1>
          </div>
          <CreateGroupDialog />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Active groups"
            value={data.totals.groups}
            description="Groups you can access"
            icon={UsersIcon}
          />
          <MetricCard
            title="Memberships"
            value={data.totals.memberships}
            description="Active group roles"
            icon={FolderPlusIcon}
          />
          <MetricCard
            title="Invitations"
            value={data.totals.pendingInvites}
            description="Waiting for your response"
            icon={BellIcon}
          />
        </div>

        {data.pendingInvites.length ? (
          <Card className="rounded-2xl border border-zinc-200/80 bg-white">
            <CardHeader>
              <CardTitle>Pending invitations</CardTitle>
              <CardDescription>
                You have invitations waiting for this account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/invitations">Review invitations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold text-zinc-900">
                Recent groups
              </h2>
              <p className="text-sm text-zinc-500">
                Shared spaces where expenses will live.
              </p>
            </div>
            {data.groups.length ? (
              <Button asChild variant="outline">
                <Link href="/groups">View all</Link>
              </Button>
            ) : null}
          </div>

          {data.groups.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.groups.slice(0, 6).map(({ group, membership, memberCount }) => (
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
                  <CardContent>
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
    <Card className="rounded-2xl border border-zinc-200/80 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-3xl">{value}</CardTitle>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <Icon />
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-zinc-500">{description}</CardContent>
    </Card>
  )
}
