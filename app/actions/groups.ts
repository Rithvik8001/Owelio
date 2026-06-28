"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import {
  groupInvitations,
  groupMembers,
  groups,
  profiles,
} from "@/db/schema"
import { getDb } from "@/lib/db"
import {
  createInvitationToken,
  hashInvitationToken,
} from "@/lib/invitation-tokens"
import { getUser } from "@/lib/session"
import {
  getActiveMemberCount,
  getInvitationByTokenHash,
  requireActiveMembership,
  requireGroupManager,
  requireGroupOwner,
} from "@/lib/groups"
import {
  AcceptInvitationSchema,
  CreateGroupSchema,
  GroupIdSchema,
  InvitationIdSchema,
  InviteMemberSchema,
  MemberIdSchema,
  TransferOwnershipSchema,
  UpdateMemberRoleSchema,
  type GroupFormState,
} from "@/lib/validations/groups"

async function getOrigin() {
  const headerStore = await headers()
  return (
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  )
}

function revalidateGroupPaths(groupId?: string) {
  revalidatePath("/dashboard")
  revalidatePath("/groups")
  revalidatePath("/invitations")
  if (groupId) {
    revalidatePath(`/groups/${groupId}`)
  }
}

function formError(message: string): GroupFormState {
  return { errors: { form: [message] } }
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  )
}

export async function createGroup(
  _state: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const user = await getUser()
  if (!user) {
    return formError("You must be signed in.")
  }

  const validated = CreateGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const db = getDb()
  const { name, description } = validated.data

  try {
    await db.transaction(async (tx) => {
      const [group] = await tx
        .insert(groups)
        .values({
          name,
          description: description || null,
          ownerId: user.id,
          createdById: user.id,
        })
        .returning({ id: groups.id })

      await tx.insert(groupMembers).values({
        groupId: group.id,
        userId: user.id,
        role: "owner",
        status: "active",
      })
    })
  } catch {
    return formError("Failed to create group.")
  }

  revalidateGroupPaths()
  return { message: "Group created." }
}

export async function inviteMember(
  _state: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const validated = InviteMemberSchema.safeParse({
    groupId: formData.get("groupId"),
    email: formData.get("email"),
    role: formData.get("role"),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { groupId, email, role } = validated.data
  const { user, membership } = await requireGroupManager(groupId)
  const db = getDb()

  if (membership.role === "admin" && role === "admin") {
    return formError("Admins can only invite members.")
  }

  const existingProfile = await db.query.profiles.findFirst({
    where: eq(profiles.email, email),
    columns: { id: true },
  })
  if (existingProfile) {
    const existingMember = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, existingProfile.id),
        eq(groupMembers.status, "active")
      ),
    })
    if (existingMember) {
      return formError("That person is already a member of this group.")
    }
  }

  const token = createInvitationToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  try {
    await db.insert(groupInvitations).values({
      groupId,
      email,
      role,
      tokenHash: hashInvitationToken(token),
      invitedById: user.id,
      expiresAt,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return formError("There is already a pending invitation for this email.")
    }
    return formError("Failed to create invitation.")
  }

  revalidateGroupPaths(groupId)
  return {
    message: "Invitation created.",
    inviteUrl: `${await getOrigin()}/invitations/${token}`,
  }
}

export async function acceptInvitation(
  _state: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const user = await getUser()
  if (!user) {
    return formError("You must be signed in.")
  }

  const validated = AcceptInvitationSchema.safeParse({
    token: formData.get("token"),
  })
  if (!validated.success) {
    return { errors: { form: ["Invalid invitation link."] } }
  }

  const hash = hashInvitationToken(validated.data.token)
  const invitation = await getInvitationByTokenHash(hash)
  if (!invitation) {
    return formError("Invitation not found.")
  }

  if (invitation.email !== user.email) {
    return formError("This invitation was sent to a different email address.")
  }

  if (invitation.status !== "pending") {
    return formError("This invitation is no longer pending.")
  }

  const db = getDb()
  if (invitation.expiresAt.getTime() <= Date.now()) {
    await db
      .update(groupInvitations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(groupInvitations.id, invitation.id))
    revalidateGroupPaths(invitation.groupId)
    return formError("This invitation has expired.")
  }

  if (invitation.group.archivedAt) {
    return formError("This group is no longer active.")
  }

  try {
    await db.transaction(async (tx) => {
      const existing = await tx.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, invitation.groupId),
          eq(groupMembers.userId, user.id)
        ),
      })

      if (existing) {
        await tx
          .update(groupMembers)
          .set({
            role: existing.role === "owner" ? "owner" : invitation.role,
            status: "active",
            leftAt: null,
            removedAt: null,
            removedById: null,
            updatedAt: new Date(),
          })
          .where(eq(groupMembers.id, existing.id))
      } else {
        await tx.insert(groupMembers).values({
          groupId: invitation.groupId,
          userId: user.id,
          role: invitation.role,
          status: "active",
        })
      }

      await tx
        .update(groupInvitations)
        .set({
          status: "accepted",
          acceptedById: user.id,
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(groupInvitations.id, invitation.id))
    })
  } catch {
    return formError("Failed to accept invitation.")
  }

  revalidateGroupPaths(invitation.groupId)
  return { message: "Invitation accepted." }
}

