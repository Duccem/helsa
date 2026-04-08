import { ApplicationService } from "@/modules/shared/domain/service.";
import { OrganizationRepository } from "../domain/organization-repository";

@ApplicationService()
export class GetOrganization {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(id: string) {
    const organization = await this.repository.getOrganization(id);

    return organization;
  }
}

