export interface DoctorLicenseValidationService {
  isValid(licenseNumber: string): Promise<boolean>;
}

