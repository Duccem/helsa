ALTER TABLE "appointment" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DEFAULT 'CONSULTATION'::text;--> statement-breakpoint
DROP TYPE "public"."appointment_type";--> statement-breakpoint
CREATE TYPE "public"."appointment_type" AS ENUM('CONSULTATION', 'FOLLOW_UP', 'CHECK_UP', 'EMERGENCY', 'PROCEDURE');--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DEFAULT 'CONSULTATION'::"public"."appointment_type";--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DATA TYPE "public"."appointment_type" USING "type"::"public"."appointment_type";--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" DROP COLUMN "organization_id";