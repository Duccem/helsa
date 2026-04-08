export abstract class DoctorLicenseValidationService {
  abstract isValid(licenseNumber: string): Promise<boolean>;
}

