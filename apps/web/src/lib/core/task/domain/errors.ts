import { CommonError } from "@/lib/utils/error";

export class TaskNotFound extends CommonError {
  constructor() {
    super("Tarea no encontrada");
  }
}

export class TaskNotActive extends CommonError {
  constructor() {
    super("La tarea ya no está activa");
  }
}
