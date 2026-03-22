import { DomainEvent, DomainEventAttributes } from "@/modules/shared/domain/domain-event";

export type UserRoleSetAsPatientEventAttributes = {
  userId: string;
};

export class UserRoleSetAsPatientEvent extends DomainEvent {
  static readonly eventName = "user.role.set_as_patient";
  readonly attributes: UserRoleSetAsPatientEventAttributes;

  constructor(
    aggregate_id: string,
    attributes: UserRoleSetAsPatientEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(UserRoleSetAsPatientEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  toPrimitives() {
    return {
      userId: this.attributes.userId,
    };
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): UserRoleSetAsPatientEvent {
    return new UserRoleSetAsPatientEvent(aggregate_id, { userId: attributes.userId as string }, eventId, occurredOn);
  }

  static create(userId: string): UserRoleSetAsPatientEvent {
    return new UserRoleSetAsPatientEvent(userId, { userId });
  }
}

export type UserRoleSetAsDoctorEventAttributes = {
  userId: string;
};

export class UserRoleSetAsDoctorEvent extends DomainEvent {
  static readonly eventName = "user.role.set_as_doctor";
  readonly attributes: UserRoleSetAsDoctorEventAttributes;

  constructor(
    aggregate_id: string,
    attributes: UserRoleSetAsDoctorEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(UserRoleSetAsDoctorEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  toPrimitives() {
    return {
      userId: this.attributes.userId,
    };
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): UserRoleSetAsDoctorEvent {
    return new UserRoleSetAsDoctorEvent(aggregate_id, { userId: attributes.userId as string }, eventId, occurredOn);
  }

  static create(userId: string): UserRoleSetAsDoctorEvent {
    return new UserRoleSetAsDoctorEvent(userId, { userId });
  }
}
