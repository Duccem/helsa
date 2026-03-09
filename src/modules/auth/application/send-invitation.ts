export class SendInvitation {
  constructor() {}

  async execute({ email, role }: { email: string; role: string }) {
    console.log(`Send invitation to ${email} with role ${role}`);
  }
}
