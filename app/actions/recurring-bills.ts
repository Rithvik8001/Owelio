"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import {
  expenseSplits,
  expenses,
  groups,
  recurringBillSplits,
  recurringBills,
} from "@/db/schema"
import { getDb } from "@/lib/db"
import {
  buildSplitRows,
  parseDateInput,
  parseMoneyToCents,
  type SplitInput,
} from "@/lib/expenses"
import { requireGroupManager } from "@/lib/groups"
import {
  advanceRecurringDate,
  getActiveRecurringBillMembers,
} from "@/lib/recurring-bills"
import {
  CreateRecurringBillSchema,
  RecurringBillIdSchema,
  UpdateRecurringBillSchema,
  type RecurringBillFormState,
} from "@/lib/validations/recurring-bills"

function revalidateRecurringBillPaths(groupId: string) {
  revalidatePath("/dashboard")
  revalidatePath("/groups")
  revalidatePath(`/groups/${groupId}`)
}

function recurringBillError(message: string): RecurringBillFormState {
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

function assertAllMembersActive({
  requestedIds,
  activeMembers,
}: {
  requestedIds: string[]
  activeMembers: { id: string }[]
}) {
  const activeIds = new Set(activeMembers.map((member) => member.id))
  if (requestedIds.some((id) => !activeIds.has(id))) {
    throw new Error("Choose active members from this group.")
  }
}

async function requireMutableRecurringGroup(groupId: string) {
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

async function buildRecurringBillPayload(
  formData: FormData,
  includeRecurringBillId = false
) {
  const raw = {
    groupId: formData.get("groupId"),
    recurringBillId: includeRecurringBillId
      ? formData.get("recurringBillId")
      : undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    paidByMemberId: formData.get("paidByMemberId"),
    splitMethod: formData.get("splitMethod"),
    frequency: formData.get("frequency"),
    nextDueDate: formData.get("nextDueDate"),
    participantIds: formData.getAll("participantIds"),
  }

  const validated = includeRecurringBillId
    ? UpdateRecurringBillSchema.safeParse(raw)
    : CreateRecurringBillSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    const amountCents = parseMoneyToCents(validated.data.amount)
    const nextDueDate = parseDateInput(validated.data.nextDueDate)
    const splitRows = buildSplitRows({
      amountCents,
      splitMethod: validated.data.splitMethod,
      splits: getSplitInputs(formData),
    })

    return {
      data: {
        ...validated.data,
        amountCents,
        nextDueDate,
        splitRows,
      },
    }
  } catch (error) {
    return {
      errors: {
        splits: [
          error instanceof Error
            ? error.message
            : "Check the recurring bill splits.",
        ],
      },
    }
  }
}

export async function createRecurringBill(
  _state: RecurringBillFormState,
  formData: FormData
): Promise<RecurringBillFormState> {
  const payload = await buildRecurringBillPayload(formData)
  if ("errors" in payload) return { errors: payload.errors }

  const {
    groupId,
    title,
    description,
    category,
    paidByMemberId,
    splitMethod,
    frequency,
    amountCents,
    nextDueDate,
    splitRows,
  } = payload.data

  try {
    const { user, group } = await requireMutableRecurringGroup(groupId)
    const requestedMemberIds = [
      paidByMemberId,
      ...splitRows.map((row) => row.groupMemberId),
    ]
    const activeMembers = await getActiveRecurringBillMembers(
      groupId,
      requestedMemberIds
    )
    assertAllMembersActive({ requestedIds: requestedMemberIds, activeMembers })

    const db = getDb()
    await db.transaction(async (tx) => {
      const [bill] = await tx
        .insert(recurringBills)
        .values({
          groupId,
          title,
          description: description || null,
          category,
          amountCents,
          currencyCode: group.currencyCode,
          paidByMemberId,
          splitMethod,
          frequency,
          nextDueDate,
          createdById: user.id,
        })
        .returning({ id: recurringBills.id })

      await tx.insert(recurringBillSplits).values(
        splitRows.map((row) => ({
          recurringBillId: bill.id,
          groupMemberId: row.groupMemberId,
          owedCents: row.owedCents,
          percentageBasisPoints: row.percentageBasisPoints,
        }))
      )
    })
  } catch (error) {
    return recurringBillError(
      error instanceof Error
        ? error.message
        : "Failed to create recurring bill."
    )
  }

  revalidateRecurringBillPaths(groupId)
  return { message: "Recurring bill created." }
}

export async function updateRecurringBill(
  _state: RecurringBillFormState,
  formData: FormData
): Promise<RecurringBillFormState> {
  const payload = await buildRecurringBillPayload(formData, true)
  if ("errors" in payload) return { errors: payload.errors }

  const {
    groupId,
    title,
    description,
    category,
    paidByMemberId,
    splitMethod,
    frequency,
    amountCents,
    nextDueDate,
    splitRows,
  } = payload.data
  const recurringBillId = String(formData.get("recurringBillId") ?? "")

  try {
    const { group } = await requireMutableRecurringGroup(groupId)
    const db = getDb()
    const existing = await db.query.recurringBills.findFirst({
      where: and(
        eq(recurringBills.id, recurringBillId),
        eq(recurringBills.groupId, groupId),
        isNull(recurringBills.archivedAt)
      ),
    })
    if (!existing) {
      return recurringBillError("Recurring bill not found.")
    }

    const requestedMemberIds = [
      paidByMemberId,
      ...splitRows.map((row) => row.groupMemberId),
    ]
    const activeMembers = await getActiveRecurringBillMembers(
      groupId,
      requestedMemberIds
    )
    assertAllMembersActive({ requestedIds: requestedMemberIds, activeMembers })

    await db.transaction(async (tx) => {
      await tx
        .update(recurringBills)
        .set({
          title,
          description: description || null,
          category,
          amountCents,
          currencyCode: group.currencyCode,
          paidByMemberId,
          splitMethod,
          frequency,
          nextDueDate,
          updatedAt: new Date(),
        })
        .where(eq(recurringBills.id, recurringBillId))

      await tx
        .delete(recurringBillSplits)
        .where(eq(recurringBillSplits.recurringBillId, recurringBillId))
      await tx.insert(recurringBillSplits).values(
        splitRows.map((row) => ({
          recurringBillId,
          groupMemberId: row.groupMemberId,
          owedCents: row.owedCents,
          percentageBasisPoints: row.percentageBasisPoints,
        }))
      )
    })
  } catch (error) {
    return recurringBillError(
      error instanceof Error
        ? error.message
        : "Failed to update recurring bill."
    )
  }

  revalidateRecurringBillPaths(groupId)
  return { message: "Recurring bill updated." }
}

async function getMutableRecurringBill(
  groupId: string,
  recurringBillId: string
) {
  await requireMutableRecurringGroup(groupId)
  const db = getDb()
  const bill = await db.query.recurringBills.findFirst({
    where: and(
      eq(recurringBills.id, recurringBillId),
      eq(recurringBills.groupId, groupId),
      isNull(recurringBills.archivedAt)
    ),
    with: { splits: true },
  })
  if (!bill) {
    throw new Error("Recurring bill not found.")
  }

  return bill
}

export async function postRecurringBill(
  _state: RecurringBillFormState,
  formData: FormData
): Promise<RecurringBillFormState> {
  const validated = RecurringBillIdSchema.safeParse({
    groupId: formData.get("groupId"),
    recurringBillId: formData.get("recurringBillId"),
  })
  if (!validated.success) {
    return recurringBillError("Invalid recurring bill.")
  }

  const { groupId, recurringBillId } = validated.data

  try {
    const { user, group } = await requireMutableRecurringGroup(groupId)
    const db = getDb()
    const bill = await db.query.recurringBills.findFirst({
      where: and(
        eq(recurringBills.id, recurringBillId),
        eq(recurringBills.groupId, groupId),
        isNull(recurringBills.archivedAt)
      ),
      with: { splits: true },
    })
    if (!bill) {
      return recurringBillError("Recurring bill not found.")
    }
    if (bill.pausedAt) {
      return recurringBillError("Resume this recurring bill before posting it.")
    }

    const requestedMemberIds = [
      bill.paidByMemberId,
      ...bill.splits.map((split) => split.groupMemberId),
    ]
    const activeMembers = await getActiveRecurringBillMembers(
      groupId,
      requestedMemberIds
    )
    assertAllMembersActive({ requestedIds: requestedMemberIds, activeMembers })

    const existingExpense = await db.query.expenses.findFirst({
      where: and(
        eq(expenses.recurringBillId, recurringBillId),
        eq(expenses.expenseDate, bill.nextDueDate),
        isNull(expenses.deletedAt)
      ),
      columns: { id: true },
    })
    if (existingExpense) {
      return recurringBillError(
        "This recurring bill has already been posted for that due date."
      )
    }

    const nextDueDate = advanceRecurringDate(bill.nextDueDate, bill.frequency)
    await db.transaction(async (tx) => {
      const [expense] = await tx
        .insert(expenses)
        .values({
          groupId,
          title: bill.title,
          description: bill.description,
          category: bill.category,
          amountCents: bill.amountCents,
          currencyCode: group.currencyCode,
          paidByMemberId: bill.paidByMemberId,
          createdById: user.id,
          recurringBillId: bill.id,
          expenseDate: bill.nextDueDate,
          splitMethod: bill.splitMethod,
        })
        .returning({ id: expenses.id })

      await tx.insert(expenseSplits).values(
        bill.splits.map((split) => ({
          expenseId: expense.id,
          groupMemberId: split.groupMemberId,
          owedCents: split.owedCents,
          percentageBasisPoints: split.percentageBasisPoints,
        }))
      )

      await tx
        .update(recurringBills)
        .set({
          lastPostedAt: new Date(),
          nextDueDate,
          updatedAt: new Date(),
        })
        .where(eq(recurringBills.id, bill.id))
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return recurringBillError(
        "This recurring bill has already been posted for that due date."
      )
    }
    return recurringBillError(
      error instanceof Error ? error.message : "Failed to post recurring bill."
    )
  }

  revalidateRecurringBillPaths(groupId)
  return { message: "Expense posted." }
}

export async function skipRecurringBill(formData: FormData) {
  const validated = RecurringBillIdSchema.safeParse({
    groupId: formData.get("groupId"),
    recurringBillId: formData.get("recurringBillId"),
  })
  if (!validated.success) return

  const { groupId, recurringBillId } = validated.data
  const bill = await getMutableRecurringBill(groupId, recurringBillId)
  const nextDueDate = advanceRecurringDate(bill.nextDueDate, bill.frequency)

  const db = getDb()
  await db
    .update(recurringBills)
    .set({ nextDueDate, updatedAt: new Date() })
    .where(eq(recurringBills.id, bill.id))

  revalidateRecurringBillPaths(groupId)
}

export async function pauseRecurringBill(formData: FormData) {
  const validated = RecurringBillIdSchema.safeParse({
    groupId: formData.get("groupId"),
    recurringBillId: formData.get("recurringBillId"),
  })
  if (!validated.success) return

  const { groupId, recurringBillId } = validated.data
  const bill = await getMutableRecurringBill(groupId, recurringBillId)

  const db = getDb()
  await db
    .update(recurringBills)
    .set({ pausedAt: bill.pausedAt ?? new Date(), updatedAt: new Date() })
    .where(eq(recurringBills.id, bill.id))

  revalidateRecurringBillPaths(groupId)
}

export async function resumeRecurringBill(formData: FormData) {
  const validated = RecurringBillIdSchema.safeParse({
    groupId: formData.get("groupId"),
    recurringBillId: formData.get("recurringBillId"),
  })
  if (!validated.success) return

  const { groupId, recurringBillId } = validated.data
  const bill = await getMutableRecurringBill(groupId, recurringBillId)

  const db = getDb()
  await db
    .update(recurringBills)
    .set({ pausedAt: null, updatedAt: new Date() })
    .where(eq(recurringBills.id, bill.id))

  revalidateRecurringBillPaths(groupId)
}

export async function archiveRecurringBill(formData: FormData) {
  const validated = RecurringBillIdSchema.safeParse({
    groupId: formData.get("groupId"),
    recurringBillId: formData.get("recurringBillId"),
  })
  if (!validated.success) return

  const { groupId, recurringBillId } = validated.data
  const bill = await getMutableRecurringBill(groupId, recurringBillId)

  const db = getDb()
  await db
    .update(recurringBills)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(recurringBills.id, bill.id))

  revalidateRecurringBillPaths(groupId)
}
