"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import {
  ArchiveIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ReceiptTextIcon,
  SkipForwardIcon,
} from "lucide-react"
import {
  archiveRecurringBill,
  createRecurringBill,
  pauseRecurringBill,
  postRecurringBill,
  resumeRecurringBill,
  skipRecurringBill,
  updateRecurringBill,
} from "@/app/actions/recurring-bills"
import { DatePickerInput } from "@/components/app/date-picker-input"
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "@/lib/validations/expenses"
import {
  recurringBillFrequencies,
  type RecurringBillFormState,
} from "@/lib/validations/recurring-bills"

type MemberOption = {
  id: string
  username: string
  email: string
}

type RecurringBillSplitValue = {
  memberId: string
  value: string
  checked: boolean
}

export type EditableRecurringBill = {
  id: string
  title: string
  description: string | null
  amount: string
  category: string
  paidByMemberId: string
  splitMethod: "equal" | "exact" | "percentage"
  frequency: "weekly" | "monthly" | "yearly"
  nextDueDate: string
  splits: RecurringBillSplitValue[]
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function memberLabel(member: MemberOption) {
  return `@${member.username}`
}

export function CreateRecurringBillDialog({
  groupId,
  members,
}: {
  groupId: string
  members: MemberOption[]
}) {
  return (
    <RecurringBillDialog
      mode="create"
      groupId={groupId}
      members={members}
      trigger={
        <Button className="bg-zinc-900 hover:bg-zinc-700">
          <PlusIcon data-icon="inline-start" />
          New recurring bill
        </Button>
      }
    />
  )
}

export function EditRecurringBillDialog({
  groupId,
  members,
  recurringBill,
}: {
  groupId: string
  members: MemberOption[]
  recurringBill: EditableRecurringBill
}) {
  return (
    <RecurringBillDialog
      mode="edit"
      groupId={groupId}
      members={members}
      recurringBill={recurringBill}
      trigger={
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <PencilIcon />
          Edit recurring bill
        </DropdownMenuItem>
      }
    />
  )
}

function RecurringBillDialog({
  mode,
  groupId,
  members,
  recurringBill,
  trigger,
}: {
  mode: "create" | "edit"
  groupId: string
  members: MemberOption[]
  recurringBill?: EditableRecurringBill
  trigger: React.ReactNode
}) {
  const [splitMethod, setSplitMethod] = useState<
    (typeof expenseSplitMethods)[number]
  >(recurringBill?.splitMethod ?? "equal")
  const [frequency, setFrequency] = useState<
    (typeof recurringBillFrequencies)[number]
  >(recurringBill?.frequency ?? "monthly")
  const [nextDueDate, setNextDueDate] = useState(
    recurringBill?.nextDueDate ?? ""
  )
  const [state, action, pending] = useActionState(
    mode === "edit" ? updateRecurringBill : createRecurringBill,
    undefined as RecurringBillFormState
  )
  const formRef = useRef<HTMLFormElement>(null)

  const defaultSplits = useMemo(() => {
    const existing = new Map(
      recurringBill?.splits.map((split) => [split.memberId, split])
    )
    return members.map((member) => {
      const split = existing.get(member.id)
      return {
        memberId: member.id,
        checked: split?.checked ?? mode === "create",
        value: split?.value ?? "",
      }
    })
  }, [members, mode, recurringBill?.splits])

  useEffect(() => {
    if (state?.message && mode === "create") {
      formRef.current?.reset()
      queueMicrotask(() => {
        setSplitMethod("equal")
        setFrequency("monthly")
        setNextDueDate("")
      })
    }
  }, [mode, state])

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit recurring bill" : "Create recurring bill"}
          </DialogTitle>
          <DialogDescription>
            Set up a bill template. Managers review and post each due expense.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action}>
          <input type="hidden" name="groupId" value={groupId} />
          {recurringBill ? (
            <input
              type="hidden"
              name="recurringBillId"
              value={recurringBill.id}
            />
          ) : null}
          <FieldGroup>
            {state?.errors?.form ? (
              <Field data-invalid>
                <FieldError>{state.errors.form[0]}</FieldError>
              </Field>
            ) : null}
            {state?.message ? (
              <Field>
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3 text-sm text-zinc-700">
                  {state.message}
                </div>
              </Field>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.title)}>
                <FieldLabel htmlFor={`${mode}-recurring-title`}>
                  Title
                </FieldLabel>
                <Input
                  id={`${mode}-recurring-title`}
                  name="title"
                  defaultValue={recurringBill?.title}
                  placeholder="Internet bill"
                  required
                />
                <FieldError>{state?.errors?.title?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.amount)}>
                <FieldLabel htmlFor={`${mode}-recurring-amount`}>
                  Amount
                </FieldLabel>
                <Input
                  id={`${mode}-recurring-amount`}
                  name="amount"
                  inputMode="decimal"
                  defaultValue={recurringBill?.amount}
                  placeholder="84.99"
                  required
                />
                <FieldError>{state?.errors?.amount?.[0]}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.frequency)}>
                <FieldLabel>Frequency</FieldLabel>
                <Select
                  name="frequency"
                  value={frequency}
                  onValueChange={(value) =>
                    setFrequency(
                      value as (typeof recurringBillFrequencies)[number]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state?.errors?.frequency?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.nextDueDate)}>
                <FieldLabel htmlFor={`${mode}-recurring-next-due`}>
                  Next due
                </FieldLabel>
                <DatePickerInput
                  id={`${mode}-recurring-next-due`}
                  name="nextDueDate"
                  value={nextDueDate}
                  onChange={setNextDueDate}
                  placeholder="Choose due date"
                />
                <FieldError>{state?.errors?.nextDueDate?.[0]}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.category)}>
                <FieldLabel>Category</FieldLabel>
                <Select
                  name="category"
                  defaultValue={recurringBill?.category ?? "utilities"}
                >
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
              <Field data-invalid={Boolean(state?.errors?.paidByMemberId)}>
                <FieldLabel>Paid by</FieldLabel>
                <Select
                  name="paidByMemberId"
                  defaultValue={recurringBill?.paidByMemberId ?? members[0]?.id}
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
              <FieldLabel htmlFor={`${mode}-recurring-description`}>
                Notes
              </FieldLabel>
              <Textarea
                id={`${mode}-recurring-description`}
                name="description"
                defaultValue={recurringBill?.description ?? ""}
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

            <Field
              data-invalid={Boolean(
                state?.errors?.participantIds || state?.errors?.splits
              )}
            >
              <FieldLabel>Participants</FieldLabel>
              <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 p-3">
                {members.map((member) => {
                  const split = defaultSplits.find(
                    (item) => item.memberId === member.id
                  )
                  return (
                    <label
                      key={member.id}
                      className="flex flex-col gap-2 rounded-xl border border-zinc-100 p-3 sm:flex-row sm:items-center sm:justify-between"
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
                {state?.errors?.participantIds?.[0] ??
                  state?.errors?.splits?.[0]}
              </FieldError>
            </Field>

            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-700"
              disabled={pending || !members.length}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {mode === "edit" ? "Save changes" : "Create recurring bill"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PostRecurringBillForm({
  groupId,
  recurringBillId,
}: {
  groupId: string
  recurringBillId: string
}) {
  const [state, action, pending] = useActionState(
    postRecurringBill,
    undefined as RecurringBillFormState
  )

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="recurringBillId" value={recurringBillId} />
      <Button
        type="submit"
        className="bg-zinc-900 hover:bg-zinc-700"
        disabled={pending}
      >
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <ReceiptTextIcon data-icon="inline-start" />
        )}
        Post expense
      </Button>
      {state?.errors?.form ? (
        <p className="text-xs text-red-600">{state.errors.form[0]}</p>
      ) : null}
      {state?.message ? (
        <p className="text-xs text-zinc-500">{state.message}</p>
      ) : null}
    </form>
  )
}

export function RecurringBillActions({
  groupId,
  recurringBillId,
  recurringBill,
  members,
  paused,
}: {
  groupId: string
  recurringBillId: string
  recurringBill: EditableRecurringBill
  members: MemberOption[]
  paused: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Recurring bill actions"
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditRecurringBillDialog
          groupId={groupId}
          members={members}
          recurringBill={recurringBill}
        />
        {paused ? (
          <form action={resumeRecurringBill}>
            <input type="hidden" name="groupId" value={groupId} />
            <input
              type="hidden"
              name="recurringBillId"
              value={recurringBillId}
            />
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full">
                <PlayIcon />
                Resume
              </button>
            </DropdownMenuItem>
          </form>
        ) : (
          <form action={pauseRecurringBill}>
            <input type="hidden" name="groupId" value={groupId} />
            <input
              type="hidden"
              name="recurringBillId"
              value={recurringBillId}
            />
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full">
                <PauseIcon />
                Pause
              </button>
            </DropdownMenuItem>
          </form>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <SkipForwardIcon />
              Skip once
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Skip this occurrence?</AlertDialogTitle>
              <AlertDialogDescription>
                The next due date will advance without creating an expense.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={skipRecurringBill}>
                <input type="hidden" name="groupId" value={groupId} />
                <input
                  type="hidden"
                  name="recurringBillId"
                  value={recurringBillId}
                />
                <AlertDialogAction type="submit">Skip once</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => event.preventDefault()}
            >
              <ArchiveIcon />
              Archive
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this recurring bill?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be hidden from recurring bills. Posted expenses stay in
                the ledger.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={archiveRecurringBill}>
                <input type="hidden" name="groupId" value={groupId} />
                <input
                  type="hidden"
                  name="recurringBillId"
                  value={recurringBillId}
                />
                <AlertDialogAction type="submit">Archive</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
