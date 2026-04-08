import { DoctorLicenseValidationService } from "../domain/doctor-license-validation-service";

export class VenezuelanDoctorLicenseValidationService extends DoctorLicenseValidationService {
  async isValid(_licenseNumber: string): Promise<boolean> {
    return true;
  }
}

