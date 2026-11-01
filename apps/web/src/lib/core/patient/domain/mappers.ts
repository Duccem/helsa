import type { PatientInput } from "@/components/dashboard/patients/schema";
import { CURRENT_KEY_VERSION, encryptText } from "@/lib/infra/clinical-cipher";

const orNull = (value: string) => (value.trim() === "" ? null : value.trim());

/** Form input → patient columns. The intake reason is encrypted with the therapist's key. */
export function toPatientColumns(data: PatientInput, therapist_id: string) {
  return {
    ...basicColumns(data),
    ...intakeColumns(data.intakeReason, therapist_id),
  };
}

/** Left out entirely when the form did not send it. */
function intakeColumns(value: string | undefined, therapist_id: string) {
  if (value === undefined) return {};
  const intake = value.trim();
  return {
    intake_reason_enc: intake ? encryptText(intake, therapist_id) : null,
    enc_key_version: intake ? CURRENT_KEY_VERSION : null,
  };
}

function basicColumns(data: PatientInput) {
  return {
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    preferred_name: orNull(data.preferredName),
    national_id: orNull(data.nationalId),
    birth_date: orNull(data.birthDate),
    gender: orNull(data.gender),
    email: orNull(data.email.toLowerCase()),
    phone_e164: orNull(data.phone.replace(/[\s()-]/g, "")),
    whatsapp_opt_in: data.whatsappOptIn,
    country_code: data.countryCode.toUpperCase(),
    city: orNull(data.city),
    timezone: data.timezone,
    emergency_contact_name: orNull(data.emergencyName),
    emergency_contact_phone: orNull(data.emergencyPhone),
    emergency_contact_relation: orNull(data.emergencyRelation),
    status: data.status,
    session_price_usd: data.sessionPriceUsd === null ? null : data.sessionPriceUsd.toFixed(2),
  };
}
