import { EventBus } from "@/modules/shared/domain/event-bus";
import { AuthNotifier } from "../domain/auth-notifier";
import { UserCreatedEvent } from "../domain/user-created-event";

export class UserRegistration {
  constructor(
    private readonly notifier: AuthNotifier,
    private readonly eventBus: EventBus,
  ) {}

  async execute(user: { id: string; name: string; email: string }) {
    await this.notifier.notifyWelcomeEmail(user.email, user.name);
    const userCreatedEvent = UserCreatedEvent.create(user.id, user.name, user.email);
    await this.eventBus.publish([userCreatedEvent]);
  }
}

