import { v7 } from "uuid";

export type DomainEventAttributes = { [key: string]: unknown };

export abstract class DomainEvent {
  static fromPrimitives: (
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ) => DomainEvent;

  public readonly event_id: string;
  public readonly occurred_on: Date;

  protected constructor(
    public readonly event_name: string,
    public readonly aggregate_id: string,
    eventId?: string,
    occurredOn?: Date,
  ) {
    this.event_id = eventId ?? v7();
    this.occurred_on = occurredOn ?? new Date();
  }

  abstract toPrimitives(): DomainEventAttributes;
}

