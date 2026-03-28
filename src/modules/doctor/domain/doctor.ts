import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { Education } from "./education";
import { OfficeAddress } from "./office-address";
import { Price } from "./price";
import { DoctorPatient } from "./doctor-patient";

export class DoctorId extends Uuid {}
export class DoctorUserId extends Uuid {}
export class DoctorSpecialtyId extends Uuid {}
export class LicenseNumber extends StringValueObject {}
export class Bio extends StringValueObject {}
export class Score extends NumberValueObject {}
export class Experience extends NumberValueObject {}
export class NextAvailabilityGeneration extends Timestamp {}
export class DoctorCreatedAt extends Timestamp {}
export class DoctorUpdatedAt extends Timestamp {}

export class Doctor extends Aggregate {
  constructor(
    public id: DoctorId,
    public user_id: DoctorUserId,
    public specialty_id: DoctorSpecialtyId,
    public license_number: LicenseNumber,
    public score: Score,
    public experience: Experience,
    public created_at: DoctorCreatedAt,
    public updated_at: DoctorUpdatedAt,
    public bio?: Bio,
    public next_availability_generation?: NextAvailabilityGeneration,
    public prices?: Price[],
    public office_addresses?: OfficeAddress[],
    public education?: Education[],
    public patients?: DoctorPatient[],
  ) {
    super(id);
  }

  toPrimitives(): Primitives<Doctor> {
    return {
      id: this.id.value,
      user_id: this.user_id.value,
      specialty_id: this.specialty_id.value,
      license_number: this.license_number.value,
      score: this.score.value,
      experience: this.experience.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      bio: this.bio?.value,
      next_availability_generation: this.next_availability_generation?.value,
      prices: this.prices?.map((item) => item.toPrimitives()),
      office_addresses: this.office_addresses?.map((item) => item.toPrimitives()),
      education: this.education?.map((item) => item.toPrimitives()),
    };
  }

  static fromPrimitives(primitives: Primitives<Doctor>): Doctor {
    return new Doctor(
      DoctorId.fromString(primitives.id),
      DoctorUserId.fromString(primitives.user_id),
      DoctorSpecialtyId.fromString(primitives.specialty_id),
      LicenseNumber.fromString(primitives.license_number),
      Score.fromNumber(primitives.score),
      Experience.fromNumber(primitives.experience),
      DoctorCreatedAt.fromDate(primitives.created_at),
      DoctorUpdatedAt.fromDate(primitives.updated_at),
      primitives.bio ? Bio.fromString(primitives.bio) : undefined,
      primitives.next_availability_generation
        ? NextAvailabilityGeneration.fromDate(primitives.next_availability_generation)
        : undefined,
      primitives.prices ? primitives.prices.map((item) => Price.fromPrimitives(item)) : undefined,
      primitives.office_addresses
        ? primitives.office_addresses.map((item) => OfficeAddress.fromPrimitives(item))
        : undefined,
      primitives.education ? primitives.education.map((item) => Education.fromPrimitives(item)) : undefined,
    );
  }

  static create(
    user_id: string,
    specialty_id: string,
    license_number: string,
    experience: number,
    bio?: string,
  ): Doctor {
    return new Doctor(
      DoctorId.generate(),
      DoctorUserId.fromString(user_id),
      DoctorSpecialtyId.fromString(specialty_id),
      LicenseNumber.fromString(license_number),
      Score.fromNumber(0),
      Experience.fromNumber(experience),
      DoctorCreatedAt.now(),
      DoctorUpdatedAt.now(),
      bio ? Bio.fromString(bio) : undefined,
    );
  }

  updateProfile(specialty_id: string, license_number: string, experience: number, bio?: string): void {
    this.specialty_id = DoctorSpecialtyId.fromString(specialty_id);
    this.license_number = LicenseNumber.fromString(license_number);
    this.experience = Experience.fromNumber(experience);
    this.bio = bio ? Bio.fromString(bio) : undefined;
    this.updated_at = DoctorUpdatedAt.now();
  }

  addPrice(amount: number): void {
    if (!this.prices) {
      this.prices = [];
    }
    this.prices.push(Price.create(this.id.value, amount));
    this.updated_at = DoctorUpdatedAt.now();
  }

  addOfficeAddress(address: string, location: { latitude: number; longitude: number }): void {
    if (!this.office_addresses) {
      this.office_addresses = [];
    }
    this.office_addresses.push(OfficeAddress.create(this.id.value, address, location));
    this.updated_at = DoctorUpdatedAt.now();
  }

  addEducation(title: string, institution: string, graduated_at: Date): void {
    if (!this.education) {
      this.education = [];
    }
    this.education.push(Education.create(this.id.value, title, institution, graduated_at));
    this.updated_at = DoctorUpdatedAt.now();
  }

  setNextAvailabilityGeneration(date: Date): void {
    this.next_availability_generation = NextAvailabilityGeneration.fromDate(date);
    this.updated_at = DoctorUpdatedAt.now();
  }
}

