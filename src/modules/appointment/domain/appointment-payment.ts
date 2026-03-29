import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { AppointmentId } from "./appointment";

class AppointmentPaymentId extends Uuid {}
class AppointmentPaymentAppointmentId extends Uuid {}
class AppointmentPaymentAmount extends NumberValueObject {}
class AppointmentPaymentCurrentPaidAmount extends NumberValueObject {}
class AppointmentPaymentCurrency extends StringValueObject {}
class AppointmentPaymentMode extends StringValueObject {}
class AppointmentPaymentMethod extends StringValueObject {}
class AppointmentPaymentStatus extends StringValueObject {}
class AppointmentPaymentDate extends Timestamp {}

export class AppointmentPayment extends DomainEntity {
  constructor(
    id: AppointmentPaymentId,
    public appointmentId: AppointmentPaymentAppointmentId,
    public amount: AppointmentPaymentAmount,
    public currentPaidAmount: AppointmentPaymentCurrentPaidAmount,
    public currency: AppointmentPaymentCurrency,
    public paymentMode: AppointmentPaymentMode,
    public paymentMethod: AppointmentPaymentMethod,
    public paymentStatus: AppointmentPaymentStatus,
    public paymentDate: AppointmentPaymentDate | null = null,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<AppointmentPayment> {
    return {
      id: this.id.value,
      appointmentId: this.appointmentId.value,
      amount: this.amount.value,
      currentPaidAmount: this.currentPaidAmount.value,
      currency: this.currency.value,
      paymentMode: this.paymentMode.value,
      paymentMethod: this.paymentMethod.value,
      paymentStatus: this.paymentStatus.value,
      paymentDate: this.paymentDate ? this.paymentDate.value : null,
    };
  }

  static fromPrimitives(primitives: Primitives<AppointmentPayment>): AppointmentPayment {
    return new AppointmentPayment(
      new AppointmentPaymentId(primitives.id),
      new AppointmentPaymentAppointmentId(primitives.appointmentId),
      new AppointmentPaymentAmount(primitives.amount),
      new AppointmentPaymentCurrentPaidAmount(primitives.currentPaidAmount),
      new AppointmentPaymentCurrency(primitives.currency),
      new AppointmentPaymentMode(primitives.paymentMode),
      new AppointmentPaymentMethod(primitives.paymentMethod),
      new AppointmentPaymentStatus(primitives.paymentStatus),
      primitives.paymentDate ? new AppointmentPaymentDate(primitives.paymentDate) : null,
    );
  }

  static create(appointmentId: string, amount: number, currency: string, paymentMode: string): AppointmentPayment {
    return new AppointmentPayment(
      AppointmentPaymentId.generate(),
      new AppointmentPaymentAppointmentId(appointmentId),
      new AppointmentPaymentAmount(amount),
      new AppointmentPaymentCurrentPaidAmount(0),
      new AppointmentPaymentCurrency(currency),
      new AppointmentPaymentMode(paymentMode),
      new AppointmentPaymentMethod("OTHER"),
      new AppointmentPaymentStatus("PENDING"),
      null,
    );
  }
}

