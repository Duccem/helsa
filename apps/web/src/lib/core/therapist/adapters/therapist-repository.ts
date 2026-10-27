import { eq, } from "@helsa/db/operators";
import { availability_rule, therapist, therapist_rate } from "@helsa/db/schema/therapist";
import { db } from "@/services";
import type { Therapist, TherapistAvailabilityRule, TherapistRate } from "../domain/types";

export class TherapistRepository {
  async getBySlug(slug: string) {
    const [response] = await db.select().from(therapist).where(eq(therapist.booking_slug, slug)).limit(1);

    return response;
  }

  async getById(id: string) {
    const [response] = await db.select().from(therapist).where(eq(therapist.user_id, id)).limit(1);

    return response;
  }

  async create(data: { id: string; name: string }) {
    await db
      .insert(therapist)
      .values({ user_id: data.id, display_name: data.name })
      .onConflictDoNothing({ target: therapist.user_id });
  }

  async update(data: Therapist) {
    await db.update(therapist).set(data).where(eq(therapist.user_id, data.user_id))
  }

  async saveRates(data: TherapistRate[], user_id: string) {
    await db.delete(therapist_rate).where(eq(therapist_rate.therapist_id, user_id));
    await db.insert(therapist_rate).values(data)
  }

  async saveRules(data: TherapistAvailabilityRule[], user_id: string) {
    await db.delete(availability_rule).where(eq(therapist_rate.therapist_id, user_id));
    await db.insert(availability_rule).values(data)
  }
}