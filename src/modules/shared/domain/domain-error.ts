type DomainErrorPrimitives = { message: string; params: Record<string, unknown> };
export abstract class DomainError extends Error {
  constructor(public readonly params: Record<string, unknown> = {}) {
    super();
  }

  abstract override get message(): string;

  toPrimitives(): DomainErrorPrimitives {
    return {
      message: this.message,
      params: this.params,
    };
  }
}

