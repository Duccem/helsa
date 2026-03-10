import { DomainError } from "../domain-error";

export class NotAuthorized extends DomainError {
  constructor(message: string = "Not authorized") {
    super({ message });
  }

  toPrimitives(): { message: string; params: Record<string, unknown> } {
    return {
      message: this.message,
      params: this.params,
    };
  }

  get message(): string {
    return this.params.message as string;
  }
}

