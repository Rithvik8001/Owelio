import { relations, sql } from "drizzle-orm"
import {
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [
    index("groups_owner_id_idx").on(table.ownerId),
    index("groups_created_by_id_idx").on(table.createdById),
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
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
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
