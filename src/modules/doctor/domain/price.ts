import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class PriceId extends Uuid {}
export class PriceDoctorId extends Uuid {}
export class PriceCreatedAt extends Timestamp {}
export class PriceUpdatedAt extends Timestamp {}

export class PriceAmount extends NumberValueObject {
  override validate(): void {
    super.validate();
    if (this.value <= 0) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }
}

export class Price {
  constructor(
    public readonly id: PriceId,
    public readonly doctor_id: PriceDoctorId,
    public readonly amount: PriceAmount,
    public readonly created_at: PriceCreatedAt,
    public readonly updated_at: PriceUpdatedAt,
  ) {}

  toPrimitives(): Primitives<Price> {
    return {
      id: this.id.value,
      doctor_id: this.doctor_id.value,
      amount: this.amount.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Price>): Price {
    return new Price(
      PriceId.fromString(primitives.id),
      PriceDoctorId.fromString(primitives.doctor_id),
      PriceAmount.fromNumber(primitives.amount),
      PriceCreatedAt.fromDate(primitives.created_at),
      PriceUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(doctor_id: string, amount: number): Price {
    return new Price(
      PriceId.generate(),
      PriceDoctorId.fromString(doctor_id),
      PriceAmount.fromNumber(amount),
      PriceCreatedAt.now(),
      PriceUpdatedAt.now(),
    );
  }

  updateAmount(amount: number): Price {
    return new Price(this.id, this.doctor_id, PriceAmount.fromNumber(amount), this.created_at, PriceUpdatedAt.now());
  }
}

