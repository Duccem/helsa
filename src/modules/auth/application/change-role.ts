import { UserId } from "../domain/user";
import { UserNotFound } from "../domain/user-not-found";
import { UserRepository } from "../domain/user-repository";

export class ChangeRole {
  constructor(private readonly repository: UserRepository) {}

  async execute(user_id: string, role: string) {
    const user = await this.repository.get(UserId.fromString(user_id));
    if (!user) {
      throw new UserNotFound(user_id);
    }

    user.changeRole(role);
    await this.repository.save(user);
  }
}

