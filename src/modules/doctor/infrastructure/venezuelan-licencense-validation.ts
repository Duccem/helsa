import { DoctorLicenseValidationService } from "../domain/doctor-license-validation-service";

export class VenezuelanDoctorLicenseValidationService implements DoctorLicenseValidationService {
  async isValid(_licenseNumber: string): Promise<boolean> {
    return true;
  }
}

