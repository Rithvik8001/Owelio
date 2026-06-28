import "server-only"

import { and, count, desc, eq, gt, inArray, isNull } from "drizzle-orm"
import {
  groupInvitations,
  groupMembers,
  groups,
  groupRoleEnum,
} from "@/db/schema"
import { getDb } from "@/lib/db"
import { getUser } from "@/lib/session"

export type GroupRole = (typeof groupRoleEnum.enumValues)[number]
export type ActiveMembership = typeof groupMembers.$inferSelect

export function canManageMembers(role: GroupRole) {
  return role === "owner" || role === "admin"
}

export function canTransferOwnership(role: GroupRole) {
  return role === "owner"
}

export async function getActiveMembership(groupId: string, userId: string) {
  const db = getDb()

  return db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId),
      eq(groupMembers.status, "active")
    ),
  })
}

export async function requireActiveMembership(groupId: string) {
  const user = await getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveMembership(groupId, user.id)
  if (!membership) {
    throw new Error("You do not have access to this group.")
  }

  return { user, membership }
}

export async function requireGroupManager(groupId: string) {
  const result = await requireActiveMembership(groupId)
  if (!canManageMembers(result.membership.role)) {
    throw new Error("You do not have permission to manage this group.")
  }

  return result
}

export async function requireGroupOwner(groupId: string) {
  const result = await requireActiveMembership(groupId)
  if (!canTransferOwnership(result.membership.role)) {
    throw new Error("Only the owner can do this.")
  }

  return result
}

export async function getActiveMemberCount(groupId: string) {
  const db = getDb()

  const [result] = await db
    .select({ value: count() })
    .from(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.status, "active"))
    )

  return result?.value ?? 0
}

export async function getDashboardData() {
  const user = await getUser()
  if (!user) {
    return null
  }

  const db = getDb()
  const [memberships, pendingInvites] = await Promise.all([
    db.query.groupMembers.findMany({
      where: and(
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      ),
      with: { group: true },
      orderBy: [desc(groupMembers.joinedAt)],
    }),
    db.query.groupInvitations.findMany({
      where: and(
        eq(groupInvitations.email, user.email),
        eq(groupInvitations.status, "pending"),
        gt(groupInvitations.expiresAt, new Date())
      ),
      with: { group: true, invitedBy: true },
      orderBy: [desc(groupInvitations.createdAt)],
    }),
  ])

  const activeMemberships = memberships.filter((item) => !item.group.archivedAt)
  const groupsWithCounts = await Promise.all(
    activeMemberships.map(async (membership) => ({
      membership,
      group: membership.group,
      memberCount: await getActiveMemberCount(membership.groupId),
    }))
  )

  return {
    user,
    groups: groupsWithCounts,
    pendingInvites,
    totals: {
      groups: groupsWithCounts.length,
      memberships: activeMemberships.length,
      pendingInvites: pendingInvites.length,
    },
  }
}

export async function getGroupsForCurrentUser() {
  const dashboard = await getDashboardData()
  return dashboard
}

export async function getPendingInvitationsForCurrentUser() {
  const user = await getUser()
  if (!user) {
    return []
  }

  const db = getDb()
  return db.query.groupInvitations.findMany({
    where: and(
      eq(groupInvitations.email, user.email),
      eq(groupInvitations.status, "pending"),
      gt(groupInvitations.expiresAt, new Date())
    ),
    with: { group: true, invitedBy: true },
    orderBy: [desc(groupInvitations.createdAt)],
  })
}

export async function getGroupDetail(groupId: string) {
  const { user, membership } = await requireActiveMembership(groupId)
  const db = getDb()

  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), isNull(groups.archivedAt)),
    with: { owner: true, createdBy: true },
  })
  if (!group) {
    return null
  }

  const members = await db.query.groupMembers.findMany({
    where: eq(groupMembers.groupId, groupId),
    with: { user: true, removedBy: true },
    orderBy: [desc(groupMembers.status), desc(groupMembers.joinedAt)],
  })

  const pendingInvitations = await db.query.groupInvitations.findMany({
    where: and(
      eq(groupInvitations.groupId, groupId),
      eq(groupInvitations.status, "pending")
    ),
    with: { invitedBy: true },
    orderBy: [desc(groupInvitations.createdAt)],
  })

  return {
    group,
    currentUser: user,
    currentMembership: membership,
    members,
    pendingInvitations,
    activeMemberCount: members.filter((member) => member.status === "active")
      .length,
  }
}

export async function getInvitationByTokenHash(tokenHash: string) {
  const db = getDb()

  return db.query.groupInvitations.findFirst({
    where: eq(groupInvitations.tokenHash, tokenHash),
    with: { group: true, invitedBy: true },
  })
}

export function isInvitationExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now()
}

export async function getActiveMembershipsByIds(memberIds: string[]) {
  if (!memberIds.length) {
    return []
  }

  const db = getDb()
  return db.query.groupMembers.findMany({
    where: and(
      inArray(groupMembers.id, memberIds),
      eq(groupMembers.status, "active")
    ),
  })
}
