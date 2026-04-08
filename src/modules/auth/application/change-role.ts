import { EventBus } from "@/modules/shared/domain/event-bus";
import { UserId } from "../domain/user";
import { UserNotFound } from "../domain/user-not-found";
import { UserRepository } from "../domain/user-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class ChangeRole {
  constructor(
    private readonly repository: UserRepository,
    private readonly bus: EventBus,
  ) {}

  async execute(user_id: string, role: string) {
    const user = await this.repository.get(UserId.fromString(user_id));
    if (!user) {
      throw new UserNotFound(user_id);
    }

    user.changeRole(role);
    await this.repository.save(user);
    await this.bus.publish(user.pullDomainEvents());
  }
}

