import { CommonError } from "@/lib/utils/error";

export class NoteNotFound extends CommonError {
  constructor() {
    super("Nota no encontrada");
  }
}

export class NoteAlreadySigned extends CommonError {
  constructor() {
    super("La nota ya está firmada y no se puede cambiar");
  }
}
