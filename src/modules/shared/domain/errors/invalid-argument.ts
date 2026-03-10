import { DomainError } from "../domain-error";

export class InvalidArgument extends DomainError {
  constructor({ argument, value }: { argument: string; value: any }) {
    super({ argument, value });
  }

  get message(): string {
    return `Invalid argument: ${this.params.argument} with value ${this.params.value}`;
  }
}
