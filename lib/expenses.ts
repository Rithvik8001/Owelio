import "server-only"

import { and, desc, eq, inArray, isNull } from "drizzle-orm"
import {
  expenseSplits,
  expenses,
  groupMembers,
  groups,
  settlements,
} from "@/db/schema"
import { getDb } from "@/lib/db"
import { getUser } from "@/lib/session"
import { getGroupsForCurrentUser, requireActiveMembership } from "@/lib/groups"
import type {
  expenseCategories,
  expenseSplitMethods,
} from "@/lib/validations/expenses"

export type ExpenseCategory = (typeof expenseCategories)[number]
export type ExpenseSplitMethod = (typeof expenseSplitMethods)[number]

export type SplitInput = {
  memberId: string
  value?: string
}

export type LedgerMember = typeof groupMembers.$inferSelect & {
  user: { id: string; username: string; email: string }
}

export type BalanceRow = {
  member: LedgerMember
  paidCents: number
  owedCents: number
  settlementPaidCents: number
  settlementReceivedCents: number
  netCents: number
}

export type SettlementSuggestion = {
  fromMemberId: string
  toMemberId: string
  amountCents: number
}

export function parseMoneyToCents(input: string) {
  const normalized = input.trim().replace(/^\$/, "")
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter a valid dollar amount.")
  }

  const [dollars, cents = ""] = normalized.split(".")
  const amount = Number(`${dollars}${cents.padEnd(2, "0")}`)
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero.")
  }

  return amount
}

export function formatMoney(cents: number, currencyCode = "USD") {
  const sign = cents < 0 ? "-" : ""
  const absolute = Math.abs(cents)
  const dollars = Math.floor(absolute / 100).toLocaleString("en-US")
  const remainder = String(absolute % 100).padStart(2, "0")
  const symbol = currencyCode === "USD" ? "$" : `${currencyCode} `
  return `${sign}${symbol}${dollars}.${remainder}`
}

