import { UserId } from "../domain/user";
import { UserNotFound } from "../domain/user-not-found";
import { UserRepository } from "../domain/user-repository";

export class GetUser {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string) {
    const user_id = UserId.fromString(id);
    const user = await this.repository.get(user_id);

    if (!user) {
      throw new UserNotFound(id);
    }

    return user.toPrimitives();
  }
}

