CREATE TABLE "item_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"kind" varchar(16) NOT NULL,
	"tg_file_id" text NOT NULL,
	"tg_file_unique_id" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "media_group_id" varchar(64);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "origin_chat_id" varchar(64);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "origin_message_id" varchar(64);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "media_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN "tg_file_id";--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN "tg_file_unique_id";