export function parseDateInput(input: string) {
  const date = new Date(`${input}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid date.")
  }
  return date
}

export function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function categoryLabel(category: ExpenseCategory | string) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function parsePercentageBasisPoints(input: string) {
  const normalized = input.trim().replace(/%$/, "")
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter valid percentages.")
  }

  const [whole, fraction = ""] = normalized.split(".")
  const value = Number(`${whole}${fraction.padEnd(2, "0")}`)
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Enter valid percentages.")
  }
  return value
}

function allocatePercentages(
  amountCents: number,
  entries: { memberId: string; basisPoints: number }[]
) {
  const allocations = entries.map((entry) => {
    const product = amountCents * entry.basisPoints
    return {
      ...entry,
      owedCents: Math.floor(product / 10000),
      remainder: product % 10000,
    }
  })
  let remainderCents =
    amountCents - allocations.reduce((sum, entry) => sum + entry.owedCents, 0)

  for (const entry of [...allocations].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder
    return a.memberId.localeCompare(b.memberId)
  })) {
    if (remainderCents <= 0) break
    entry.owedCents += 1
    remainderCents -= 1
  }

  return allocations.map(({ memberId, basisPoints, owedCents }) => ({
    groupMemberId: memberId,
    owedCents,
    percentageBasisPoints: basisPoints,
  }))
}

export function buildSplitRows({
  amountCents,
  splitMethod,
  splits,
}: {
  amountCents: number
  splitMethod: ExpenseSplitMethod
  splits: SplitInput[]
}) {
  const selected = [...splits].sort((a, b) =>
    a.memberId.localeCompare(b.memberId)
  )
  if (!selected.length) {
    throw new Error("Choose at least one participant.")
  }

  if (splitMethod === "equal") {
    const base = Math.floor(amountCents / selected.length)
    let remainder = amountCents % selected.length
    return selected.map((split) => {
      const owedCents = base + (remainder > 0 ? 1 : 0)
      remainder -= 1
      return {
        groupMemberId: split.memberId,
        owedCents,
        percentageBasisPoints: null,
      }
    })
  }

  if (splitMethod === "exact") {
    const rows = selected.map((split) => ({
      groupMemberId: split.memberId,
      owedCents: parseMoneyToCents(split.value ?? ""),
      percentageBasisPoints: null,
    }))
    const total = rows.reduce((sum, row) => sum + row.owedCents, 0)
    if (total !== amountCents) {
      throw new Error("Exact splits must add up to the expense amount.")
    }
    return rows
  }

  const percentages = selected.map((split) => ({
    memberId: split.memberId,
    basisPoints: parsePercentageBasisPoints(split.value ?? ""),
  }))
  const totalBasisPoints = percentages.reduce(
    (sum, split) => sum + split.basisPoints,
    0
  )
  if (totalBasisPoints !== 10000) {
    throw new Error("Percentages must add up to 100%.")
  }

  return allocatePercentages(amountCents, percentages)
}

export function calculateBalances({
  members,
  activeExpenses,
  activeSettlements,
}: {
  members: LedgerMember[]
  activeExpenses: Array<
    typeof expenses.$inferSelect & {
      splits: (typeof expenseSplits.$inferSelect)[]
    }
  >
  activeSettlements: (typeof settlements.$inferSelect)[]
}) {
  const balances = new Map<string, BalanceRow>()
  for (const member of members) {
    balances.set(member.id, {
      member,
      paidCents: 0,
      owedCents: 0,
      settlementPaidCents: 0,
      settlementReceivedCents: 0,
      netCents: 0,
    })
  }

  for (const expense of activeExpenses) {
    const payer = balances.get(expense.paidByMemberId)
    if (payer) payer.paidCents += expense.amountCents
    for (const split of expense.splits) {
      const row = balances.get(split.groupMemberId)
      if (row) row.owedCents += split.owedCents
    }
  }

  for (const settlement of activeSettlements) {
    const from = balances.get(settlement.fromMemberId)
    const to = balances.get(settlement.toMemberId)
    if (from) from.settlementPaidCents += settlement.amountCents
    if (to) to.settlementReceivedCents += settlement.amountCents
  }

  const rows = [...balances.values()]
  for (const row of rows) {
    row.netCents =
      row.paidCents -
      row.owedCents +
      row.settlementPaidCents -
      row.settlementReceivedCents
  }
  return rows
}

export function suggestSettlements(balanceRows: BalanceRow[]) {
  const debtors = balanceRows
    .filter((row) => row.netCents < 0)
    .map((row) => ({ memberId: row.member.id, amount: Math.abs(row.netCents) }))
    .sort((a, b) => b.amount - a.amount || a.memberId.localeCompare(b.memberId))
  const creditors = balanceRows
    .filter((row) => row.netCents > 0)
    .map((row) => ({ memberId: row.member.id, amount: row.netCents }))
    .sort((a, b) => b.amount - a.amount || a.memberId.localeCompare(b.memberId))

  const suggestions: SettlementSuggestion[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    const amountCents = Math.min(debtor.amount, creditor.amount)

    if (amountCents > 0) {
      suggestions.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amountCents,
      })
    }

    debtor.amount -= amountCents
    creditor.amount -= amountCents
    if (debtor.amount === 0) debtorIndex += 1
    if (creditor.amount === 0) creditorIndex += 1
  }

  return suggestions
}

export function canMutateLedgerRecord({
  currentUserId,
  currentRole,
  createdById,
}: {
  currentUserId: string
  currentRole: "owner" | "admin" | "member"
  createdById: string
}) {
  return (
    createdById === currentUserId ||
    currentRole === "owner" ||
    currentRole === "admin"
  )
}

export async function getGroupExpenseData(groupId: string) {
  const { user, membership } = await requireActiveMembership(groupId)
  const db = getDb()

  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), isNull(groups.archivedAt)),
  })
  if (!group) {
    return null
  }

  const [members, groupExpenses, groupSettlements] = await Promise.all([
    db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: { user: true },
      orderBy: [desc(groupMembers.status), desc(groupMembers.joinedAt)],
    }),
    db.query.expenses.findMany({
      where: eq(expenses.groupId, groupId),
      with: {
        paidByMember: { with: { user: true } },
        createdBy: true,
        splits: { with: { member: { with: { user: true } } } },
      },
      orderBy: [desc(expenses.expenseDate), desc(expenses.createdAt)],
    }),
    db.query.settlements.findMany({
      where: eq(settlements.groupId, groupId),
      with: {
        fromMember: { with: { user: true } },
        toMember: { with: { user: true } },
        createdBy: true,
      },
      orderBy: [desc(settlements.settledDate), desc(settlements.createdAt)],
    }),
  ])

  const activeExpenses = groupExpenses.filter((expense) => !expense.deletedAt)
  const activeSettlements = groupSettlements.filter(
    (settlement) => !settlement.deletedAt
  )
  const balances = calculateBalances({
    members,
    activeExpenses,
    activeSettlements,
  })

  return {
    user,
    membership,
    group,
    members,
    activeMembers: members.filter((member) => member.status === "active"),
    expenses: groupExpenses,
    activeExpenses,
    settlements: groupSettlements,
    activeSettlements,
    balances,
    settlementSuggestions: suggestSettlements(balances),
  }
}

export async function getDashboardExpenseData() {
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
      totalNetCents: 0,
      recentExpenses: [],
      groupSummaries: [],
    }
  }

  const db = getDb()
  const [memberships, recentExpenses] = await Promise.all([
    db.query.groupMembers.findMany({
      where: inArray(groupMembers.groupId, groupIds),
      with: { user: true },
    }),
    db.query.expenses.findMany({
      where: and(
        inArray(expenses.groupId, groupIds),
        isNull(expenses.deletedAt)
      ),
      with: {
        group: true,
        paidByMember: { with: { user: true } },
      },
      orderBy: [desc(expenses.expenseDate), desc(expenses.createdAt)],
      limit: 5,
    }),
  ])

  const groupSummaries = await Promise.all(
    dashboard.groups.map(async ({ group }) => {
      const data = await getGroupExpenseData(group.id)
      const currentMember = memberships.find(
        (member) => member.groupId === group.id && member.userId === user.id
      )
      const currentBalance = currentMember
        ? (data?.balances.find((row) => row.member.id === currentMember.id)
            ?.netCents ?? 0)
        : 0
      return {
        group,
        netCents: currentBalance,
        expenseCount: data?.activeExpenses.length ?? 0,
        settlementCount: data?.activeSettlements.length ?? 0,
      }
    })
  )

  return {
    totalNetCents: groupSummaries.reduce(
      (sum, summary) => sum + summary.netCents,
      0
    ),
    recentExpenses,
    groupSummaries,
  }
}
