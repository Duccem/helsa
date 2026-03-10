import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class ContactInfoId extends Uuid {}
export class ContactInfoPatientId extends Uuid {}
export class ContactInfoPhone extends StringValueObject {}
export class ContactInfoAddress extends StringValueObject {}
export class ContactInfoCreatedAt extends Timestamp {}
export class ContactInfoUpdatedAt extends Timestamp {}

export class ContactInfo {
  constructor(
    public readonly id: ContactInfoId,
    public readonly patient_id: ContactInfoPatientId,
    public readonly created_at: ContactInfoCreatedAt,
    public readonly updated_at: ContactInfoUpdatedAt,
    public readonly phone?: ContactInfoPhone,
    public readonly address?: ContactInfoAddress,
  ) {
    ContactInfo.ensureHasContactData(phone, address);
  }

  private static ensureHasContactData(phone?: ContactInfoPhone, address?: ContactInfoAddress): void {
    if (!phone && !address) {
      throw new InvalidArgument({
        argument: "ContactInfo",
        value: "phone or address is required",
      });
    }
  }

  toPrimitives(): Primitives<ContactInfo> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      phone: this.phone?.value,
      address: this.address?.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<ContactInfo>): ContactInfo {
    return new ContactInfo(
      ContactInfoId.fromString(primitives.id),
      ContactInfoPatientId.fromString(primitives.patient_id),
      ContactInfoCreatedAt.fromDate(primitives.created_at),
      ContactInfoUpdatedAt.fromDate(primitives.updated_at),
      primitives.phone ? ContactInfoPhone.fromString(primitives.phone) : undefined,
      primitives.address ? ContactInfoAddress.fromString(primitives.address) : undefined,
    );
  }

  static create(patient_id: string, params: { phone?: string; address?: string }): ContactInfo {
    return new ContactInfo(
      ContactInfoId.generate(),
      ContactInfoPatientId.fromString(patient_id),
      ContactInfoCreatedAt.now(),
      ContactInfoUpdatedAt.now(),
      params.phone ? ContactInfoPhone.fromString(params.phone) : undefined,
      params.address ? ContactInfoAddress.fromString(params.address) : undefined,
    );
  }
}

