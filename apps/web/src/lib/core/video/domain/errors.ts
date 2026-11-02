import { CommonError } from "@/lib/utils/error";

export class VideoSessionNotFound extends CommonError {
  constructor() {
    super("Esta sesión no existe o no es por videollamada");
  }
}

export class VideoAccessDenied extends CommonError {
  constructor() {
    super("No tienes acceso a esta sesión");
  }
}

export class VideoSessionNotActive extends CommonError {
  constructor() {
    super("Esta sesión ya terminó o fue cancelada");
  }
}
