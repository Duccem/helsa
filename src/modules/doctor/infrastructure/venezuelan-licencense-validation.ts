import { InfrastructureService } from "@/modules/shared/domain/service.";
import { DoctorLicenseValidationService } from "../domain/doctor-license-validation-service";

@InfrastructureService()
export class VenezuelanDoctorLicenseValidationService extends DoctorLicenseValidationService {
  async isValid(_licenseNumber: string): Promise<boolean> {
    return true;
  }
}

