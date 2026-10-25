CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY,
	"preferences" jsonb DEFAULT '{}' NOT NULL,
	"notifications" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "therapist_rate" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"name" text NOT NULL,
	"duration_minutes" smallint NOT NULL,
	"price_usd" numeric(12,2) NOT NULL,
	"modality" "appointment_modality",
	"position" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "years_experience" smallint;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "specialties" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "languages" text[] DEFAULT '{es}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "modalities" "appointment_modality"[] DEFAULT '{video}'::"appointment_modality"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "office_address" text;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "payment_methods" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "payment_instructions" text;--> statement-breakpoint
ALTER TABLE "therapist" ADD COLUMN "cancellation_notice_hours" smallint DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "therapist_rate" ADD CONSTRAINT "therapist_rate_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;