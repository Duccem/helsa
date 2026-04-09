import { OrganizationRepository } from "../domain/organization-repository";

export class GetOrganization {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(id: string) {
    const organization = await this.repository.getOrganization(id);

    return organization;
  }
}

