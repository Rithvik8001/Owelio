import Link from "next/link"
import { format } from "date-fns"
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { AcceptInvitationForm } from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getInvitationByTokenHash,
  getPendingInvitationsForCurrentUser,
  isInvitationExpired,
} from "@/lib/groups"
import { hashInvitationToken } from "@/lib/invitation-tokens"
import { getUser } from "@/lib/session"

export default async function InvitationTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [user, pendingInvites, invitation] = await Promise.all([
    getUser(),
    getPendingInvitationsForCurrentUser(),
    getInvitationByTokenHash(hashInvitationToken(token)),
  ])

  if (!user) {
    return null
  }

  const invalid =
    !invitation ||
    invitation.status !== "pending" ||
    isInvitationExpired(invitation.expiresAt) ||
    invitation.group.archivedAt !== null ||
    invitation.email !== user.email

  return (
    <AppShell user={user} pendingInvites={pendingInvites.length}>
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-xl items-center">
        <Card className="w-full rounded-2xl border border-zinc-200/80 bg-white">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              {invalid ? <AlertCircleIcon /> : <CheckCircle2Icon />}
            </div>
            <CardTitle>
              {invalid ? "Invitation unavailable" : "Accept invitation"}
            </CardTitle>
            <CardDescription>
              {invalid
                ? "This invite may be expired, revoked, already used, or meant for another account."
                : `You have been invited to join ${invitation.group.name}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {invitation ? (
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-heading text-lg font-semibold text-zinc-900">
                      {invitation.group.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Invited by @{invitation.invitedBy.username}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Expires {format(invitation.expiresAt, "MMM d, yyyy")}
                    </div>
                  </div>
                  <RoleBadge role={invitation.role} />
                </div>
              </div>
            ) : null}

            {invalid ? (
              <Button asChild variant="outline">
                <Link href="/invitations">View invitations</Link>
              </Button>
            ) : (
              <AcceptInvitationForm token={token} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
