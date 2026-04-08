import { DomainEvent, DomainEventAttributes } from "@/modules/shared/domain/domain-event";

export type AppointmentScheduledDomainEventAttributes = {
  appointment_id: string;
  organization_id: string | null;
  patient_id: string;
  doctor_id: string;
  date: Date;
  hour: string;
  motive: string;
  type: string;
  mode: string;
  status: string;
};

export class AppointmentScheduledDomainEvent extends DomainEvent {
  static readonly eventName = "appointment.scheduled";

  constructor(
    aggregate_id: string,
    attributes: AppointmentScheduledDomainEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(AppointmentScheduledDomainEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  readonly attributes: AppointmentScheduledDomainEventAttributes;

  toPrimitives(): DomainEventAttributes {
    return {
      appointment_id: this.attributes.appointment_id,
      organization_id: this.attributes.organization_id,
      patient_id: this.attributes.patient_id,
      doctor_id: this.attributes.doctor_id,
      date: this.attributes.date,
      hour: this.attributes.hour,
      motive: this.attributes.motive,
      type: this.attributes.type,
      mode: this.attributes.mode,
      status: this.attributes.status,
    };
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): AppointmentScheduledDomainEvent {
    return new AppointmentScheduledDomainEvent(
      aggregate_id,
      {
        appointment_id: attributes.appointment_id as string,
        organization_id: (attributes.organization_id as string | null) ?? null,
        patient_id: attributes.patient_id as string,
        doctor_id: attributes.doctor_id as string,
        date: new Date(attributes.date as string | Date),
        hour: attributes.hour as string,
        motive: attributes.motive as string,
        type: attributes.type as string,
        mode: attributes.mode as string,
        status: attributes.status as string,
      },
      eventId,
      occurredOn,
    );
  }
}

