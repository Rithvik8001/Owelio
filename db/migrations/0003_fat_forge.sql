CREATE TYPE "public"."recurring_bill_frequency" AS ENUM('weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "recurring_bill_splits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recurring_bill_id" uuid NOT NULL,
	"group_member_id" uuid NOT NULL,
	"owed_cents" integer NOT NULL,
	"percentage_basis_points" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "expense_category" DEFAULT 'other' NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency_code" text NOT NULL,
	"paid_by_member_id" uuid NOT NULL,
	"split_method" "expense_split_method" NOT NULL,
	"frequency" "recurring_bill_frequency" NOT NULL,
	"next_due_date" timestamp NOT NULL,
	"last_posted_at" timestamp,
	"created_by_id" uuid NOT NULL,
	"paused_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "recurring_bill_id" uuid;--> statement-breakpoint
ALTER TABLE "recurring_bill_splits" ADD CONSTRAINT "recurring_bill_splits_recurring_bill_id_recurring_bills_id_fk" FOREIGN KEY ("recurring_bill_id") REFERENCES "public"."recurring_bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill_splits" ADD CONSTRAINT "recurring_bill_splits_group_member_id_group_members_id_fk" FOREIGN KEY ("group_member_id") REFERENCES "public"."group_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bills" ADD CONSTRAINT "recurring_bills_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bills" ADD CONSTRAINT "recurring_bills_paid_by_member_id_group_members_id_fk" FOREIGN KEY ("paid_by_member_id") REFERENCES "public"."group_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bills" ADD CONSTRAINT "recurring_bills_created_by_id_profiles_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "recurring_bill_splits_bill_member_unique" ON "recurring_bill_splits" USING btree ("recurring_bill_id","group_member_id");--> statement-breakpoint
CREATE INDEX "recurring_bill_splits_member_idx" ON "recurring_bill_splits" USING btree ("group_member_id");--> statement-breakpoint
CREATE INDEX "recurring_bills_group_due_idx" ON "recurring_bills" USING btree ("group_id","next_due_date");--> statement-breakpoint
CREATE INDEX "recurring_bills_group_archived_idx" ON "recurring_bills" USING btree ("group_id","archived_at");--> statement-breakpoint
CREATE INDEX "recurring_bills_paid_by_member_idx" ON "recurring_bills" USING btree ("paid_by_member_id");--> statement-breakpoint
CREATE INDEX "recurring_bills_created_by_idx" ON "recurring_bills" USING btree ("created_by_id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurring_bill_id_recurring_bills_id_fk" FOREIGN KEY ("recurring_bill_id") REFERENCES "public"."recurring_bills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_recurring_bill_idx" ON "expenses" USING btree ("recurring_bill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "expenses_recurring_bill_date_unique" ON "expenses" USING btree ("recurring_bill_id","expense_date") WHERE "expenses"."recurring_bill_id" is not null and "expenses"."deleted_at" is null;--> statement-breakpoint
ALTER TABLE "recurring_bills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recurring_bill_splits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "recurring_bills" TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "recurring_bill_splits" TO authenticated;--> statement-breakpoint
CREATE POLICY "Active members can view recurring bills."
ON "recurring_bills" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "group_members"
    WHERE "group_members"."group_id" = "recurring_bills"."group_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);--> statement-breakpoint
CREATE POLICY "Active members can view recurring bill splits."
ON "recurring_bill_splits" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "recurring_bills"
    JOIN "group_members"
      ON "group_members"."group_id" = "recurring_bills"."group_id"
    WHERE "recurring_bills"."id" = "recurring_bill_splits"."recurring_bill_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);
