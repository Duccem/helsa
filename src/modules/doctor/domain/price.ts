import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class PriceId extends Uuid {}
export class PriceDoctorId extends Uuid {}
export class PricePaymentMode extends StringValueObject {}

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
    public id: PriceId,
    public doctor_id: PriceDoctorId,
    public amount: PriceAmount,
    public payment_mode: PricePaymentMode,
  ) {}

  toPrimitives(): Primitives<Price> {
    return {
      id: this.id.value,
      doctor_id: this.doctor_id.value,
      amount: this.amount.value,
      payment_mode: this.payment_mode.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Price>): Price {
    return new Price(
      PriceId.fromString(primitives.id),
      PriceDoctorId.fromString(primitives.doctor_id),
      PriceAmount.fromNumber(primitives.amount),
      PricePaymentMode.fromString(primitives.payment_mode),
    );
  }

  static create(doctor_id: string, amount: number, mode: string): Price {
    return new Price(
      PriceId.generate(),
      PriceDoctorId.fromString(doctor_id),
      PriceAmount.fromNumber(amount),
      PricePaymentMode.fromString(mode),
    );
  }

  updateAmount(amount: number) {
    this.amount = PriceAmount.fromNumber(amount);
  }
}

