import { and, asc, eq, } from "@helsa/db/operators";
import { availability_block, availability_rule, therapist, therapist_rate } from "@helsa/db/schema/therapist";
import { db } from "@/services";
import type { Therapist, TherapistAvailabilityRule, TherapistRate, } from "../domain/types";

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
    await db.delete(availability_rule).where(eq(availability_rule.therapist_id, user_id));
    await db.insert(availability_rule).values(data)
  }

  async saveTimeOff(data: { starts_at: Date, ends_at: Date, reason: string }, user_id: string) {
    await db.insert(availability_block).values({
      therapist_id: user_id,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      reason: data.reason,
    })
  }

  async deleteTimeOff(block_id: string, user_id: string) {
    await db
      .delete(availability_block)
      .where(
        and(
          eq(availability_block.id, block_id),
          eq(availability_block.therapist_id, user_id),
        ),
      )
  }

  async getRates(user_id: string) {
    const rates = await db
      .select()
      .from(therapist_rate)
      .where(eq(therapist_rate.therapist_id, user_id))
      .orderBy(asc(therapist_rate.position), asc(therapist_rate.created_at))
    return rates;
  }

  async getRules(user_id: string) {
    const rules = await db
      .select()
      .from(availability_rule)
      .where(eq(availability_rule.therapist_id, user_id))
      .orderBy(
        asc(availability_rule.weekday),
        asc(availability_rule.start_time),
      );
    return rules;
  }

  async getTimeOffs(user_id: string) {
    const blocks = await db
      .select()
      .from(availability_block)
      .where(eq(availability_block.therapist_id, user_id))
      .orderBy(asc(availability_block.starts_at))
    return blocks;
  }
}