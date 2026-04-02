CREATE TYPE "public"."diagnosis_type" AS ENUM('ALLERGY', 'CHRONIC', 'ACUTE', 'FAMILY_HISTORY', 'SOCIAL_HISTORY');--> statement-breakpoint
CREATE TYPE "public"."medical_record_priority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."medical_record_status" AS ENUM('FINAL', 'DRAFT', 'AMENDED', 'CORRECTED', 'APPENDED');--> statement-breakpoint
CREATE TYPE "public"."medical_record_type" AS ENUM('DIAGNOSIS', 'PRESCRIPTION', 'NOTE', 'LAB_RESULT', 'IMAGING_RESULT', 'IMMUNIZATION', 'PROCEDURE', 'PLAN', 'OTHER');--> statement-breakpoint
CREATE TABLE "physical_information" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"height" real DEFAULT 0,
	"weight" real DEFAULT 0,
	"blood_type" text,
	"body_mass_index" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vitals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"blood_pressure" real DEFAULT 0,
	"heart_rate" real DEFAULT 0,
	"respiratory_rate" real DEFAULT 0,
	"oxygen_saturation" real DEFAULT 0,
	"temperature" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_record" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"type" "medical_record_type" DEFAULT 'OTHER' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"priority" "medical_record_priority" DEFAULT 'NORMAL' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" "medical_record_status" DEFAULT 'DRAFT' NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'::text;--> statement-breakpoint
DROP TYPE "public"."appointment_status";--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'CANCELLED', 'FINISHED');--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "status" SET DATA TYPE "public"."appointment_status" USING "status"::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DEFAULT 'CONSULTATION'::text;--> statement-breakpoint
DROP TYPE "public"."appointment_type";--> statement-breakpoint
CREATE TYPE "public"."appointment_type" AS ENUM('CONSULTATION', 'FOLLOW_UP', 'CHECK_UP', 'EMERGENCY', 'PROCEDURE');--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DEFAULT 'CONSULTATION'::"public"."appointment_type";--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "type" SET DATA TYPE "public"."appointment_type" USING "type"::"public"."appointment_type";--> statement-breakpoint
ALTER TABLE "patient" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "diagnosis" ADD COLUMN "type" "diagnosis_type" DEFAULT 'CHRONIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "physical_information" ADD CONSTRAINT "physical_information_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE no action ON UPDATE no action;