import { DomainEvent, DomainEventAttributes } from "@/modules/shared/domain/domain-event";

export type UserCreatedEventAttributes = {
  userId: string;
  name: string;
  email: string;
};

export class UserCreatedEvent extends DomainEvent {
  static readonly eventName = "user.created";
  readonly attributes: UserCreatedEventAttributes;

  constructor(aggregate_id: string, attributes: UserCreatedEventAttributes, eventId?: string, occurredOn?: Date) {
    super(UserCreatedEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  toPrimitives(): DomainEventAttributes {
    return {
      userId: this.attributes.userId,
      name: this.attributes.name,
      email: this.attributes.email,
    };
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): UserCreatedEvent {
    return new UserCreatedEvent(
      aggregate_id,
      {
        userId: attributes.userId as string,
        name: attributes.name as string,
        email: attributes.email as string,
      },
      eventId,
      occurredOn,
    );
  }

  static create(userId: string, name: string, email: string): UserCreatedEvent {
    return new UserCreatedEvent(userId, { userId, name, email });
  }
}

