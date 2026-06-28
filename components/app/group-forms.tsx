"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import {
  CheckIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SendIcon,
  UserMinusIcon,
  UserRoundCheckIcon,
} from "lucide-react"
import {
  acceptInvitation,
  createGroup,
  inviteMember,
  leaveGroup,
  removeMember,
  revokeInvitation,
  transferOwnership,
  updateMemberRole,
} from "@/app/actions/groups"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createGroup, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 hover:bg-zinc-700">
          <PlusIcon data-icon="inline-start" />
          New group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
          <DialogDescription>
            Start a shared space for trips, households, or projects.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action}>
          <FieldGroup>
            {state?.errors?.form ? (
              <Field data-invalid>
                <FieldError>{state.errors.form[0]}</FieldError>
              </Field>
            ) : null}
            <Field data-invalid={Boolean(state?.errors?.name)}>
              <FieldLabel htmlFor="group-name">Name</FieldLabel>
              <Input
                id="group-name"
                name="name"
                placeholder="Lisbon trip"
                aria-invalid={Boolean(state?.errors?.name)}
                required
              />
              <FieldError>
                {state?.errors?.name ? state.errors.name[0] : null}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(state?.errors?.description)}>
              <FieldLabel htmlFor="group-description">Description</FieldLabel>
              <Textarea
                id="group-description"
                name="description"
                placeholder="Optional notes for this group"
                aria-invalid={Boolean(state?.errors?.description)}
              />
              <FieldError>
                {state?.errors?.description
                  ? state.errors.description[0]
                  : null}
              </FieldError>
            </Field>
            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-700"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Create group
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function InviteMemberDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [state, action, pending] = useActionState(inviteMember, undefined)

  async function copyInvite() {
    if (!state?.inviteUrl) {
      return
    }
    await navigator.clipboard.writeText(state.inviteUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 hover:bg-zinc-700">
          <SendIcon data-icon="inline-start" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Create a secure one-time invitation link for this group.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="groupId" value={groupId} />
          <FieldGroup>
            {state?.errors?.form ? (
              <Field data-invalid>
                <FieldError>{state.errors.form[0]}</FieldError>
              </Field>
            ) : null}
            <Field data-invalid={Boolean(state?.errors?.email)}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="friend@example.com"
                aria-invalid={Boolean(state?.errors?.email)}
                required
              />
              <FieldError>
                {state?.errors?.email ? state.errors.email[0] : null}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(state?.errors?.role)}>
              <FieldLabel>Role</FieldLabel>
              <Select name="role" defaultValue="member">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                Admins can invite and manage members, but cannot transfer
                ownership.
              </FieldDescription>
            </Field>
            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-700"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Create invite
            </Button>
          </FieldGroup>
        </form>

        {state?.inviteUrl ? (
          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50 p-3">
            <div className="text-xs font-medium text-zinc-500">Invite link</div>
            <div className="break-all text-sm text-zinc-900">
              {state.inviteUrl}
            </div>
            <Button type="button" variant="outline" onClick={copyInvite}>
              {copied ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <CopyIcon data-icon="inline-start" />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInvitation, undefined)

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <FieldGroup>
        {state?.errors?.form ? (
          <Field data-invalid>
            <FieldError>{state.errors.form[0]}</FieldError>
          </Field>
        ) : null}
        {state?.message ? (
          <Field>
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 text-sm text-zinc-700">
              {state.message}
            </div>
          </Field>
        ) : null}
        <Button
          type="submit"
          className="bg-zinc-900 hover:bg-zinc-700"
          disabled={pending || Boolean(state?.message)}
        >
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Accept invitation
        </Button>
      </FieldGroup>
    </form>
  )
}

export function RevokeInvitationButton({
  groupId,
  invitationId,
}: {
  groupId: string
  invitationId: string
}) {
  return (
    <form action={revokeInvitation}>
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="invitationId" value={invitationId} />
      <Button type="submit" variant="ghost" size="sm">
        Revoke
      </Button>
    </form>
  )
}

export function LeaveGroupButton({
  groupId,
  isOwner,
  canArchive,
}: {
  groupId: string
  isOwner: boolean
  canArchive: boolean
}) {
  const blockedOwner = isOwner && !canArchive

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={blockedOwner}>
          Leave group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isOwner ? "Archive this group?" : "Leave this group?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isOwner
              ? "You are the only member, so leaving will archive the group."
              : "You will lose access, but your historical membership stays recorded."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={leaveGroup}>
            <input type="hidden" name="groupId" value={groupId} />
            <AlertDialogAction type="submit">
              {isOwner ? "Archive group" : "Leave group"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function MemberActions({
  groupId,
  memberId,
  memberRole,
  memberName,
  currentUserRole,
  isCurrentUser,
}: {
  groupId: string
  memberId: string
  memberRole: "owner" | "admin" | "member"
  memberName: string
  currentUserRole: "owner" | "admin" | "member"
  isCurrentUser: boolean
}) {
  const currentUserIsOwner = currentUserRole === "owner"
  const currentUserIsAdmin = currentUserRole === "admin"
  const canAct =
    !isCurrentUser &&
    memberRole !== "owner" &&
    (currentUserIsOwner || (currentUserIsAdmin && memberRole === "member"))

  if (!canAct) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Member actions">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {currentUserIsOwner ? (
            <DropdownMenuItem asChild>
              <form action={transferOwnership}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="targetMemberId" value={memberId} />
                <button type="submit" className="flex w-full items-center gap-2">
                  <UserRoundCheckIcon />
                  Transfer ownership
                </button>
              </form>
            </DropdownMenuItem>
          ) : null}

          {currentUserIsOwner && memberRole !== "admin" ? (
            <DropdownMenuItem asChild>
              <form action={updateMemberRole}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="memberId" value={memberId} />
                <input type="hidden" name="role" value="admin" />
                <button type="submit" className="flex w-full items-center gap-2">
                  Make admin
                </button>
              </form>
            </DropdownMenuItem>
          ) : null}

          {currentUserIsOwner && memberRole === "admin" ? (
            <DropdownMenuItem asChild>
              <form action={updateMemberRole}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="memberId" value={memberId} />
                <input type="hidden" name="role" value="member" />
                <button type="submit" className="flex w-full items-center gap-2">
                  Make member
                </button>
              </form>
            </DropdownMenuItem>
          ) : null}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => event.preventDefault()}
              >
                <UserMinusIcon />
                Remove member
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They will lose group access, but existing history remains
                  intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form action={removeMember}>
                  <input type="hidden" name="groupId" value={groupId} />
                  <input type="hidden" name="memberId" value={memberId} />
                  <AlertDialogAction type="submit">
                    Remove member
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
