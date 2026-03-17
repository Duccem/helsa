import { database } from "@/modules/shared/infrastructure/database/client";
import { OrganizationRepository } from "../../domain/organization-repository";

export class DrizzleOrganizationRepository implements OrganizationRepository {
  async getOrganization(id: string): Promise<{ id: string; name: string }> {
    const organization = await database.query.organization.findFirst({
      where: (org, { eq }) => eq(org.id, id),
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return {
      id: organization.id,
      name: organization.name,
    };
  }
}
