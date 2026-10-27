import { CommonError } from "@/lib/utils/error";

export class TherapistNotFound extends CommonError {
  constructor() {
    super("Terapeuta no encontrado")
  }
}

export class SlugAlreadyTaken extends CommonError {
  constructor(slug: string) {
    super(`The slug: ${slug} is already taken`)
  }
}