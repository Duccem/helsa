import { EventBus } from "@/modules/shared/domain/event-bus";
import { AuthNotifier } from "../domain/auth-notifier";
import { OrganizationCreatedEvent } from "../domain/organization-created-event";

export class OrganizationCreation {
  constructor(
    private notifier: AuthNotifier,
    private eventBus: EventBus,
  ) {}

  async execute(organization: { id: string; name: string }, email: string) {
    await this.notifier.notifyOrganizationCreated(organization, email);
    const event = OrganizationCreatedEvent.create(organization.id);
    await this.eventBus.publish([event]);
  }
}

