import { DomainEvent, DomainEventAttributes } from "@/modules/shared/domain/domain-event";

export type MedicationAddedDomainEventAttributes = {
  prescription_id: string;
  medication_id: string;
  patient_id: string;
  frequency: string;
};

export class MedicationAddedDomainEvent extends DomainEvent {
  static readonly eventName = "prescription.medication-added";

  constructor(
    aggregate_id: string,
    attributes: MedicationAddedDomainEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(MedicationAddedDomainEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  readonly attributes: MedicationAddedDomainEventAttributes;

  toPrimitives(): DomainEventAttributes {
    return this.attributes;
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): MedicationAddedDomainEvent {
    return new MedicationAddedDomainEvent(
      aggregate_id,
      {
        prescription_id: attributes.prescription_id as string,
        medication_id: attributes.medication_id as string,
        patient_id: attributes.patient_id as string,
        frequency: attributes.frequency as string,
      },
      eventId,
      occurredOn,
    );
  }
}

