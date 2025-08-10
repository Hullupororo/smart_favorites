CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"lang" varchar(8) DEFAULT 'ru',
	"timezone" varchar(64),
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"name" varchar(64) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sections_user_name_uq" ON "sections" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "sections_user_idx" ON "sections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sections_sort_idx" ON "sections" USING btree ("user_id","sort_order");