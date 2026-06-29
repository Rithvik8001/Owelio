"use server"

import { revalidatePath } from "next/cache"
import { and, eq, inArray, isNull } from "drizzle-orm"
import {
  expenseSplits,
  expenses,
  groupMembers,
  groups,
  settlements,
} from "@/db/schema"
import { getDb } from "@/lib/db"
import {
  buildSplitRows,
  canMutateLedgerRecord,
  parseDateInput,
  parseMoneyToCents,
  type SplitInput,
} from "@/lib/expenses"
import {
  CreateExpenseSchema,
  ExpenseIdSchema,
  RecordSettlementSchema,
  SettlementIdSchema,
  UpdateExpenseSchema,
  type ExpenseFormState,
  type SettlementFormState,
} from "@/lib/validations/expenses"
import { requireActiveMembership } from "@/lib/groups"

function revalidateExpensePaths(groupId: string) {
  revalidatePath("/dashboard")
  revalidatePath("/groups")
  revalidatePath(`/groups/${groupId}`)
}

function expenseError(message: string): ExpenseFormState {
  return { errors: { form: [message] } }
}

function settlementError(message: string): SettlementFormState {
  return { errors: { form: [message] } }
}

function getSplitInputs(formData: FormData): SplitInput[] {
  return formData
    .getAll("participantIds")
    .map((value) => String(value))
    .map((memberId) => ({
      memberId,
      value:
        String(
          formData.get(`split-${memberId}`) ??
            formData.get(`split_${memberId}`) ??
            ""
        ) || undefined,
    }))
}

async function requireMutableGroup(groupId: string) {
  const { user, membership } = await requireActiveMembership(groupId)
  const db = getDb()
  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), isNull(groups.archivedAt)),
  })
  if (!group) {
    throw new Error("This group is no longer active.")
  }
  return { user, membership, group }
}

async function getActiveMembers(groupId: string, memberIds: string[]) {
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

function assertAllMembersValid({
  requestedIds,
  activeMembers,
}: {
  requestedIds: string[]
  activeMembers: (typeof groupMembers.$inferSelect)[]
}) {
  const activeIds = new Set(activeMembers.map((member) => member.id))
  if (requestedIds.some((id) => !activeIds.has(id))) {
    throw new Error("Choose active members from this group.")
  }
}

async function buildExpensePayload(formData: FormData, includeExpenseId = false) {
  const raw = {
    groupId: formData.get("groupId"),
    expenseId: includeExpenseId ? formData.get("expenseId") : undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    paidByMemberId: formData.get("paidByMemberId"),
    expenseDate: formData.get("expenseDate"),
    splitMethod: formData.get("splitMethod"),
    participantIds: formData.getAll("participantIds"),
  }

  const validated = includeExpenseId
    ? UpdateExpenseSchema.safeParse(raw)
    : CreateExpenseSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    const amountCents = parseMoneyToCents(validated.data.amount)
    const expenseDate = parseDateInput(validated.data.expenseDate)
    const splitRows = buildSplitRows({
      amountCents,
      splitMethod: validated.data.splitMethod,
      splits: getSplitInputs(formData),
    })
    return { data: { ...validated.data, amountCents, expenseDate, splitRows } }
  } catch (error) {
    return {
      errors: {
        splits: [
          error instanceof Error ? error.message : "Check the expense splits.",
        ],
      },
    }
  }
}

export async function createExpense(
  _state: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const payload = await buildExpensePayload(formData)
  if ("errors" in payload) return { errors: payload.errors }

  const {
    groupId,
    title,
    description,
    category,
    paidByMemberId,
    splitMethod,
    amountCents,
    expenseDate,
    splitRows,
  } = payload.data

  try {
    const { user, group } = await requireMutableGroup(groupId)
    const requestedMemberIds = [
      paidByMemberId,
      ...splitRows.map((row) => row.groupMemberId),
    ]
    const activeMembers = await getActiveMembers(groupId, requestedMemberIds)
    assertAllMembersValid({ requestedIds: requestedMemberIds, activeMembers })

    const db = getDb()
    await db.transaction(async (tx) => {
      const [expense] = await tx
        .insert(expenses)
        .values({
          groupId,
          title,
          description: description || null,
          category,
          amountCents,
          currencyCode: group.currencyCode,
          paidByMemberId,
          createdById: user.id,
          expenseDate,
          splitMethod,
        })
        .returning({ id: expenses.id })

      await tx.insert(expenseSplits).values(
        splitRows.map((row) => ({
          expenseId: expense.id,
          groupMemberId: row.groupMemberId,
          owedCents: row.owedCents,
          percentageBasisPoints: row.percentageBasisPoints,
        }))
      )
    })
  } catch (error) {
    return expenseError(
      error instanceof Error ? error.message : "Failed to create expense."
    )
  }

  revalidateExpensePaths(groupId)
  return { message: "Expense created." }
}

