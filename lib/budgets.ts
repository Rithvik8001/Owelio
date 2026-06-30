import "server-only"

import { and, desc, eq, inArray, isNull } from "drizzle-orm"
import { budgets, expenses, groups } from "@/db/schema"
import { getDb } from "@/lib/db"
import { getGroupsForCurrentUser, requireActiveMembership } from "@/lib/groups"
import { getUser } from "@/lib/session"

type Budget = typeof budgets.$inferSelect
type BudgetExpense = Pick<
  typeof expenses.$inferSelect,
  "amountCents" | "category" | "expenseDate"
>

export type BudgetTone = "normal" | "warning" | "over"

export type BudgetProgress = {
  budget: Budget
  spentCents: number
  remainingCents: number
  usedPercent: number
  progressPercent: number
  tone: BudgetTone
}

export function getBudgetTone(usedPercent: number): BudgetTone {
  if (usedPercent >= 100) return "over"
  if (usedPercent >= 80) return "warning"
  return "normal"
}

export function calculateBudgetProgress({
  budget,
  activeExpenses,
}: {
  budget: Budget
  activeExpenses: BudgetExpense[]
}): BudgetProgress {
  const spentCents = activeExpenses
    .filter((expense) => {
      if (budget.category && expense.category !== budget.category) return false
      if (budget.startsAt && expense.expenseDate < budget.startsAt) return false
      if (budget.endsAt && expense.expenseDate > budget.endsAt) return false
      return true
    })
    .reduce((sum, expense) => sum + expense.amountCents, 0)
  const usedPercent = Math.round((spentCents / budget.amountCents) * 100)

  return {
    budget,
    spentCents,
    remainingCents: budget.amountCents - spentCents,
    usedPercent,
    progressPercent: Math.min(usedPercent, 100),
    tone: getBudgetTone(usedPercent),
  }
}

export async function getGroupBudgetData(groupId: string) {
  const { user, membership } = await requireActiveMembership(groupId)
  const db = getDb()

  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), isNull(groups.archivedAt)),
  })
  if (!group) {
    return null
  }

  const [groupBudgets, activeExpenses] = await Promise.all([
    db.query.budgets.findMany({
      where: and(eq(budgets.groupId, groupId), isNull(budgets.archivedAt)),
      with: { createdBy: true },
      orderBy: [desc(budgets.createdAt)],
    }),
    db.query.expenses.findMany({
      where: and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt)),
      columns: {
        amountCents: true,
        category: true,
        expenseDate: true,
      },
    }),
  ])

  return {
    user,
    membership,
    group,
    budgets: groupBudgets,
    budgetProgress: groupBudgets.map((budget) =>
      calculateBudgetProgress({ budget, activeExpenses })
    ),
  }
}

export async function getDashboardBudgetData() {
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
      overBudgetCount: 0,
      groupBudgetSummaries: [],
    }
  }

  const db = getDb()
  const [activeBudgets, activeExpenses] = await Promise.all([
    db.query.budgets.findMany({
      where: and(
        inArray(budgets.groupId, groupIds),
        isNull(budgets.archivedAt)
      ),
      orderBy: [desc(budgets.createdAt)],
    }),
    db.query.expenses.findMany({
      where: and(
        inArray(expenses.groupId, groupIds),
        isNull(expenses.deletedAt)
      ),
      columns: {
        groupId: true,
        amountCents: true,
        category: true,
        expenseDate: true,
      },
    }),
  ])

  const groupBudgetSummaries = dashboard.groups.map(({ group }) => {
    const groupBudgets = activeBudgets.filter(
      (budget) => budget.groupId === group.id
    )
    const groupExpenses = activeExpenses.filter(
      (expense) => expense.groupId === group.id
    )
    const progress = groupBudgets.map((budget) =>
      calculateBudgetProgress({ budget, activeExpenses: groupExpenses })
    )

    return {
      group,
      overallBudget:
        progress.find((row) => row.budget.category === null) ?? null,
      overBudgetCount: progress.filter((row) => row.tone === "over").length,
    }
  })

  return {
    overBudgetCount: groupBudgetSummaries.reduce(
      (sum, group) => sum + group.overBudgetCount,
      0
    ),
    groupBudgetSummaries,
  }
}
