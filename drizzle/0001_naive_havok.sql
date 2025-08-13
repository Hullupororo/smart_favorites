CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"section_id" integer NOT NULL,
	"kind" varchar(16) NOT NULL,
	"text" text,
	"url" text,
	"tg_file_id" text,
	"tg_file_unique_id" text,
	"origin" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
