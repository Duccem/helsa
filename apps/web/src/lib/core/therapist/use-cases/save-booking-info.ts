import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../adapters/therapist-repository";
import { SlugAlreadyTaken, TherapistNotFound } from "../domain/errors";
import type { Therapist } from "../domain/types";
import { EnsureTherapist } from "./ensure-therapist";

type SaveBookingInfoInput = {
  slug: string;
  enabled: boolean;
  modalities: ("in_person" | "video" | "phone")[];
  officeAddress: string | null;
  noticeHours: number;
  cancellationHours: number;
}

export class SaveBookingInfo {
  private repository = new TherapistRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: SaveBookingInfoInput, user: BetterUser) {
    await this.ensurer.execute(user);

    const therapist = await this.repository.getBySlug(data.slug);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    if (therapist.user_id !== user.id) {
      throw new SlugAlreadyTaken(data.slug);
    }

    const updatedTherapist = this.updateBooking(data, therapist);
    await this.repository.update(updatedTherapist);
  }

  private updateBooking(data: SaveBookingInfoInput, therapist: Therapist) {
    return {
      ...therapist,
      booking_slug: data.slug,
      booking_enabled: data.enabled,
      modalities: data.modalities,
      office_address: data.officeAddress,
      booking_notice_hours: data.noticeHours,
      cancellation_notice_hours: data.cancellationHours,
    }
  }
}