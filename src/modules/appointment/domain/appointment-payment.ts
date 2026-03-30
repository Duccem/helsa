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
    public appointment_id: AppointmentPaymentAppointmentId,
    public amount: AppointmentPaymentAmount,
    public current_paid_amount: AppointmentPaymentCurrentPaidAmount,
    public currency: AppointmentPaymentCurrency,
    public payment_mode: AppointmentPaymentMode,
    public payment_method: AppointmentPaymentMethod,
    public payment_status: AppointmentPaymentStatus,
    public payment_date: AppointmentPaymentDate | null = null,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<AppointmentPayment> {
    return {
      id: this.id.value,
      appointment_id: this.appointment_id.value,
      amount: this.amount.value,
      current_paid_amount: this.current_paid_amount.value,
      currency: this.currency.value,
      payment_mode: this.payment_mode.value,
      payment_method: this.payment_method.value,
      payment_status: this.payment_status.value,
      payment_date: this.payment_date ? this.payment_date.value : null,
    };
  }

  static fromPrimitives(primitives: Primitives<AppointmentPayment>): AppointmentPayment {
    return new AppointmentPayment(
      new AppointmentPaymentId(primitives.id),
      new AppointmentPaymentAppointmentId(primitives.appointment_id),
      new AppointmentPaymentAmount(primitives.amount),
      new AppointmentPaymentCurrentPaidAmount(primitives.current_paid_amount),
      new AppointmentPaymentCurrency(primitives.currency),
      new AppointmentPaymentMode(primitives.payment_mode),
      new AppointmentPaymentMethod(primitives.payment_method),
      new AppointmentPaymentStatus(primitives.payment_status),
      primitives.payment_date ? new AppointmentPaymentDate(primitives.payment_date) : null,
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

