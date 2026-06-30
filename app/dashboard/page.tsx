import Link from "next/link"
import {
  AlertTriangleIcon,
  BellIcon,
  CircleDollarSignIcon,
  ReceiptTextIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AppShell } from "@/components/app/app-shell"
import { GroupAvatar } from "@/components/app/group-avatar"
import { CreateGroupDialog } from "@/components/app/group-forms"
import { RoleBadge } from "@/components/app/role-badge"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { getDashboardBudgetData } from "@/lib/budgets"
import { formatMoney, getDashboardExpenseData } from "@/lib/expenses"
import { getDashboardData } from "@/lib/groups"

export default async function DashboardPage() {
  const [data, expenseData, budgetData] = await Promise.all([
    getDashboardData(),
    getDashboardExpenseData(),
    getDashboardBudgetData(),
  ])

  if (!data) {
    return null
  }

  return (
    <AppShell user={data.user} pendingInvites={data.totals.pendingInvites}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-400">Overview</p>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
              Welcome back, @{data.user.username}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Here&apos;s what&apos;s happening across your groups.
            </p>
          </div>
          <CreateGroupDialog />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Net balance"
            value={formatMoney(expenseData?.totalNetCents ?? 0)}
            description={
              (expenseData?.totalNetCents ?? 0) > 0
                ? "You are owed across groups"
                : (expenseData?.totalNetCents ?? 0) < 0
                  ? "You owe across groups"
                  : "You are settled across groups"
            }
            icon={CircleDollarSignIcon}
            iconClass="bg-emerald-50 text-emerald-500"
          />
          <MetricCard
            title="Active groups"
            value={data.totals.groups}
            description="Groups you belong to or manage"
            icon={UsersIcon}
            iconClass="bg-violet-50 text-violet-500"
          />
          <MetricCard
            title="Invitations"
            value={data.totals.pendingInvites}
            description="Waiting for your response"
            icon={BellIcon}
            iconClass="bg-amber-50 text-amber-500"
          />
        </div>

        {/* Pending invitations banner */}
        {data.pendingInvites.length ? (
          <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <BellIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {data.pendingInvites.length} pending invitation
                  {data.pendingInvites.length === 1 ? "" : "s"}
                </p>
                <p className="text-sm text-zinc-500">
                  You have group invitations waiting for your response.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-zinc-900 hover:bg-zinc-700">
              <Link href="/invitations">Review invitations</Link>
            </Button>
          </div>
        ) : null}

        {budgetData?.overBudgetCount ? (
          <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <AlertTriangleIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {budgetData.overBudgetCount} budget
                  {budgetData.overBudgetCount === 1 ? "" : "s"} over limit
                </p>
                <p className="text-sm text-zinc-500">
                  Review group budgets and recent spending before adding more
                  costs.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-zinc-900 hover:bg-zinc-700">
              <Link href="/groups">Review groups</Link>
            </Button>
          </div>
        ) : null}

        {expenseData?.recentExpenses.length ? (
          <section className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-400">Expenses</p>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-zinc-900">
                Recent expenses
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Latest costs across your groups.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6">
              <div className="flex flex-col divide-y divide-zinc-100">
                {expenseData.recentExpenses.map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/groups/${expense.groupId}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                        <ReceiptTextIcon className="size-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {expense.title}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {expense.group.name} · paid by @
                          {expense.paidByMember.user.username}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-zinc-900">
                      {formatMoney(expense.amountCents, expense.currencyCode)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Recent groups */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-400">Groups</p>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-zinc-900">
                Recent groups
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Shared spaces where expenses will live.
              </p>
            </div>
            {data.groups.length ? (
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/groups">View all</Link>
              </Button>
            ) : null}
          </div>

          {data.groups.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.groups
                .slice(0, 6)
                .map(({ group, membership, memberCount }) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    description={group.description ?? null}
                    memberCount={memberCount}
                    role={membership.role}
                    netCents={
                      expenseData?.groupSummaries.find(
                        (summary) => summary.group.id === group.id
                      )?.netCents ?? 0
                    }
                    budget={
                      budgetData?.groupBudgetSummaries.find(
                        (summary) => summary.group.id === group.id
                      )?.overallBudget ?? null
                    }
                    currencyCode={group.currencyCode}
                  />
                ))}
            </div>
          ) : (
            <Empty className="rounded-3xl border border-dashed border-zinc-200/80 bg-white">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>No groups yet</EmptyTitle>
                <EmptyDescription>
                  Create your first group to start tracking shared expenses.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <CreateGroupDialog />
              </EmptyContent>
            </Empty>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-400">{title}</p>
          <p className="font-heading text-3xl font-bold tracking-[-0.03em] text-zinc-900">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl",
            iconClass
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  )
}

function GroupCard({
  id,
  name,
  description,
  memberCount,
  role,
  netCents,
  budget,
  currencyCode,
}: {
  id: string
  name: string
  description: string | null
  memberCount: number
  role: "owner" | "admin" | "member"
  netCents: number
  budget: {
    spentCents: number
    usedPercent: number
    progressPercent: number
    tone: "normal" | "warning" | "over"
    budget: { amountCents: number; currencyCode: string }
  } | null
  currencyCode: string
}) {
  const progressClass =
    budget?.tone === "over"
      ? "bg-red-500"
      : budget?.tone === "warning"
        ? "bg-amber-500"
        : "bg-zinc-900"

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white p-6 transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex items-start gap-3">
        <GroupAvatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-heading text-[0.95rem] leading-snug font-semibold text-zinc-900">
              {name}
            </p>
            <RoleBadge role={role} />
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      {description ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : (
        <p className="text-sm text-zinc-400">No description yet.</p>
      )}
      <div className="rounded-2xl bg-zinc-50 p-3">
        <p className="text-xs font-medium text-zinc-400">Your balance</p>
        <p className="mt-1 text-sm font-semibold text-zinc-900">
          {formatMoney(netCents, currencyCode)}
        </p>
      </div>
      {budget ? (
        <div className="rounded-2xl bg-zinc-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-zinc-400">Budget</p>
            <p className="text-xs font-medium text-zinc-500">
              {budget.usedPercent}% used
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className={`h-full rounded-full ${progressClass}`}
              style={{ width: `${budget.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {formatMoney(budget.spentCents, budget.budget.currencyCode)} of{" "}
            {formatMoney(budget.budget.amountCents, budget.budget.currencyCode)}
          </p>
        </div>
      ) : null}
      <Button asChild variant="outline" className="w-full">
        <Link href={`/groups/${id}`}>Open group</Link>
      </Button>
    </div>
  )
}
