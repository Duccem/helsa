export class OrganizationCreatedNotify {
  constructor() {}

  async execute(organization: { id: string; name: string }) {
    console.log(`Organization created: ${organization.name} (ID: ${organization.id})`);
  }
}

