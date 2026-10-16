ALTER TABLE "session" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "banned" boolean;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ban_expires" timestamp;