import { DomainEvent } from "./domain-event";
import { Primitives } from "./primitives";

export abstract class Aggregate {
  private events: DomainEvent[] = [];

  abstract toPrimitives(): Primitives<Aggregate>;

  pullDomainEvents(): DomainEvent[] {
    const events = this.events;
    this.events = [];

    return events;
  }

  record(event: DomainEvent): void {
    this.events.push(event);
  }
}

