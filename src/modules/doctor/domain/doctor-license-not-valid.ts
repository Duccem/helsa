import { DomainError } from "@/modules/shared/domain/domain-error";

export class DoctorLicenseNotValid extends DomainError {
  constructor(licenseNumber: string) {
    super({ licenseNumber });
  }

  get message(): string {
    return `Doctor license ${this.params.licenseNumber} is not valid`;
  }
}

