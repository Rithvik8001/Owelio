CREATE TYPE "public"."group_member_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."group_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TABLE "group_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "group_role" DEFAULT 'member' NOT NULL,
	"token_hash" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by_id" uuid NOT NULL,
	"accepted_by_id" uuid,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "group_role" DEFAULT 'member' NOT NULL,
	"status" "group_member_status" DEFAULT 'active' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"removed_at" timestamp,
	"removed_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_unique" ON "profiles" USING btree ("username");--> statement-breakpoint
ALTER TABLE "group_invitations" ADD CONSTRAINT "group_invitations_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_invitations" ADD CONSTRAINT "group_invitations_invited_by_id_profiles_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_invitations" ADD CONSTRAINT "group_invitations_accepted_by_id_profiles_id_fk" FOREIGN KEY ("accepted_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_removed_by_id_profiles_id_fk" FOREIGN KEY ("removed_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_id_profiles_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "group_invitations_pending_group_email_unique" ON "group_invitations" USING btree ("group_id","email") WHERE "group_invitations"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "group_invitations_email_status_idx" ON "group_invitations" USING btree ("email","status");--> statement-breakpoint
CREATE INDEX "group_invitations_group_status_idx" ON "group_invitations" USING btree ("group_id","status");--> statement-breakpoint
CREATE INDEX "group_invitations_token_hash_idx" ON "group_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_group_user_unique" ON "group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_one_active_owner_idx" ON "group_members" USING btree ("group_id") WHERE "group_members"."role" = 'owner' and "group_members"."status" = 'active';--> statement-breakpoint
CREATE INDEX "group_members_group_id_idx" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "group_members_user_status_idx" ON "group_members" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "groups_owner_id_idx" ON "groups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "groups_created_by_id_idx" ON "groups" USING btree ("created_by_id");--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "groups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "group_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "group_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "profiles" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "groups" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "group_members" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "group_invitations" TO authenticated;--> statement-breakpoint
CREATE POLICY "Users can view their own profile."
ON "profiles" FOR SELECT
TO authenticated
USING ((select auth.uid()) = "id");--> statement-breakpoint
CREATE POLICY "Users can create their own profile."
ON "profiles" FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = "id");--> statement-breakpoint
CREATE POLICY "Users can update their own profile."
ON "profiles" FOR UPDATE
TO authenticated
USING ((select auth.uid()) = "id")
WITH CHECK ((select auth.uid()) = "id");--> statement-breakpoint
CREATE POLICY "Active members can view their groups."
ON "groups" FOR SELECT
TO authenticated
USING (
  "archived_at" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "group_members"
    WHERE "group_members"."group_id" = "groups"."id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);--> statement-breakpoint
CREATE POLICY "Active members can view group memberships."
ON "group_members" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "group_members" AS "viewer_membership"
    WHERE "viewer_membership"."group_id" = "group_members"."group_id"
      AND "viewer_membership"."user_id" = (select auth.uid())
      AND "viewer_membership"."status" = 'active'
  )
);--> statement-breakpoint
CREATE POLICY "Invitees and managers can view invitations."
ON "group_invitations" FOR SELECT
TO authenticated
USING (
  lower("email") = lower((select auth.jwt() ->> 'email'))
  OR EXISTS (
    SELECT 1
    FROM "group_members"
    WHERE "group_members"."group_id" = "group_invitations"."group_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
      AND "group_members"."role" IN ('owner', 'admin')
  )
);
