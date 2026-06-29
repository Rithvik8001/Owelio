CREATE TYPE "public"."expense_category" AS ENUM('dining', 'groceries', 'transportation', 'lodging', 'utilities', 'entertainment', 'shopping', 'health', 'education', 'services', 'travel', 'other');--> statement-breakpoint
CREATE TYPE "public"."expense_split_method" AS ENUM('equal', 'exact', 'percentage');--> statement-breakpoint
CREATE TABLE "expense_splits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_id" uuid NOT NULL,
	"group_member_id" uuid NOT NULL,
	"owed_cents" integer NOT NULL,
	"percentage_basis_points" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "expense_category" DEFAULT 'other' NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency_code" text NOT NULL,
	"paid_by_member_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"expense_date" timestamp NOT NULL,
	"split_method" "expense_split_method" NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"from_member_id" uuid NOT NULL,
	"to_member_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency_code" text NOT NULL,
	"note" text,
	"settled_date" timestamp NOT NULL,
	"created_by_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_group_member_id_group_members_id_fk" FOREIGN KEY ("group_member_id") REFERENCES "public"."group_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_member_id_group_members_id_fk" FOREIGN KEY ("paid_by_member_id") REFERENCES "public"."group_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_id_profiles_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_deleted_by_id_profiles_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_from_member_id_group_members_id_fk" FOREIGN KEY ("from_member_id") REFERENCES "public"."group_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_to_member_id_group_members_id_fk" FOREIGN KEY ("to_member_id") REFERENCES "public"."group_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_created_by_id_profiles_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_deleted_by_id_profiles_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "expense_splits_expense_member_unique" ON "expense_splits" USING btree ("expense_id","group_member_id");--> statement-breakpoint
CREATE INDEX "expense_splits_member_idx" ON "expense_splits" USING btree ("group_member_id");--> statement-breakpoint
CREATE INDEX "expenses_group_date_idx" ON "expenses" USING btree ("group_id","expense_date");--> statement-breakpoint
CREATE INDEX "expenses_group_deleted_idx" ON "expenses" USING btree ("group_id","deleted_at");--> statement-breakpoint
CREATE INDEX "expenses_paid_by_member_idx" ON "expenses" USING btree ("paid_by_member_id");--> statement-breakpoint
CREATE INDEX "expenses_created_by_idx" ON "expenses" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "settlements_group_date_idx" ON "settlements" USING btree ("group_id","settled_date");--> statement-breakpoint
CREATE INDEX "settlements_group_deleted_idx" ON "settlements" USING btree ("group_id","deleted_at");--> statement-breakpoint
CREATE INDEX "settlements_from_member_idx" ON "settlements" USING btree ("from_member_id");--> statement-breakpoint
CREATE INDEX "settlements_to_member_idx" ON "settlements" USING btree ("to_member_id");--> statement-breakpoint
CREATE INDEX "settlements_created_by_idx" ON "settlements" USING btree ("created_by_id");--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expense_splits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settlements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "expenses" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "expense_splits" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "settlements" TO authenticated;--> statement-breakpoint
CREATE POLICY "Active members can view expenses."
ON "expenses" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "group_members"
    WHERE "group_members"."group_id" = "expenses"."group_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);--> statement-breakpoint
CREATE POLICY "Active members can view expense splits."
ON "expense_splits" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "expenses"
    JOIN "group_members"
      ON "group_members"."group_id" = "expenses"."group_id"
    WHERE "expenses"."id" = "expense_splits"."expense_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);--> statement-breakpoint
CREATE POLICY "Active members can view settlements."
ON "settlements" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "group_members"
    WHERE "group_members"."group_id" = "settlements"."group_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);
