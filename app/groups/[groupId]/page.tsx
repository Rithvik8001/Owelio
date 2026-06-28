import { notFound } from "next/navigation"
import { format } from "date-fns"
import { InboxIcon, UsersIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { GroupAvatar } from "@/components/app/group-avatar"
import {
  InviteMemberDialog,
  LeaveGroupButton,
  MemberActions,
  RevokeInvitationButton,
} from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getGroupDetail, getPendingInvitationsForCurrentUser } from "@/lib/groups"

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [detail, pendingForUser] = await Promise.all([
    getGroupDetail(groupId),
    getPendingInvitationsForCurrentUser(),
  ])

  if (!detail) {
    notFound()
  }

  const canManage =
    detail.currentMembership.role === "owner" ||
    detail.currentMembership.role === "admin"
  const isOwner = detail.currentMembership.role === "owner"
  const canArchive = isOwner && detail.activeMemberCount === 1

  return (
    <AppShell user={detail.currentUser} pendingInvites={pendingForUser.length}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <GroupAvatar name={detail.group.name} size="lg" />
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
                Group
              </p>
              <h1 className="truncate font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
                {detail.group.name}
              </h1>
              {detail.group.description ? (
                <p className="mt-1.5 max-w-2xl text-sm text-zinc-500">
                  {detail.group.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={detail.currentMembership.role} />
            {canManage ? <InviteMemberDialog groupId={detail.group.id} /> : null}
            <LeaveGroupButton
              groupId={detail.group.id}
              isOwner={isOwner}
              canArchive={canArchive}
            />
          </div>
        </div>

        {isOwner && !canArchive ? (
          <Card className="rounded-2xl border border-zinc-200/80 bg-white">
            <CardHeader>
              <CardTitle>Ownership required</CardTitle>
              <CardDescription>
                Transfer ownership before leaving this group.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard label="Members" value={detail.activeMemberCount} />
          <SummaryCard
            label="Pending invites"
            value={detail.pendingInvitations.length}
          />
          <SummaryCard
            label="Owner"
            value={`@${detail.group.owner.username}`}
            text
          />
        </div>

        <Card className="rounded-2xl border border-zinc-200/80 bg-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  Roles control who can manage the group.
                </CardDescription>
              </div>
              <Badge variant="secondary">
                <UsersIcon data-icon="inline-start" />
                {detail.activeMemberCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex min-w-52 items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>
                            {member.user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-zinc-900">
                            @{member.user.username}
                          </div>
                          <div className="truncate text-xs text-zinc-500">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={member.role} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "secondary" : "outline"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500">
                      {format(member.joinedAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <MemberActions
                        groupId={detail.group.id}
                        memberId={member.id}
                        memberRole={member.role}
                        memberName={`@${member.user.username}`}
                        currentUserRole={detail.currentMembership.role}
                        isCurrentUser={member.userId === detail.currentUser.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-zinc-200/80 bg-white">
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              Links expire after seven days and can be revoked by managers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detail.pendingInvitations.length ? (
              <div className="flex flex-col gap-3">
                {detail.pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-900">
                        {invitation.email}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Invited by @{invitation.invitedBy.username} · expires{" "}
                        {format(invitation.expiresAt, "MMM d")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={invitation.role} />
                      {canManage ? (
                        <RevokeInvitationButton
                          groupId={detail.group.id}
                          invitationId={invitation.id}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty className="border border-dashed border-zinc-200/80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle>No pending invitations</EmptyTitle>
                  <EmptyDescription>
                    Invite links you create will appear here until accepted or
                    revoked.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function SummaryCard({
  label,
  value,
  text,
}: {
  label: string
  value: number | string
  text?: boolean
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6">
      <p className="mb-1.5 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
        {label}
      </p>
      <p
        className={
          text
            ? "font-heading text-xl font-bold tracking-tight text-zinc-900 truncate"
            : "font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900"
        }
      >
        {value}
      </p>
    </div>
  )
}
