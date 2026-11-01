import { CommonError } from "@/lib/utils/error";

export class PatientNotFound extends CommonError {
  constructor() {
    super("Paciente no encontrado");
  }
}
