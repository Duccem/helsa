CREATE TYPE "payment_reporter" AS ENUM('therapist', 'patient');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending_review', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "payment_reminder" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"channel" "reminder_channel" NOT NULL,
	"amount_usd" numeric(12,2) NOT NULL,
	"sessions" smallint DEFAULT 0 NOT NULL,
	"status" "reminder_status" DEFAULT 'pending'::"reminder_status" NOT NULL,
	"provider" text NOT NULL,
	"provider_message_id" text,
	"error" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "status" "payment_status" DEFAULT 'pending_review'::"payment_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "reported_by" "payment_reporter" DEFAULT 'therapist'::"payment_reporter" NOT NULL;--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "proof_file_id" uuid;--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "verified_by" uuid;--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "rejected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session_payment" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
CREATE INDEX "idx_payment_reminder_patient" ON "payment_reminder" ("therapist_id","patient_id","sent_at");--> statement-breakpoint
ALTER TABLE "payment_reminder" ADD CONSTRAINT "payment_reminder_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_reminder" ADD CONSTRAINT "payment_reminder_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session_payment" ADD CONSTRAINT "session_payment_proof_file_id_file_id_fkey" FOREIGN KEY ("proof_file_id") REFERENCES "file"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "session_payment" ADD CONSTRAINT "session_payment_verified_by_user_id_fkey" FOREIGN KEY ("verified_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
-- Payments recorded before review existed were entered by the therapist: keep them counted.
UPDATE "session_payment" SET "status" = 'verified', "verified_at" = "created_at" WHERE "deleted_at" IS NULL;