export async function updateExpense(
  _state: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const payload = await buildExpensePayload(formData, true)
  if ("errors" in payload) return { errors: payload.errors }

  const {
    groupId,
    title,
    description,
    category,
    paidByMemberId,
    splitMethod,
    amountCents,
    expenseDate,
    splitRows,
  } = payload.data
  const expenseId = String(formData.get("expenseId") ?? "")
  if (!expenseId) {
    return expenseError("Invalid expense.")
  }

  try {
    const { user, membership, group } = await requireMutableGroup(groupId)
    const db = getDb()
    const existing = await db.query.expenses.findFirst({
      where: and(
        eq(expenses.id, expenseId),
        eq(expenses.groupId, groupId),
        isNull(expenses.deletedAt)
      ),
    })
    if (!existing) {
      return expenseError("Expense not found.")
    }
    if (
      !canMutateLedgerRecord({
        currentUserId: user.id,
        currentRole: membership.role,
        createdById: existing.createdById,
      })
    ) {
      return expenseError("You do not have permission to edit this expense.")
    }

    const requestedMemberIds = [
      paidByMemberId,
      ...splitRows.map((row) => row.groupMemberId),
    ]
    const activeMembers = await getActiveMembers(groupId, requestedMemberIds)
    assertAllMembersValid({ requestedIds: requestedMemberIds, activeMembers })

    await db.transaction(async (tx) => {
      await tx
        .update(expenses)
        .set({
          title,
          description: description || null,
          category,
          amountCents,
          currencyCode: group.currencyCode,
          paidByMemberId,
          expenseDate,
          splitMethod,
          updatedAt: new Date(),
        })
        .where(eq(expenses.id, expenseId))

      await tx
        .delete(expenseSplits)
        .where(eq(expenseSplits.expenseId, expenseId))
      await tx.insert(expenseSplits).values(
        splitRows.map((row) => ({
          expenseId,
          groupMemberId: row.groupMemberId,
          owedCents: row.owedCents,
          percentageBasisPoints: row.percentageBasisPoints,
        }))
      )
    })
  } catch (error) {
    return expenseError(
      error instanceof Error ? error.message : "Failed to update expense."
    )
  }

  revalidateExpensePaths(groupId)
  return { message: "Expense updated." }
}

export async function deleteExpense(formData: FormData) {
  const validated = ExpenseIdSchema.safeParse({
    groupId: formData.get("groupId"),
    expenseId: formData.get("expenseId"),
  })
  if (!validated.success) return

  const { groupId, expenseId } = validated.data
  const { user, membership } = await requireMutableGroup(groupId)
  const db = getDb()
  const existing = await db.query.expenses.findFirst({
    where: and(
      eq(expenses.id, expenseId),
      eq(expenses.groupId, groupId),
      isNull(expenses.deletedAt)
    ),
  })
  if (
    !existing ||
    !canMutateLedgerRecord({
      currentUserId: user.id,
      currentRole: membership.role,
      createdById: existing.createdById,
    })
  ) {
    return
  }

  await db
    .update(expenses)
    .set({ deletedAt: new Date(), deletedById: user.id, updatedAt: new Date() })
    .where(eq(expenses.id, expenseId))

  revalidateExpensePaths(groupId)
}

export async function recordSettlement(
  _state: SettlementFormState,
  formData: FormData
): Promise<SettlementFormState> {
  const validated = RecordSettlementSchema.safeParse({
    groupId: formData.get("groupId"),
    fromMemberId: formData.get("fromMemberId"),
    toMemberId: formData.get("toMemberId"),
    amount: formData.get("amount"),
    settledDate: formData.get("settledDate"),
    note: formData.get("note"),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { groupId, fromMemberId, toMemberId, amount, settledDate, note } =
    validated.data
  if (fromMemberId === toMemberId) {
    return settlementError("Choose two different members.")
  }

  try {
    const { user, group } = await requireMutableGroup(groupId)
    const amountCents = parseMoneyToCents(amount)
    const activeMembers = await getActiveMembers(groupId, [
      fromMemberId,
      toMemberId,
    ])
    assertAllMembersValid({
      requestedIds: [fromMemberId, toMemberId],
      activeMembers,
    })

    const db = getDb()
    await db.insert(settlements).values({
      groupId,
      fromMemberId,
      toMemberId,
      amountCents,
      currencyCode: group.currencyCode,
      note: note || null,
      settledDate: parseDateInput(settledDate),
      createdById: user.id,
    })
  } catch (error) {
    return settlementError(
      error instanceof Error ? error.message : "Failed to record settlement."
    )
  }

  revalidateExpensePaths(groupId)
  return { message: "Settlement recorded." }
}

export async function deleteSettlement(formData: FormData) {
  const validated = SettlementIdSchema.safeParse({
    groupId: formData.get("groupId"),
    settlementId: formData.get("settlementId"),
  })
  if (!validated.success) return

  const { groupId, settlementId } = validated.data
  const { user, membership } = await requireMutableGroup(groupId)
  const db = getDb()
  const existing = await db.query.settlements.findFirst({
    where: and(
      eq(settlements.id, settlementId),
      eq(settlements.groupId, groupId),
      isNull(settlements.deletedAt)
    ),
  })
  if (
    !existing ||
    !canMutateLedgerRecord({
      currentUserId: user.id,
      currentRole: membership.role,
      createdById: existing.createdById,
    })
  ) {
    return
  }

  await db
    .update(settlements)
    .set({ deletedAt: new Date(), deletedById: user.id, updatedAt: new Date() })
    .where(eq(settlements.id, settlementId))

  revalidateExpensePaths(groupId)
}
