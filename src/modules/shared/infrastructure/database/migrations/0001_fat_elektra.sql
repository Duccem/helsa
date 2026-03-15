CREATE TABLE "chat" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient" RENAME COLUMN "organization_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "medication_reminder" ADD COLUMN "prescription_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "schedule" ADD COLUMN "next_availability_generation" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_impersonated_by_user_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_reminder" ADD CONSTRAINT "medication_reminder_prescription_id_prescription_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescription"("id") ON DELETE no action ON UPDATE no action;