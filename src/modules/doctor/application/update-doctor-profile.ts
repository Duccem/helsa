import { ApplicationService } from "@/modules/shared/domain/service.";
import { DoctorId } from "../domain/doctor";
import { DoctorLicenseNotValid } from "../domain/doctor-license-not-valid";
import { DoctorLicenseValidationService } from "../domain/doctor-license-validation-service";
import { DoctorNotFound } from "../domain/doctor-not-found";
import { DoctorRepository, SpecialtyRepository } from "../domain/doctor-repository";
import { SpecialtyId } from "../domain/specialty";
import { SpecialtyNotFound } from "../domain/specialty-not-found";

@ApplicationService()
export class UpdateDoctorProfile {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly specialtyRepository: SpecialtyRepository,
    private readonly licenseValidationService: DoctorLicenseValidationService,
  ) {}

  async execute(params: {
    doctor_id: string;
    specialty_id: string;
    license_number: string;
    experience: number;
    bio?: string;
  }): Promise<void> {
    const doctor = await this.doctorRepository.find(DoctorId.fromString(params.doctor_id));
    if (!doctor) {
      throw new DoctorNotFound(params.doctor_id);
    }

    const specialty = await this.specialtyRepository.find(SpecialtyId.fromString(params.specialty_id));
    if (!specialty) {
      throw new SpecialtyNotFound(params.specialty_id);
    }

    const isValidLicense = await this.licenseValidationService.isValid(params.license_number);
    if (!isValidLicense) {
      throw new DoctorLicenseNotValid(params.license_number);
    }

    doctor.updateProfile(params.specialty_id, params.license_number, params.experience, params.bio);
    await this.doctorRepository.save(doctor);
  }
}

