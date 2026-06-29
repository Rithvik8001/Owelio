"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import {
  createExpense,
  deleteExpense,
  deleteSettlement,
  recordSettlement,
  updateExpense,
} from "@/app/actions/expenses"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  expenseCategories,
  expenseSplitMethods,
  type ExpenseFormState,
  type SettlementFormState,
} from "@/lib/validations/expenses"

type MemberOption = {
  id: string
  username: string
  email: string
}

type ExpenseSplitValue = {
  memberId: string
  value: string
  checked: boolean
}

type EditableExpense = {
  id: string
  title: string
  description: string | null
  amount: string
  category: string
  paidByMemberId: string
  expenseDate: string
  splitMethod: "equal" | "exact" | "percentage"
  splits: ExpenseSplitValue[]
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function memberLabel(member: MemberOption) {
  return `@${member.username}`
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function CreateExpenseDialog({
  groupId,
  members,
}: {
  groupId: string
  members: MemberOption[]
}) {
  return (
    <ExpenseDialog
      mode="create"
      groupId={groupId}
      members={members}
      trigger={
        <Button className="bg-zinc-900 hover:bg-zinc-700">
          <PlusIcon data-icon="inline-start" />
          New expense
        </Button>
      }
    />
  )
}

export function EditExpenseDialog({
  groupId,
  members,
  expense,
}: {
  groupId: string
  members: MemberOption[]
  expense: EditableExpense
}) {
  return (
    <ExpenseDialog
      mode="edit"
      groupId={groupId}
      members={members}
      expense={expense}
      trigger={
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <PencilIcon />
          Edit expense
        </DropdownMenuItem>
      }
    />
  )
}

function ExpenseDialog({
  mode,
  groupId,
  members,
  expense,
  trigger,
}: {
  mode: "create" | "edit"
  groupId: string
  members: MemberOption[]
  expense?: EditableExpense
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [splitMethod, setSplitMethod] = useState<
    (typeof expenseSplitMethods)[number]
  >(expense?.splitMethod ?? "equal")
  const [state, action, pending] = useActionState(
    mode === "edit" ? updateExpense : createExpense,
    undefined as ExpenseFormState
  )
  const formRef = useRef<HTMLFormElement>(null)

  const defaultSplits = useMemo(() => {
    const existing = new Map(expense?.splits.map((split) => [split.memberId, split]))
    return members.map((member) => {
      const split = existing.get(member.id)
      return {
        memberId: member.id,
        checked: split?.checked ?? mode === "create",
        value: split?.value ?? "",
      }
    })
  }, [expense?.splits, members, mode])

  useEffect(() => {
    if (state?.message && mode === "create") {
      formRef.current?.reset()
    }
  }, [mode, state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit expense" : "Add expense"}
          </DialogTitle>
          <DialogDescription>
            Record who paid and how the cost should be split.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action}>
          <input type="hidden" name="groupId" value={groupId} />
          {expense ? (
            <input type="hidden" name="expenseId" value={expense.id} />
          ) : null}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.title)}>
                <FieldLabel htmlFor={`${mode}-expense-title`}>Title</FieldLabel>
                <Input
                  id={`${mode}-expense-title`}
                  name="title"
                  defaultValue={expense?.title}
                  placeholder="Dinner"
                  required
                />
                <FieldError>{state?.errors?.title?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.amount)}>
                <FieldLabel htmlFor={`${mode}-expense-amount`}>
                  Amount
                </FieldLabel>
                <Input
                  id={`${mode}-expense-amount`}
                  name="amount"
                  inputMode="decimal"
                  defaultValue={expense?.amount}
                  placeholder="48.25"
                  required
                />
                <FieldError>{state?.errors?.amount?.[0]}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field data-invalid={Boolean(state?.errors?.category)}>
                <FieldLabel>Category</FieldLabel>
                <Select name="category" defaultValue={expense?.category ?? "other"}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {titleCase(category)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state?.errors?.category?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.expenseDate)}>
                <FieldLabel htmlFor={`${mode}-expense-date`}>Date</FieldLabel>
                <Input
                  id={`${mode}-expense-date`}
                  name="expenseDate"
                  type="date"
                  defaultValue={expense?.expenseDate ?? todayInputValue()}
                  required
                />
                <FieldError>{state?.errors?.expenseDate?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.paidByMemberId)}>
                <FieldLabel>Paid by</FieldLabel>
                <Select
                  name="paidByMemberId"
                  defaultValue={expense?.paidByMemberId ?? members[0]?.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose payer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {memberLabel(member)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state?.errors?.paidByMemberId?.[0]}</FieldError>
              </Field>
            </div>

            <Field data-invalid={Boolean(state?.errors?.description)}>
              <FieldLabel htmlFor={`${mode}-expense-description`}>
                Notes
              </FieldLabel>
              <Textarea
                id={`${mode}-expense-description`}
                name="description"
                defaultValue={expense?.description ?? ""}
                placeholder="Optional context"
              />
              <FieldError>{state?.errors?.description?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(state?.errors?.splitMethod)}>
              <FieldLabel>Split method</FieldLabel>
              <Select
                name="splitMethod"
                value={splitMethod}
                onValueChange={(value) =>
                  setSplitMethod(value as (typeof expenseSplitMethods)[number])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="equal">Equal</SelectItem>
                    <SelectItem value="exact">Exact amounts</SelectItem>
                    <SelectItem value="percentage">Percentages</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{state?.errors?.splitMethod?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(state?.errors?.participantIds || state?.errors?.splits)}>
              <FieldLabel>Participants</FieldLabel>
              <div className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 p-3">
                {members.map((member) => {
                  const split = defaultSplits.find((item) => item.memberId === member.id)
                  return (
                    <label
                      key={member.id}
                      className="flex flex-col gap-2 rounded-lg border border-zinc-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Checkbox
                          name="participantIds"
                          value={member.id}
                          defaultChecked={split?.checked}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-zinc-900">
                            {memberLabel(member)}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">
                            {member.email}
                          </span>
                        </span>
                      </span>
                      {splitMethod !== "equal" ? (
                        <Input
                          name={`split-${member.id}`}
                          inputMode="decimal"
                          defaultValue={split?.value}
                          placeholder={splitMethod === "exact" ? "12.50" : "25"}
                          className="w-full sm:w-32"
                        />
                      ) : null}
                    </label>
                  )
                })}
              </div>
              <FieldDescription>
                Exact splits use currency amounts. Percentage splits must total
                100%.
              </FieldDescription>
              <FieldError>
                {state?.errors?.participantIds?.[0] ?? state?.errors?.splits?.[0]}
              </FieldError>
            </Field>

            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-700"
              disabled={pending || !members.length}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {mode === "edit" ? "Save changes" : "Create expense"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ExpenseActions({
  groupId,
  expenseId,
  canMutate,
  members,
  expense,
}: {
  groupId: string
  expenseId: string
  canMutate: boolean
  members: MemberOption[]
  expense: EditableExpense
}) {
  if (!canMutate) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Expense actions">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditExpenseDialog groupId={groupId} members={members} expense={expense} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => event.preventDefault()}
            >
              <Trash2Icon />
              Delete expense
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be removed from active balances, but the record stays
                archived.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={deleteExpense}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="expenseId" value={expenseId} />
                <AlertDialogAction type="submit">Delete</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RecordSettlementDialog({
  groupId,
  members,
  defaultFromMemberId,
  defaultToMemberId,
  defaultAmount,
}: {
  groupId: string
  members: MemberOption[]
  defaultFromMemberId?: string
  defaultToMemberId?: string
  defaultAmount?: string
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(
    recordSettlement,
    undefined as SettlementFormState
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={defaultAmount ? "outline" : "default"} className={defaultAmount ? "" : "bg-zinc-900 hover:bg-zinc-700"}>
          <CalendarIcon data-icon="inline-start" />
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record settlement</DialogTitle>
          <DialogDescription>
            Log a payment made outside Owelio.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action}>
          <input type="hidden" name="groupId" value={groupId} />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.fromMemberId)}>
                <FieldLabel>From</FieldLabel>
                <Select name="fromMemberId" defaultValue={defaultFromMemberId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {memberLabel(member)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state?.errors?.fromMemberId?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.toMemberId)}>
                <FieldLabel>To</FieldLabel>
                <Select name="toMemberId" defaultValue={defaultToMemberId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {memberLabel(member)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state?.errors?.toMemberId?.[0]}</FieldError>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.amount)}>
                <FieldLabel htmlFor="settlement-amount">Amount</FieldLabel>
                <Input
                  id="settlement-amount"
                  name="amount"
                  inputMode="decimal"
                  defaultValue={defaultAmount}
                  placeholder="25.00"
                  required
                />
                <FieldError>{state?.errors?.amount?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.settledDate)}>
                <FieldLabel htmlFor="settlement-date">Date</FieldLabel>
                <Input
                  id="settlement-date"
                  name="settledDate"
                  type="date"
                  defaultValue={todayInputValue()}
                  required
                />
                <FieldError>{state?.errors?.settledDate?.[0]}</FieldError>
              </Field>
            </div>
            <Field data-invalid={Boolean(state?.errors?.note)}>
              <FieldLabel htmlFor="settlement-note">Note</FieldLabel>
              <Input
                id="settlement-note"
                name="note"
                placeholder="Optional note"
              />
              <FieldError>{state?.errors?.note?.[0]}</FieldError>
            </Field>
            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-700"
              disabled={pending || members.length < 2}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Record settlement
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteSettlementButton({
  groupId,
  settlementId,
  canMutate,
}: {
  groupId: string
  settlementId: string
  canMutate: boolean
}) {
  if (!canMutate) {
    return null
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this settlement?</AlertDialogTitle>
          <AlertDialogDescription>
            It will be removed from active balances, but the record stays
            archived.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteSettlement}>
            <input type="hidden" name="groupId" value={groupId} />
            <input type="hidden" name="settlementId" value={settlementId} />
            <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
