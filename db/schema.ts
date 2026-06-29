import { relations, sql } from "drizzle-orm"
import {
  integer,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const groupRoleEnum = pgEnum("group_role", ["owner", "admin", "member"])
export const groupMemberStatusEnum = pgEnum("group_member_status", [
  "active",
  "inactive",
])
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
])
export const expenseCategoryEnum = pgEnum("expense_category", [
  "dining",
  "groceries",
  "transportation",
  "lodging",
  "utilities",
  "entertainment",
  "shopping",
  "health",
  "education",
  "services",
  "travel",
  "other",
])
export const expenseSplitMethodEnum = pgEnum("expense_split_method", [
  "equal",
  "exact",
  "percentage",
])

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    currencyCode: text("currency_code").notNull().default("USD"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [
    index("groups_owner_id_idx").on(table.ownerId),
    index("groups_created_by_id_idx").on(table.createdById),
  ]
)

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: expenseCategoryEnum("category").notNull().default("other"),
    amountCents: integer("amount_cents").notNull(),
    currencyCode: text("currency_code").notNull(),
    paidByMemberId: uuid("paid_by_member_id")
      .notNull()
      .references(() => groupMembers.id, { onDelete: "restrict" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    expenseDate: timestamp("expense_date").notNull(),
    splitMethod: expenseSplitMethodEnum("split_method").notNull(),
    deletedAt: timestamp("deleted_at"),
    deletedById: uuid("deleted_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("expenses_group_date_idx").on(table.groupId, table.expenseDate),
    index("expenses_group_deleted_idx").on(table.groupId, table.deletedAt),
    index("expenses_paid_by_member_idx").on(table.paidByMemberId),
    index("expenses_created_by_idx").on(table.createdById),
  ]
)

export const expenseSplits = pgTable(
  "expense_splits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    groupMemberId: uuid("group_member_id")
      .notNull()
      .references(() => groupMembers.id, { onDelete: "restrict" }),
    owedCents: integer("owed_cents").notNull(),
    percentageBasisPoints: integer("percentage_basis_points"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("expense_splits_expense_member_unique").on(
      table.expenseId,
      table.groupMemberId
    ),
    index("expense_splits_member_idx").on(table.groupMemberId),
  ]
)

export const settlements = pgTable(
  "settlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    fromMemberId: uuid("from_member_id")
      .notNull()
      .references(() => groupMembers.id, { onDelete: "restrict" }),
    toMemberId: uuid("to_member_id")
      .notNull()
      .references(() => groupMembers.id, { onDelete: "restrict" }),
    amountCents: integer("amount_cents").notNull(),
    currencyCode: text("currency_code").notNull(),
    note: text("note"),
    settledDate: timestamp("settled_date").notNull(),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    deletedAt: timestamp("deleted_at"),
    deletedById: uuid("deleted_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("settlements_group_date_idx").on(table.groupId, table.settledDate),
    index("settlements_group_deleted_idx").on(table.groupId, table.deletedAt),
    index("settlements_from_member_idx").on(table.fromMemberId),
    index("settlements_to_member_idx").on(table.toMemberId),
    index("settlements_created_by_idx").on(table.createdById),
  ]
)

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: groupRoleEnum("role").notNull().default("member"),
    status: groupMemberStatusEnum("status").notNull().default("active"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    leftAt: timestamp("left_at"),
    removedAt: timestamp("removed_at"),
    removedById: uuid("removed_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("group_members_group_user_unique").on(table.groupId, table.userId),
    uniqueIndex("group_members_one_active_owner_idx")
      .on(table.groupId)
      .where(sql`${table.role} = 'owner' and ${table.status} = 'active'`),
    index("group_members_group_id_idx").on(table.groupId),
    index("group_members_user_status_idx").on(table.userId, table.status),
  ]
)

export const groupInvitations = pgTable(
  "group_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: groupRoleEnum("role").notNull().default("member"),
    tokenHash: text("token_hash").notNull().unique(),
    status: invitationStatusEnum("status").notNull().default("pending"),
    invitedById: uuid("invited_by_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    acceptedById: uuid("accepted_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("group_invitations_pending_group_email_unique")
      .on(table.groupId, table.email)
      .where(sql`${table.status} = 'pending'`),
    index("group_invitations_email_status_idx").on(table.email, table.status),
    index("group_invitations_group_status_idx").on(table.groupId, table.status),
    index("group_invitations_token_hash_idx").on(table.tokenHash),
  ]
)

export const profilesRelations = relations(profiles, ({ many }) => ({
  ownedGroups: many(groups, { relationName: "groupOwner" }),
  createdGroups: many(groups, { relationName: "groupCreator" }),
  memberships: many(groupMembers),
  sentInvitations: many(groupInvitations, { relationName: "inviter" }),
  acceptedInvitations: many(groupInvitations, { relationName: "acceptedBy" }),
  createdExpenses: many(expenses),
  createdSettlements: many(settlements),
}))

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [groups.ownerId],
    references: [profiles.id],
    relationName: "groupOwner",
  }),
  createdBy: one(profiles, {
    fields: [groups.createdById],
    references: [profiles.id],
    relationName: "groupCreator",
  }),
  members: many(groupMembers),
  invitations: many(groupInvitations),
  expenses: many(expenses),
  settlements: many(settlements),
}))

export const groupMembersRelations = relations(groupMembers, ({ one, many }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(profiles, {
    fields: [groupMembers.userId],
    references: [profiles.id],
  }),
  removedBy: one(profiles, {
    fields: [groupMembers.removedById],
    references: [profiles.id],
  }),
  paidExpenses: many(expenses),
  expenseSplits: many(expenseSplits),
  settlementsSent: many(settlements, { relationName: "settlementFrom" }),
  settlementsReceived: many(settlements, { relationName: "settlementTo" }),
}))

export const groupInvitationsRelations = relations(
  groupInvitations,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupInvitations.groupId],
      references: [groups.id],
    }),
    invitedBy: one(profiles, {
      fields: [groupInvitations.invitedById],
      references: [profiles.id],
      relationName: "inviter",
    }),
    acceptedBy: one(profiles, {
      fields: [groupInvitations.acceptedById],
      references: [profiles.id],
      relationName: "acceptedBy",
    }),
  })
)

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id],
  }),
  paidByMember: one(groupMembers, {
    fields: [expenses.paidByMemberId],
    references: [groupMembers.id],
  }),
  createdBy: one(profiles, {
    fields: [expenses.createdById],
    references: [profiles.id],
  }),
  deletedBy: one(profiles, {
    fields: [expenses.deletedById],
    references: [profiles.id],
  }),
  splits: many(expenseSplits),
}))

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  member: one(groupMembers, {
    fields: [expenseSplits.groupMemberId],
    references: [groupMembers.id],
  }),
}))

export const settlementsRelations = relations(settlements, ({ one }) => ({
  group: one(groups, {
    fields: [settlements.groupId],
    references: [groups.id],
  }),
  fromMember: one(groupMembers, {
    fields: [settlements.fromMemberId],
    references: [groupMembers.id],
    relationName: "settlementFrom",
  }),
  toMember: one(groupMembers, {
    fields: [settlements.toMemberId],
    references: [groupMembers.id],
    relationName: "settlementTo",
  }),
  createdBy: one(profiles, {
    fields: [settlements.createdById],
    references: [profiles.id],
  }),
  deletedBy: one(profiles, {
    fields: [settlements.deletedById],
    references: [profiles.id],
  }),
}))
