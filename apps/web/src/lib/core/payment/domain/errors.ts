import { CommonError } from "@/lib/utils/error";

export class PaymentNotFound extends CommonError {
  constructor() {
    super("Pago no encontrado");
  }
}

export class PaymentAlreadyReviewed extends CommonError {
  constructor() {
    super("Este pago ya fue revisado.");
  }
}

export class PaymentSessionMismatch extends CommonError {
  constructor() {
    super("Alguna de las sesiones elegidas no es de este paciente.");
  }
}

export class PaymentProofMismatch extends CommonError {
  constructor() {
    super("El comprobante no pertenece a este paciente.");
  }
}

export class PaymentInFuture extends CommonError {
  constructor() {
    super("La fecha del pago no puede ser futura.");
  }
}

export class NothingOwed extends CommonError {
  constructor() {
    super("Este paciente no tiene saldo pendiente.");
  }
}

export class WhatsAppNotAllowed extends CommonError {
  constructor() {
    super("Este paciente no autorizó mensajes por WhatsApp.");
  }
}
