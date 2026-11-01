import { CommonError } from "@/lib/utils/error";

export class BookingPageNotFound extends CommonError {
  constructor() {
    super("Este enlace de reservas no existe o está desactivado");
  }
}

export class SlotUnavailable extends CommonError {
  constructor() {
    super("Esa hora ya no está disponible. Elige otra, por favor");
  }
}

export class InvalidBookingOption extends CommonError {
  constructor(message: string) {
    super(message);
  }
}

export class PatientAccountRequired extends CommonError {
  constructor() {
    super("Para reservar, entra con una cuenta de paciente");
  }
}

export class OwnBookingPage extends CommonError {
  constructor() {
    super("Esta es tu propia página de reservas. Usa otra cuenta para probarla");
  }
}
