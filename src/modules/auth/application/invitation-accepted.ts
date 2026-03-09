export class InvitationAccepted {
  constructor() {}

  async execute({ organization, user }: { organization: { id: string; name: string }; user: { email: string } }) {
    console.log(`User ${user.email} accepted invitation to organization ${organization.name}`);
  }
}
