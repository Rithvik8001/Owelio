import "server-only"

import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm"
import { groupMembers, groups, recurringBills } from "@/db/schema"
import { getDb } from "@/lib/db"
import { getGroupsForCurrentUser, requireActiveMembership } from "@/lib/groups"
import { getUser } from "@/lib/session"
import type { recurringBillFrequencies } from "@/lib/validations/recurring-bills"

export type RecurringBillFrequency = (typeof recurringBillFrequencies)[number]

export type RecurringBillWithRelations = NonNullable<
  Awaited<ReturnType<typeof getGroupRecurringBillData>>
>["recurringBills"][number]

export function startOfLocalDayNoon(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function addMonthsClamped(date: Date, months: number) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const targetMonthIndex = month + months
  const targetYear = year + Math.floor(targetMonthIndex / 12)
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12
  const targetDay = Math.min(day, daysInMonth(targetYear, normalizedMonth))

  return new Date(targetYear, normalizedMonth, targetDay, 12)
}

export function advanceRecurringDate(
  date: Date,
  frequency: RecurringBillFrequency
) {
  if (frequency === "weekly") {
    const next = startOfLocalDayNoon(date)
    next.setDate(next.getDate() + 7)
    return next
  }

  if (frequency === "monthly") {
    return addMonthsClamped(date, 1)
  }

  return addMonthsClamped(date, 12)
}

export function isRecurringBillDue(
  bill: Pick<typeof recurringBills.$inferSelect, "nextDueDate" | "pausedAt">
) {
  return (
    !bill.pausedAt &&
    bill.nextDueDate.getTime() <= startOfLocalDayNoon().getTime()
  )
}

export function frequencyLabel(frequency: RecurringBillFrequency) {
  if (frequency === "weekly") return "Weekly"
  if (frequency === "monthly") return "Monthly"
  return "Yearly"
}

export async function getGroupRecurringBillData(groupId: string) {
  const { user, membership } = await requireActiveMembership(groupId)
  const db = getDb()

  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), isNull(groups.archivedAt)),
  })
  if (!group) {
    return null
  }

  const groupRecurringBills = await db.query.recurringBills.findMany({
    where: and(
      eq(recurringBills.groupId, groupId),
      isNull(recurringBills.archivedAt)
    ),
    with: {
      paidByMember: { with: { user: true } },
      createdBy: true,
      splits: { with: { member: { with: { user: true } } } },
    },
    orderBy: [asc(recurringBills.nextDueDate), desc(recurringBills.createdAt)],
  })

  const dueBills = groupRecurringBills.filter(isRecurringBillDue)
  const upcomingBills = groupRecurringBills.filter(
    (bill) => !bill.pausedAt && !isRecurringBillDue(bill)
  )
  const pausedBills = groupRecurringBills.filter((bill) => bill.pausedAt)

  return {
    user,
    membership,
    group,
    recurringBills: groupRecurringBills,
    dueBills,
    upcomingBills,
    pausedBills,
  }
}

export async function getDashboardRecurringBillData() {
  const user = await getUser()
  if (!user) {
    return null
  }

  const dashboard = await getGroupsForCurrentUser()
  if (!dashboard) {
    return null
  }

  const groupIds = dashboard.groups.map(({ group }) => group.id)
  if (!groupIds.length) {
    return {
      dueCount: 0,
      groupSummaries: [],
    }
  }

  const db = getDb()
  const activeRecurringBills = await db.query.recurringBills.findMany({
    where: and(
      inArray(recurringBills.groupId, groupIds),
      isNull(recurringBills.archivedAt),
      isNull(recurringBills.pausedAt)
    ),
    orderBy: [asc(recurringBills.nextDueDate), desc(recurringBills.createdAt)],
  })

  const groupSummaries = dashboard.groups.map(({ group }) => {
    const groupBills = activeRecurringBills.filter(
      (bill) => bill.groupId === group.id
    )
    const dueBills = groupBills.filter(isRecurringBillDue)

    return {
      group,
      dueCount: dueBills.length,
      nextBill: groupBills[0] ?? null,
    }
  })

  return {
    dueCount: groupSummaries.reduce((sum, group) => sum + group.dueCount, 0),
    groupSummaries,
  }
}

export async function getActiveRecurringBillMembers(
  groupId: string,
  memberIds: string[]
) {
  if (!memberIds.length) {
    return []
  }

  const db = getDb()
  return db.query.groupMembers.findMany({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.status, "active"),
      inArray(groupMembers.id, memberIds)
    ),
  })
}
