import { DomainEntity } from "./domain-entity";
import { DomainEvent } from "./domain-event";

export abstract class Aggregate extends DomainEntity {
  private events: DomainEvent[] = [];

  pullDomainEvents(): DomainEvent[] {
    const events = this.events;
    this.events = [];

    return events;
  }

  record(event: DomainEvent): void {
    this.events.push(event);
  }
}

