CREATE TYPE "public"."allergy_severity" AS ENUM('LOW', 'MODERATE', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TABLE "allergy" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"name" text NOT NULL,
	"severity" "allergy_severity" DEFAULT 'LOW' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "allergy" ADD CONSTRAINT "allergy_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE no action ON UPDATE no action;