import { TherapistRepository } from "../adapters/therapist-repository";

export class EnsureTherapist {
  private repository = new TherapistRepository();

  async execute(user: { id: string, name: string }) {
    await this.repository.create(user);
  }
}