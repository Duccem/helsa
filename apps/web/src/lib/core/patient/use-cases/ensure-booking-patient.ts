import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import { PatientRepository } from "../adapters/patient-repository";

/**
 * The therapist's record for the person booking. In order: the record already
 * linked to this account, a record the therapist created with the same email
 * (now linked), or a new prospect.
 */
export class EnsureBookingPatient {
  private repository = new PatientRepository();

  async execute(data: { therapistId: string; timezone: string }, user: BetterUser) {
    const linked = await this.repository.findByUser(data.therapistId, user.id);
    if (linked) return linked;

    // An account can be linked to a single record across Helsa.
    const canLink = !(await this.repository.isUserLinked(user.id));

    const existing = await this.repository.findUnlinkedByEmail(data.therapistId, user.email);
    if (existing) {
      if (canLink) {
        await this.repository.update({ ...existing, user_id: user.id, portal_enabled: true });
      }
      return existing;
    }

    const id = randomUUID();
    const [firstName = "", ...rest] = user.name.trim().split(/\s+/);
    await this.repository.create({
      id,
      therapist_id: data.therapistId,
      user_id: canLink ? user.id : null,
      first_name: firstName || user.email,
      last_name: rest.join(" "),
      email: user.email.toLowerCase(),
      timezone: data.timezone,
      status: "prospect",
      portal_enabled: canLink,
    });

    const created = await this.repository.getById(id, data.therapistId);
    if (!created) throw new Error("Patient was not created");
    return created;
  }
}
