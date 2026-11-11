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

export class TaskNotStarted extends CommonError {
  constructor() {
    super("Esta tarea todavía no ha empezado");
  }
}

export class MoodRequired extends CommonError {
  constructor() {
    super("Marca cómo te sientes del 1 al 10");
  }
}
