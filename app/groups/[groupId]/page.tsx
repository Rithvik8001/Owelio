import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
  AlertTriangleIcon,
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  InboxIcon,
  ReceiptTextIcon,
  ScaleIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import {
  BudgetActions,
  CreateBudgetDialog,
  type EditableBudget,
} from "@/components/app/budget-forms"
import {
  CreateExpenseDialog,
  DeleteSettlementButton,
  ExpenseActions,
  RecordSettlementDialog,
} from "@/components/app/expense-forms"
import { GroupAvatar } from "@/components/app/group-avatar"
import {
  InviteMemberDialog,
  LeaveGroupButton,
  MemberActions,
  RevokeInvitationButton,
} from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import { UserAvatar } from "@/components/app/user-avatar"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  canMutateLedgerRecord,
  categoryLabel,
  dateInputValue,
  formatMoney,
  getGroupExpenseData,
} from "@/lib/expenses"
import { getGroupBudgetData, type BudgetProgress } from "@/lib/budgets"
import {
  getGroupDetail,
  getPendingInvitationsForCurrentUser,
} from "@/lib/groups"

type GroupExpenseData = NonNullable<
  Awaited<ReturnType<typeof getGroupExpenseData>>
>

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [detail, expenseData, budgetData, pendingForUser] = await Promise.all([
    getGroupDetail(groupId),
    getGroupExpenseData(groupId),
    getGroupBudgetData(groupId),
    getPendingInvitationsForCurrentUser(),
  ])

  if (!detail || !expenseData || !budgetData) {
    notFound()
  }

  const canManage =
    detail.currentMembership.role === "owner" ||
    detail.currentMembership.role === "admin"
  const isOwner = detail.currentMembership.role === "owner"
  const canArchive = isOwner && detail.activeMemberCount === 1
  const activeMemberOptions = expenseData.activeMembers.map((member) => ({
    id: member.id,
    username: member.user.username,
    email: member.user.email,
  }))
  const allMemberOptions = expenseData.members.map((member) => ({
    id: member.id,
    username: member.user.username,
    email: member.user.email,
  }))
  const currentBalance =
    expenseData.balances.find(
      (row) => row.member.id === detail.currentMembership.id
    )?.netCents ?? 0

  return (
    <AppShell user={detail.currentUser} pendingInvites={pendingForUser.length}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-full border border-dashed border-zinc-300 bg-zinc-50/80 p-1.5">
              <GroupAvatar name={detail.group.name} size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={detail.currentMembership.role} />
              <CreateExpenseDialog
                groupId={detail.group.id}
                members={activeMemberOptions}
              />
              {canManage ? (
                <InviteMemberDialog groupId={detail.group.id} />
              ) : null}
              <LeaveGroupButton
                groupId={detail.group.id}
                isOwner={isOwner}
                canArchive={canArchive}
              />
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 text-xs font-medium text-zinc-400">Group</p>
            <h1 className="truncate font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
              {detail.group.name}
            </h1>
            {detail.group.description ? (
              <p className="mt-1.5 max-w-2xl text-sm text-zinc-500">
                {detail.group.description}
              </p>
            ) : null}
          </div>
        </div>

        {isOwner && !canArchive ? (
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
            <h2 className="font-heading text-base font-semibold text-zinc-900">
              Ownership required
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Transfer ownership before leaving this group.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
            label="Your balance"
            value={formatMoney(currentBalance, detail.group.currencyCode)}
            tone={currentBalance}
            text
          />
          <SummaryCard
            label="Expenses"
            value={expenseData.activeExpenses.length}
          />
          <SummaryCard
            label="Open transfers"
            value={expenseData.settlementSuggestions.length}
          />
          <SummaryCard label="Members" value={detail.activeMemberCount} />
        </div>

        <Tabs defaultValue="overview" className="flex flex-col gap-6">
          <div className="overflow-x-auto">
            <TabsList className="!h-auto w-fit gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 p-1.5">
              <TabsTrigger
                value="overview"
                className="!h-auto rounded-full border border-dashed border-zinc-300 px-5 py-2 text-sm font-medium whitespace-nowrap text-zinc-500 data-active:!border-solid data-active:!border-transparent data-active:!bg-zinc-900 data-active:!text-white data-active:!shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="!h-auto rounded-full border border-dashed border-zinc-300 px-5 py-2 text-sm font-medium whitespace-nowrap text-zinc-500 data-active:!border-solid data-active:!border-transparent data-active:!bg-zinc-900 data-active:!text-white data-active:!shadow-none"
              >
                Expenses
              </TabsTrigger>
              <TabsTrigger
                value="balances"
                className="!h-auto rounded-full border border-dashed border-zinc-300 px-5 py-2 text-sm font-medium whitespace-nowrap text-zinc-500 data-active:!border-solid data-active:!border-transparent data-active:!bg-zinc-900 data-active:!text-white data-active:!shadow-none"
              >
                Balances
              </TabsTrigger>
              <TabsTrigger
                value="budgets"
                className="!h-auto rounded-full border border-dashed border-zinc-300 px-5 py-2 text-sm font-medium whitespace-nowrap text-zinc-500 data-active:!border-solid data-active:!border-transparent data-active:!bg-zinc-900 data-active:!text-white data-active:!shadow-none"
              >
                Budgets
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="!h-auto rounded-full border border-dashed border-zinc-300 px-5 py-2 text-sm font-medium whitespace-nowrap text-zinc-500 data-active:!border-solid data-active:!border-transparent data-active:!bg-zinc-900 data-active:!text-white data-active:!shadow-none"
              >
                Members
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex flex-col gap-4">
            <SectionHeader
              label="Overview"
              title="Group activity"
              description="Recent expenses and the shortest path to settle up."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-400">
                      Recent expenses
                    </p>
                    <h2 className="font-heading text-lg font-semibold text-zinc-900">
                      Latest costs
                    </h2>
                  </div>
                  <ReceiptTextIcon className="size-5 text-zinc-400" />
                </div>
                {expenseData.activeExpenses.length ? (
                  <div className="flex flex-col divide-y divide-zinc-100">
                    {expenseData.activeExpenses.slice(0, 5).map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">
                            {expense.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Paid by @{expense.paidByMember.user.username} ·{" "}
                            {format(expense.expenseDate, "MMM d")}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-zinc-900">
                          {formatMoney(
                            expense.amountCents,
                            expense.currencyCode
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    No expenses have been added yet.
                  </p>
                )}
              </div>
              <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-400">
                      Settlement plan
                    </p>
                    <h2 className="font-heading text-lg font-semibold text-zinc-900">
                      Fewer payments
                    </h2>
                  </div>
                  <ScaleIcon className="size-5 text-zinc-400" />
                </div>
                <SettlementSuggestions
                  groupId={detail.group.id}
                  suggestions={expenseData.settlementSuggestions}
                  members={activeMemberOptions}
                  currencyCode={detail.group.currencyCode}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                label="Expenses"
                title="Logged costs"
                description="Every expense updates balances immediately."
              />
              <CreateExpenseDialog
                groupId={detail.group.id}
                members={activeMemberOptions}
              />
            </div>
            <ExpensesTable
              groupId={detail.group.id}
              expenses={expenseData.activeExpenses}
              members={allMemberOptions}
              activeMembers={activeMemberOptions}
              currentUserId={detail.currentUser.id}
              currentRole={detail.currentMembership.role}
            />
          </TabsContent>

          <TabsContent value="balances" className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                label="Balances"
                title="Who owes what"
                description="Balances are derived from active expenses and settlements."
              />
              <RecordSettlementDialog
                groupId={detail.group.id}
                members={activeMemberOptions}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BalancesList
                balances={expenseData.balances}
                currencyCode={detail.group.currencyCode}
              />
              <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
                <p className="mb-1 text-xs font-medium text-zinc-400">
                  Suggestions
                </p>
                <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">
                  Settle up
                </h2>
                <SettlementSuggestions
                  groupId={detail.group.id}
                  suggestions={expenseData.settlementSuggestions}
                  members={activeMemberOptions}
                  currencyCode={detail.group.currencyCode}
                />
              </div>
            </div>
            <SettlementHistory
              groupId={detail.group.id}
              settlements={expenseData.activeSettlements}
              currentUserId={detail.currentUser.id}
              currentRole={detail.currentMembership.role}
            />
          </TabsContent>

          <TabsContent value="budgets" className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                label="Budgets"
                title="Spending plans"
                description="Optional limits for trips, events, and shared goals."
              />
              {canManage ? (
                <CreateBudgetDialog groupId={detail.group.id} />
              ) : null}
            </div>
            <BudgetsSection
              groupId={detail.group.id}
              budgets={budgetData.budgetProgress}
              canManage={canManage}
            />
          </TabsContent>

          <TabsContent value="members" className="flex flex-col gap-4">
            <MembersSection
              detail={detail}
              canManage={canManage}
              activeMemberCount={detail.activeMemberCount}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
      <h2 className="font-heading text-xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  text,
  tone,
}: {
  label: string
  value: number | string
  text?: boolean
  tone?: number
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
      <p className="mb-1.5 text-xs font-medium text-zinc-400">{label}</p>
      <p
        className={
          text
            ? `truncate font-heading text-xl font-bold tracking-tight ${
                typeof tone === "number" && tone > 0
                  ? "text-emerald-600"
                  : typeof tone === "number" && tone < 0
                    ? "text-red-600"
                    : "text-zinc-900"
              }`
            : "font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900"
        }
      >
        {value}
      </p>
      {typeof tone === "number" ? (
        <p
          className={`mt-1 text-xs ${
            tone > 0
              ? "text-emerald-600"
              : tone < 0
                ? "text-red-600"
                : "text-zinc-400"
          }`}
        >
          {tone > 0 ? "You are owed" : tone < 0 ? "You owe" : "Settled up"}
        </p>
      ) : null}
    </div>
  )
}

function amountInputValue(cents: number) {
  const dollars = Math.floor(cents / 100)
  const remainder = String(cents % 100).padStart(2, "0")
  return `${dollars}.${remainder}`
}

function percentageInputValue(basisPoints: number | null) {
  if (basisPoints === null) return ""
  const whole = Math.floor(basisPoints / 100)
  const fraction = basisPoints % 100
  return fraction ? `${whole}.${String(fraction).padStart(2, "0")}` : `${whole}`
}

function dateValue(date: Date | null) {
  return date ? dateInputValue(date) : ""
}

function budgetDateRange(row: BudgetProgress) {
  if (!row.budget.startsAt && !row.budget.endsAt) {
    return "All time"
  }
  if (row.budget.startsAt && row.budget.endsAt) {
    return `${format(row.budget.startsAt, "MMM d, yyyy")} - ${format(
      row.budget.endsAt,
      "MMM d, yyyy"
    )}`
  }
  if (row.budget.startsAt) {
    return `From ${format(row.budget.startsAt, "MMM d, yyyy")}`
  }
  return `Until ${format(row.budget.endsAt!, "MMM d, yyyy")}`
}

function budgetScopeLabel(row: BudgetProgress) {
  return row.budget.category ? categoryLabel(row.budget.category) : "Overall"
}

function editableBudget(row: BudgetProgress): EditableBudget {
  return {
    id: row.budget.id,
    name: row.budget.name,
    scope: row.budget.category ? "category" : "overall",
    category: row.budget.category ?? "",
    amount: amountInputValue(row.budget.amountCents),
    startsAt: dateValue(row.budget.startsAt),
    endsAt: dateValue(row.budget.endsAt),
  }
}

function BudgetsSection({
  groupId,
  budgets,
  canManage,
}: {
  groupId: string
  budgets: BudgetProgress[]
  canManage: boolean
}) {
  if (!budgets.length) {
    return (
      <Empty className="rounded-3xl border border-dashed border-zinc-200/80 bg-white">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WalletIcon />
          </EmptyMedia>
          <EmptyTitle>No budgets yet</EmptyTitle>
          <EmptyDescription>
            Add an optional budget for a trip, event, or shared spending plan.
          </EmptyDescription>
        </EmptyHeader>
        {canManage ? (
          <EmptyContent>
            <CreateBudgetDialog groupId={groupId} />
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {budgets.map((row) => (
        <BudgetCard
          key={row.budget.id}
          groupId={groupId}
          row={row}
          canManage={canManage}
        />
      ))}
    </div>
  )
}

function BudgetCard({
  groupId,
  row,
  canManage,
}: {
  groupId: string
  row: BudgetProgress
  canManage: boolean
}) {
  const remainingLabel =
    row.remainingCents >= 0
      ? `${formatMoney(row.remainingCents, row.budget.currencyCode)} left`
      : `${formatMoney(Math.abs(row.remainingCents), row.budget.currencyCode)} over`
  const progressClass =
    row.tone === "over"
      ? "bg-red-500"
      : row.tone === "warning"
        ? "bg-amber-500"
        : "bg-zinc-900"
  const textClass =
    row.tone === "over"
      ? "text-red-600"
      : row.tone === "warning"
        ? "text-amber-600"
        : "text-zinc-500"

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium text-zinc-400">
            {budgetScopeLabel(row)}
          </p>
          <h2 className="truncate font-heading text-lg font-semibold text-zinc-900">
            {row.budget.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{budgetDateRange(row)}</p>
        </div>
        {canManage ? (
          <BudgetActions groupId={groupId} budget={editableBudget(row)} />
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-400">Spent</p>
          <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-zinc-900">
            {formatMoney(row.spentCents, row.budget.currencyCode)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-400">Budget</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {formatMoney(row.budget.amountCents, row.budget.currencyCode)}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full ${progressClass}`}
          style={{ width: `${row.progressPercent}%` }}
        />
      </div>
      <div className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className={textClass}>
          {row.usedPercent}% used · {remainingLabel}
        </span>
        {row.tone !== "normal" ? (
          <span className={`flex items-center gap-1 ${textClass}`}>
            <AlertTriangleIcon className="size-4" />
            {row.tone === "over" ? "Over budget" : "Close to limit"}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function ExpensesTable({
  groupId,
  expenses,
  members,
  activeMembers,
  currentUserId,
  currentRole,
}: {
  groupId: string
  expenses: GroupExpenseData["activeExpenses"]
  members: { id: string; username: string; email: string }[]
  activeMembers: { id: string; username: string; email: string }[]
  currentUserId: string
  currentRole: "owner" | "admin" | "member"
}) {
  if (!expenses.length) {
    return (
      <Empty className="rounded-3xl border border-dashed border-zinc-200/80 bg-white">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ReceiptTextIcon />
          </EmptyMedia>
          <EmptyTitle>No expenses yet</EmptyTitle>
          <EmptyDescription>
            Add the first shared cost to start the ledger.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateExpenseDialog groupId={groupId} members={activeMembers} />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Expense</TableHead>
            <TableHead>Paid by</TableHead>
            <TableHead>Split</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const editableExpense = {
              id: expense.id,
              title: expense.title,
              description: expense.description,
              amount: amountInputValue(expense.amountCents),
              category: expense.category,
              paidByMemberId: expense.paidByMemberId,
              expenseDate: dateInputValue(expense.expenseDate),
              splitMethod: expense.splitMethod,
              splits: expense.splits.map((split) => ({
                memberId: split.groupMemberId,
                checked: true,
                value:
                  expense.splitMethod === "percentage"
                    ? percentageInputValue(split.percentageBasisPoints)
                    : amountInputValue(split.owedCents),
              })),
            }
            const canMutate = canMutateLedgerRecord({
              currentUserId,
              currentRole,
              createdById: expense.createdById,
            })
            return (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="min-w-56">
                    <div className="font-medium text-zinc-900">
                      {expense.title}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {categoryLabel(expense.category)} ·{" "}
                      {format(expense.expenseDate, "MMM d, yyyy")}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {expense.splits
                        .map(
                          (split) =>
                            `@${split.member.user.username} ${formatMoney(
                              split.owedCents,
                              expense.currencyCode
                            )}`
                        )
                        .join(" · ")}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-zinc-900">
                    @{expense.paidByMember.user.username}
                  </div>
                  {expense.paidByMember.user.username !==
                  expense.createdBy.username ? (
                    <div className="text-xs text-zinc-500">
                      by @{expense.createdBy.username}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{expense.splitMethod}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-zinc-900">
                  {formatMoney(expense.amountCents, expense.currencyCode)}
                </TableCell>
                <TableCell>
                  <ExpenseActions
                    groupId={groupId}
                    expenseId={expense.id}
                    canMutate={canMutate}
                    members={members}
                    expense={editableExpense}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function BalancesList({
  balances,
  currencyCode,
}: {
  balances: GroupExpenseData["balances"]
  currencyCode: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
      <p className="mb-1 text-xs font-medium text-zinc-400">Ledger</p>
      <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">
        Member balances
      </h2>
      <div className="flex flex-col divide-y divide-zinc-100">
        {balances.map((row) => (
          <div
            key={row.member.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar username={row.member.user.username} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-900">
                  @{row.member.user.username}
                </div>
                <div className="text-xs text-zinc-500">
                  Paid {formatMoney(row.paidCents, currencyCode)} · owes{" "}
                  {formatMoney(row.owedCents, currencyCode)}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div
                className={`text-sm font-semibold ${
                  row.netCents > 0
                    ? "text-emerald-600"
                    : row.netCents < 0
                      ? "text-red-600"
                      : "text-zinc-400"
                }`}
              >
                {formatMoney(row.netCents, currencyCode)}
              </div>
              <div
                className={`flex items-center justify-end gap-1 text-xs ${
                  row.netCents > 0
                    ? "text-emerald-600"
                    : row.netCents < 0
                      ? "text-red-600"
                      : "text-zinc-400"
                }`}
              >
                {row.netCents > 0 ? (
                  <ArrowUpRightIcon className="size-3" />
                ) : row.netCents < 0 ? (
                  <ArrowDownLeftIcon className="size-3" />
                ) : null}
                {row.netCents > 0
                  ? "is owed"
                  : row.netCents < 0
                    ? "owes"
                    : "settled"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettlementSuggestions({
  groupId,
  suggestions,
  members,
  currencyCode,
}: {
  groupId: string
  suggestions: GroupExpenseData["settlementSuggestions"]
  members: { id: string; username: string; email: string }[]
  currencyCode: string
}) {
  if (!suggestions.length) {
    return <p className="text-sm text-zinc-500">Everyone is settled up.</p>
  }

  const memberMap = new Map(members.map((member) => [member.id, member]))
  return (
    <div className="flex flex-col gap-3">
      {suggestions.map((suggestion) => {
        const from = memberMap.get(suggestion.fromMemberId)
        const to = memberMap.get(suggestion.toMemberId)
        if (!from || !to) return null
        return (
          <div
            key={`${suggestion.fromMemberId}-${suggestion.toMemberId}-${suggestion.amountCents}`}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-medium text-zinc-900">
                  @{from.username}
                </span>
                <ArrowRightIcon className="size-3 shrink-0 text-zinc-400" />
                <span className="font-medium text-zinc-900">
                  @{to.username}
                </span>
              </div>
              <div className="mt-0.5 text-sm font-semibold text-zinc-900">
                {formatMoney(suggestion.amountCents, currencyCode)}
              </div>
            </div>
            <RecordSettlementDialog
              groupId={groupId}
              members={members}
              defaultFromMemberId={suggestion.fromMemberId}
              defaultToMemberId={suggestion.toMemberId}
              defaultAmount={amountInputValue(suggestion.amountCents)}
            />
          </div>
        )
      })}
    </div>
  )
}

function SettlementHistory({
  groupId,
  settlements,
  currentUserId,
  currentRole,
}: {
  groupId: string
  settlements: GroupExpenseData["activeSettlements"]
  currentUserId: string
  currentRole: "owner" | "admin" | "member"
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
      <p className="mb-1 text-xs font-medium text-zinc-400">History</p>
      <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">
        Recorded settlements
      </h2>
      {settlements.length ? (
        <div className="flex flex-col divide-y divide-zinc-100">
          {settlements.map((settlement) => {
            const canMutate = canMutateLedgerRecord({
              currentUserId,
              currentRole,
              createdById: settlement.createdById,
            })
            return (
              <div
                key={settlement.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-zinc-900">
                    <span className="font-medium">
                      @{settlement.fromMember.user.username}
                    </span>{" "}
                    paid{" "}
                    <span className="font-medium">
                      @{settlement.toMember.user.username}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {format(settlement.settledDate, "MMM d, yyyy")} · recorded
                    by @{settlement.createdBy.username}
                    {settlement.note ? ` · ${settlement.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="text-sm font-semibold text-zinc-900">
                    {formatMoney(
                      settlement.amountCents,
                      settlement.currencyCode
                    )}
                  </span>
                  <DeleteSettlementButton
                    groupId={groupId}
                    settlementId={settlement.id}
                    canMutate={canMutate}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No settlements recorded yet.</p>
      )}
    </div>
  )
}

function MembersSection({
  detail,
  canManage,
  activeMemberCount,
}: {
  detail: NonNullable<Awaited<ReturnType<typeof getGroupDetail>>>
  canManage: boolean
  activeMemberCount: number
}) {
  return (
    <>
      <SectionHeader
        label="Members"
        title="People and invitations"
        description="Roles control who can manage members and group data."
      />
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-zinc-900">
              Members
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Roles control who can manage the group.
            </p>
          </div>
          <Badge variant="secondary">
            <UsersIcon data-icon="inline-start" />
            {activeMemberCount}
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex min-w-52 items-center gap-3">
                    <UserAvatar username={member.user.username} />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-zinc-900">
                        @{member.user.username}
                      </div>
                      <div className="truncate text-xs text-zinc-500">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === "active" ? "secondary" : "outline"
                    }
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500">
                  {format(member.joinedAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <MemberActions
                    groupId={detail.group.id}
                    memberId={member.id}
                    memberRole={member.role}
                    memberName={`@${member.user.username}`}
                    currentUserRole={detail.currentMembership.role}
                    isCurrentUser={member.userId === detail.currentUser.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">
          Pending invitations
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Links expire after seven days and can be revoked by managers.
        </p>
        <div className="mt-4">
          {detail.pendingInvitations.length ? (
            <div className="flex flex-col gap-3">
              {detail.pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-900">
                      {invitation.email}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Invited by @{invitation.invitedBy.username} · expires{" "}
                      {format(invitation.expiresAt, "MMM d")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={invitation.role} />
                    {canManage ? (
                      <RevokeInvitationButton
                        groupId={detail.group.id}
                        invitationId={invitation.id}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border border-dashed border-zinc-200/80">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No pending invitations</EmptyTitle>
                <EmptyDescription>
                  Invite links you create will appear here until accepted or
                  revoked.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </>
  )
}
