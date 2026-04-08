import { DomainEvent } from "../../domain/domain-event";
import { EventBus } from "../../domain/event-bus";
import { InfrastructureService } from "../../domain/service.";
import { inngest } from "./inngest-client";

@InfrastructureService()
export class InngestEventBus implements EventBus {
  async publish(events: DomainEvent[]): Promise<void> {
    await inngest.send(
      events.map((event) => ({
        name: event.event_name,
        data: event.toPrimitives(),
      })),
    );
  }
}

