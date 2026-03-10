import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject, StringValueObject, ValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class OfficeAddressId extends Uuid {}
export class OfficeAddressDoctorId extends Uuid {}
export class OfficeAddressText extends StringValueObject {}
export class OfficeAddressCreatedAt extends Timestamp {}
export class OfficeAddressUpdatedAt extends Timestamp {}

export class OfficeAddressLatitude extends NumberValueObject {}
export class OfficeAddressLongitude extends NumberValueObject {}
export class OfficeAddressLocation {
  constructor(
    public latitude: OfficeAddressLatitude,
    public longitude: OfficeAddressLongitude,
  ) {}

  toPrimitives(): Primitives<OfficeAddressLocation> {
    return {
      latitude: this.latitude.value,
      longitude: this.longitude.value,
    };
  }

  static fromPrimitives(primitives: Primitives<OfficeAddressLocation>): OfficeAddressLocation {
    return new OfficeAddressLocation(
      OfficeAddressLatitude.fromNumber(primitives.latitude),
      OfficeAddressLongitude.fromNumber(primitives.longitude),
    );
  }
}

export class OfficeAddress {
  constructor(
    public readonly id: OfficeAddressId,
    public readonly doctor_id: OfficeAddressDoctorId,
    public readonly address: OfficeAddressText,
    public readonly location: OfficeAddressLocation,
    public readonly created_at: OfficeAddressCreatedAt,
    public readonly updated_at: OfficeAddressUpdatedAt,
  ) {}

  toPrimitives(): Primitives<OfficeAddress> {
    return {
      id: this.id.value,
      doctor_id: this.doctor_id.value,
      address: this.address.value,
      location: this.location.toPrimitives(),
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<OfficeAddress>): OfficeAddress {
    return new OfficeAddress(
      OfficeAddressId.fromString(primitives.id),
      OfficeAddressDoctorId.fromString(primitives.doctor_id),
      OfficeAddressText.fromString(primitives.address),
      OfficeAddressLocation.fromPrimitives(primitives.location),
      OfficeAddressCreatedAt.fromDate(primitives.created_at),
      OfficeAddressUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(doctor_id: string, address: string, location: { latitude: number; longitude: number }): OfficeAddress {
    return new OfficeAddress(
      OfficeAddressId.generate(),
      OfficeAddressDoctorId.fromString(doctor_id),
      OfficeAddressText.fromString(address),
      OfficeAddressLocation.fromPrimitives(location),
      OfficeAddressCreatedAt.now(),
      OfficeAddressUpdatedAt.now(),
    );
  }

  update(address: string, location: { latitude: number; longitude: number }): OfficeAddress {
    return new OfficeAddress(
      this.id,
      this.doctor_id,
      OfficeAddressText.fromString(address),
      OfficeAddressLocation.fromPrimitives(location),
      this.created_at,
      OfficeAddressUpdatedAt.now(),
    );
  }
}

