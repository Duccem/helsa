import { CommonError } from "@/lib/utils/error";

export class AppointmentNotFound extends CommonError {
  constructor() {
    super("Cita no encontrada");
  }
}

export class AppointmentNotActive extends CommonError {
  constructor() {
    super("Esta cita ya no se puede cambiar");
  }
}

export class CancellationTooLate extends CommonError {
  constructor(hours: number) {
    super(`Solo puedes cancelar con ${hours} h de anticipación. Escríbele a tu terapeuta.`, { hours });
  }
}
