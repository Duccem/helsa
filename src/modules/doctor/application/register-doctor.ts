import { Doctor } from "../domain/doctor";
import { DoctorUserId } from "../domain/doctor";
import { DoctorAlreadyExists } from "../domain/doctor-already-exists";
import { DoctorLicenseNotValid } from "../domain/doctor-license-not-valid";
import { DoctorLicenseValidationService } from "../domain/doctor-license-validation-service";
import { DoctorRepository, SpecialtyRepository } from "../domain/doctor-repository";
import { SpecialtyId } from "../domain/specialty";
import { SpecialtyNotFound } from "../domain/specialty-not-found";

export class RegisterDoctor {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly specialtyRepository: SpecialtyRepository,
    private readonly licenseValidationService: DoctorLicenseValidationService,
  ) {}

  async execute(params: {
    user_id: string;
    specialty_id: string;
    license_number: string;
    experience: number;
    bio?: string;
    prices?: number[];
    office_addresses?: Array<{
      address: string;
      location: { latitude: number; longitude: number };
    }>;
  }): Promise<void> {
    const existing = await this.doctorRepository.findByUserId(DoctorUserId.fromString(params.user_id));
    if (existing) {
      throw new DoctorAlreadyExists(params.user_id);
    }

    const specialty = await this.specialtyRepository.find(SpecialtyId.fromString(params.specialty_id));
    if (!specialty) {
      throw new SpecialtyNotFound(params.specialty_id);
    }

    const isValidLicense = await this.licenseValidationService.isValid(params.license_number);
    if (!isValidLicense) {
      throw new DoctorLicenseNotValid(params.license_number);
    }

    const doctor = Doctor.create(
      params.user_id,
      params.specialty_id,
      params.license_number,
      params.experience,
      params.bio,
    );

    if (params.prices) {
      for (const amount of params.prices) {
        doctor.addPrice(amount);
      }
    }

    if (params.office_addresses) {
      for (const officeAddress of params.office_addresses) {
        doctor.addOfficeAddress(officeAddress.address, officeAddress.location);
      }
    }

    await this.doctorRepository.save(doctor);
  }
}

