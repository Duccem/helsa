import { DomainEvent, DomainEventAttributes } from "@/modules/shared/domain/domain-event";

export type OrganizationCreatedEventAttributes = {
  organizationId: string;
};

export class OrganizationCreatedEvent extends DomainEvent {
  static readonly eventName = "organization.created";
  readonly attributes: OrganizationCreatedEventAttributes;

  constructor(
    aggregate_id: string,
    attributes: OrganizationCreatedEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(OrganizationCreatedEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  toPrimitives(): DomainEventAttributes {
    return {
      organizationId: this.attributes.organizationId,
    };
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): OrganizationCreatedEvent {
    return new OrganizationCreatedEvent(
      aggregate_id,
      { organizationId: attributes.organization_id as string },
      eventId,
      occurredOn,
    );
  }

  static create(organizationId: string): OrganizationCreatedEvent {
    return new OrganizationCreatedEvent(organizationId, { organizationId });
  }
}

