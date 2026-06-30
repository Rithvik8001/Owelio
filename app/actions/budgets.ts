"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { budgets, groups } from "@/db/schema"
import { getDb } from "@/lib/db"
import { requireGroupManager } from "@/lib/groups"
import {
  parseDateInput,
  parseMoneyToCents,
  type ExpenseCategory,
} from "@/lib/expenses"
import {
  ArchiveBudgetSchema,
  CreateBudgetSchema,
  UpdateBudgetSchema,
  type BudgetFormState,
} from "@/lib/validations/budgets"

function revalidateBudgetPaths(groupId: string) {
  revalidatePath("/dashboard")
  revalidatePath("/groups")
  revalidatePath(`/groups/${groupId}`)
}

function budgetError(message: string): BudgetFormState {
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

async function requireMutableBudgetGroup(groupId: string) {
  const { user, membership } = await requireGroupManager(groupId)
  const db = getDb()
  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), isNull(groups.archivedAt)),
  })
  if (!group) {
    throw new Error("This group is no longer active.")
  }

  return { user, membership, group }
}

function parseOptionalDate(input: string | undefined) {
  return input ? parseDateInput(input) : null
}

function buildBudgetValues(data: {
  scope: "overall" | "category"
  category?: ExpenseCategory | ""
  amount: string
  startsAt?: string
  endsAt?: string
}) {
  const amountCents = parseMoneyToCents(data.amount)
  const startsAt = parseOptionalDate(data.startsAt)
  const endsAt = parseOptionalDate(data.endsAt)

  if (startsAt && endsAt && startsAt > endsAt) {
    throw new Error("Start date must be before end date.")
  }

  return {
    amountCents,
    startsAt,
    endsAt,
    category:
      data.scope === "category" ? (data.category as ExpenseCategory) : null,
  }
}

export async function createBudget(
  _state: BudgetFormState,
  formData: FormData
): Promise<BudgetFormState> {
  const validated = CreateBudgetSchema.safeParse({
    groupId: formData.get("groupId"),
    name: formData.get("name"),
    scope: formData.get("scope"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { groupId, name } = validated.data

  try {
    const { user, group } = await requireMutableBudgetGroup(groupId)
    const values = buildBudgetValues(validated.data)
    const db = getDb()

    await db.insert(budgets).values({
      groupId,
      name,
      category: values.category,
      amountCents: values.amountCents,
      currencyCode: group.currencyCode,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      createdById: user.id,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return budgetError("An active budget already exists for this scope.")
    }
    return budgetError(
      error instanceof Error ? error.message : "Failed to create budget."
    )
  }

  revalidateBudgetPaths(groupId)
  return { message: "Budget created." }
}

export async function updateBudget(
  _state: BudgetFormState,
  formData: FormData
): Promise<BudgetFormState> {
  const validated = UpdateBudgetSchema.safeParse({
    groupId: formData.get("groupId"),
    budgetId: formData.get("budgetId"),
    name: formData.get("name"),
    scope: formData.get("scope"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { groupId, budgetId, name } = validated.data

  try {
    const { group } = await requireMutableBudgetGroup(groupId)
    const values = buildBudgetValues(validated.data)
    const db = getDb()
    const existing = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.id, budgetId),
        eq(budgets.groupId, groupId),
        isNull(budgets.archivedAt)
      ),
    })
    if (!existing) {
      return budgetError("Budget not found.")
    }

    await db
      .update(budgets)
      .set({
        name,
        category: values.category,
        amountCents: values.amountCents,
        currencyCode: group.currencyCode,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, budgetId))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return budgetError("An active budget already exists for this scope.")
    }
    return budgetError(
      error instanceof Error ? error.message : "Failed to update budget."
    )
  }

  revalidateBudgetPaths(groupId)
  return { message: "Budget updated." }
}

export async function archiveBudget(formData: FormData) {
  const validated = ArchiveBudgetSchema.safeParse({
    groupId: formData.get("groupId"),
    budgetId: formData.get("budgetId"),
  })
  if (!validated.success) {
    return
  }

  const { groupId, budgetId } = validated.data
  await requireMutableBudgetGroup(groupId)

  const db = getDb()
  await db
    .update(budgets)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(budgets.id, budgetId),
        eq(budgets.groupId, groupId),
        isNull(budgets.archivedAt)
      )
    )

  revalidateBudgetPaths(groupId)
}
