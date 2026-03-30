CREATE TYPE "public"."appointment_payment_method" AS ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'CHECK', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."appointment_payment_mode" AS ENUM('PREPAID', 'POSTPAID', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."appointment_payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "public"."price_payment_mode" AS ENUM('PREPAID', 'POSTPAID', 'CREDIT');--> statement-breakpoint
CREATE TABLE "appointment_payment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"appointment_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"current_paid_amount" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_mode" "appointment_payment_mode" NOT NULL,
	"payment_method" "appointment_payment_method" NOT NULL,
	"payment_status" "appointment_payment_status" NOT NULL,
	"payment_date" timestamp DEFAULT now(),
	CONSTRAINT "appointment_payment_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "hour" time DEFAULT '08:00:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "price" ADD COLUMN "payment_mode" "price_payment_mode" DEFAULT 'PREPAID' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointment_payment" ADD CONSTRAINT "appointment_payment_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "price" DROP COLUMN "updated_at";