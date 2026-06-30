CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "expense_category",
	"amount_cents" integer NOT NULL,
	"currency_code" text NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"created_by_id" uuid NOT NULL,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_created_by_id_profiles_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budgets_group_id_idx" ON "budgets" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "budgets_group_archived_idx" ON "budgets" USING btree ("group_id","archived_at");--> statement-breakpoint
CREATE INDEX "budgets_group_category_idx" ON "budgets" USING btree ("group_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_active_overall_unique" ON "budgets" USING btree ("group_id") WHERE "budgets"."archived_at" is null and "budgets"."category" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_active_category_unique" ON "budgets" USING btree ("group_id","category") WHERE "budgets"."archived_at" is null and "budgets"."category" is not null;--> statement-breakpoint
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "budgets" TO authenticated;--> statement-breakpoint
CREATE POLICY "Active members can view budgets."
ON "budgets" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "group_members"
    WHERE "group_members"."group_id" = "budgets"."group_id"
      AND "group_members"."user_id" = (select auth.uid())
      AND "group_members"."status" = 'active'
  )
);
