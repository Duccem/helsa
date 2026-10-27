import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../adapters/therapist-repository";
import { TherapistNotFound } from "../domain/errors";
import type { Therapist } from "../domain/types";
import { EnsureTherapist } from "./ensure-therapist";

type SaveProfessionalInput = {
  displayName: string;
  professionalTitle: string | null;
  licenseNumber: string | null;
  licenseBody: string | null;
  yearsExperience: number | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  phone: string | null;
  countryCode: string;
}

export class SaveProfessional {
  private repository = new TherapistRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: SaveProfessionalInput, user: BetterUser) {
    await this.ensurer.execute(user);

    const therapist = await this.repository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    const updatedTherapist = this.updateProfessionalData(data, therapist);

    await this.repository.update(updatedTherapist);
  }

  private updateProfessionalData(data: SaveProfessionalInput, therapist: Therapist) {
    const licenseChanged =
      (therapist?.license_number ?? null) !== data.licenseNumber;
    return {
      ...therapist,
      display_name: data.displayName,
      professional_title: data.professionalTitle,
      license_number: data.licenseNumber,
      license_body: data.licenseBody,
      years_experience: data.yearsExperience,
      bio: data.bio,
      specialties: [...new Set(data.specialties)],
      languages: data.languages,
      phone_e164: data.phone,
      country_code: data.countryCode,
      ...(licenseChanged
        ? { license_verified_at: null, license_verified_by: null }
        : {}),
    }
  }
}