export async function revokeInvitation(formData: FormData) {
  const validated = InvitationIdSchema.safeParse({
    groupId: formData.get("groupId"),
    invitationId: formData.get("invitationId"),
  })
  if (!validated.success) {
    return
  }

  const { groupId, invitationId } = validated.data
  await requireGroupManager(groupId)

  const db = getDb()
  await db
    .update(groupInvitations)
    .set({ status: "revoked", revokedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(groupInvitations.id, invitationId),
        eq(groupInvitations.groupId, groupId),
        eq(groupInvitations.status, "pending")
      )
    )

  revalidateGroupPaths(groupId)
}

export async function removeMember(formData: FormData) {
  const validated = MemberIdSchema.safeParse({
    groupId: formData.get("groupId"),
    memberId: formData.get("memberId"),
  })
  if (!validated.success) {
    return
  }

  const { groupId, memberId } = validated.data
  const { user, membership } = await requireGroupManager(groupId)
  const db = getDb()

  const target = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.id, memberId), eq(groupMembers.groupId, groupId)),
  })
  if (!target || target.status !== "active" || target.role === "owner") {
    return
  }
  if (target.userId === user.id) {
    return
  }
  if (membership.role === "admin" && target.role !== "member") {
    return
  }

  await db
    .update(groupMembers)
    .set({
      status: "inactive",
      removedAt: new Date(),
      removedById: user.id,
      updatedAt: new Date(),
    })
    .where(eq(groupMembers.id, target.id))

  revalidateGroupPaths(groupId)
}

export async function leaveGroup(formData: FormData) {
  const validated = GroupIdSchema.safeParse({
    groupId: formData.get("groupId"),
  })
  if (!validated.success) {
    return
  }

  const { groupId } = validated.data
  const { membership } = await requireActiveMembership(groupId)
  const db = getDb()

  if (membership.role === "owner") {
    const activeMemberCount = await getActiveMemberCount(groupId)
    if (activeMemberCount > 1) {
      return
    }

    await db.transaction(async (tx) => {
      await tx
        .update(groups)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(eq(groups.id, groupId))
      await tx
        .update(groupMembers)
        .set({ status: "inactive", leftAt: new Date(), updatedAt: new Date() })
        .where(eq(groupMembers.id, membership.id))
    })
  } else {
    await db
      .update(groupMembers)
      .set({ status: "inactive", leftAt: new Date(), updatedAt: new Date() })
      .where(eq(groupMembers.id, membership.id))
  }

  revalidateGroupPaths(groupId)
}

export async function transferOwnership(formData: FormData) {
  const validated = TransferOwnershipSchema.safeParse({
    groupId: formData.get("groupId"),
    targetMemberId: formData.get("targetMemberId"),
  })
  if (!validated.success) {
    return
  }

  const { groupId, targetMemberId } = validated.data
  const { user, membership } = await requireGroupOwner(groupId)
  const db = getDb()

  const target = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.id, targetMemberId),
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.status, "active")
    ),
  })
  if (!target || target.userId === user.id) {
    return
  }

  await db.transaction(async (tx) => {
    await tx
      .update(groupMembers)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(groupMembers.id, membership.id))
    await tx
      .update(groupMembers)
      .set({ role: "owner", updatedAt: new Date() })
      .where(eq(groupMembers.id, target.id))
    await tx
      .update(groups)
      .set({ ownerId: target.userId, updatedAt: new Date() })
      .where(eq(groups.id, groupId))
  })

  revalidateGroupPaths(groupId)
}

export async function updateMemberRole(formData: FormData) {
  const validated = UpdateMemberRoleSchema.safeParse({
    groupId: formData.get("groupId"),
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  })
  if (!validated.success) {
    return
  }

  const { groupId, memberId, role } = validated.data
  const { user, membership } = await requireGroupManager(groupId)
  const db = getDb()

  const target = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.id, memberId),
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.status, "active")
    ),
  })
  if (!target || target.role === "owner") {
    return
  }
  if (target.userId === user.id && membership.role === "owner") {
    return
  }
  if (membership.role === "admin" && target.role !== "member") {
    return
  }

  await db
    .update(groupMembers)
    .set({ role, updatedAt: new Date() })
    .where(eq(groupMembers.id, target.id))

  revalidateGroupPaths(groupId)
}
