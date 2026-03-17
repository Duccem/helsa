export interface OrganizationRepository {
  getOrganization(id: string): Promise<{ id: string; name: string }>;
}
