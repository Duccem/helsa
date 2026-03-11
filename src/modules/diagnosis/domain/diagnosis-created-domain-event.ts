import { DomainEvent, DomainEventAttributes } from "@/modules/shared/domain/domain-event";

export type DiagnosisCreatedDomainEventAttributes = {
  patient_id: string;
  summary: string;
  cie_code: string;
  certainty: string;
  state: string;
  income: string;
};

export class DiagnosisCreatedDomainEvent extends DomainEvent {
  static readonly eventName = "diagnosis.created";

  constructor(
    aggregate_id: string,
    attributes: DiagnosisCreatedDomainEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(DiagnosisCreatedDomainEvent.eventName, aggregate_id, eventId, occurredOn);
    this.attributes = attributes;
  }

  readonly attributes: DiagnosisCreatedDomainEventAttributes;

  toPrimitives(): DomainEventAttributes {
    return this.attributes;
  }

  static fromPrimitives(
    aggregate_id: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): DiagnosisCreatedDomainEvent {
    return new DiagnosisCreatedDomainEvent(
      aggregate_id,
      {
        patient_id: attributes.patient_id as string,
        summary: attributes.summary as string,
        cie_code: attributes.cie_code as string,
        certainty: attributes.certainty as string,
        state: attributes.state as string,
        income: attributes.income as string,
      },
      eventId,
      occurredOn,
    );
  }
}

