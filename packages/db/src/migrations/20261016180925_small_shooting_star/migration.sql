ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "banned";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ban_reason";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ban_expires";