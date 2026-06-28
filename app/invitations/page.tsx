import Link from "next/link"
import { format } from "date-fns"
import { BellIcon, InboxIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getPendingInvitationsForCurrentUser } from "@/lib/groups"
import { getUser } from "@/lib/session"

export default async function InvitationsPage() {
  const [user, invitations] = await Promise.all([
    getUser(),
    getPendingInvitationsForCurrentUser(),
  ])

  if (!user) {
    return null
  }

  return (
    <AppShell user={user} pendingInvites={invitations.length}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
            Invitations
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
            Groups waiting for you
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Accept an invite to join a group and start splitting expenses.
          </p>
        </div>

        {invitations.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {invitations.map((invitation) => (
              <Card
                key={invitation.id}
                className="rounded-2xl border border-zinc-200/80 bg-white"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">
                        {invitation.group.name}
                      </CardTitle>
                      <CardDescription>
                        Invited by @{invitation.invitedBy.username}
                      </CardDescription>
                    </div>
                    <RoleBadge role={invitation.role} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 text-sm">
                    <span className="text-zinc-500">Expires</span>
                    <span className="font-medium text-zinc-900">
                      {format(invitation.expiresAt, "MMM d, yyyy")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    <BellIcon data-icon="inline-start" />
                    Use your original invite link to accept
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Empty className="rounded-2xl border border-dashed border-zinc-200/80 bg-white">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No pending invitations</EmptyTitle>
              <EmptyDescription>
                New group invitations for {user.email} will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <div>
          <Button asChild variant="outline">
            <Link href="/groups">Back to groups</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
