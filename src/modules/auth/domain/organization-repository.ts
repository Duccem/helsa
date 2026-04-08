export abstract class OrganizationRepository {
  abstract getOrganization(id: string): Promise<{ id: string; name: string }>;
}
