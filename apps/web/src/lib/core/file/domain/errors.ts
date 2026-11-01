import { CommonError } from "@/lib/utils/error";

export class FileNotFound extends CommonError {
  constructor() {
    super("Archivo no encontrado");
  }
}

export class FileRejected extends CommonError {
  constructor(reason: string) {
    super(reason);
  }
}
