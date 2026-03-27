export type Success<R> = { kind: "success"; value: R };
export type Failure<E> = { kind: "failure"; error: E };

export class Result<R, E> {
  private constructor(private readonly result: Success<R> | Failure<E>) {}

  get value(): R | undefined {
    if (this.result.kind === "success") {
      return this.result.value;
    }
    return undefined;
  }

  get error(): E | undefined {
    if (this.result.kind === "failure") {
      return this.result.error;
    }
    return undefined;
  }

  static success<R, E>(value: R): Result<R, E> {
    return new Result<R, E>({ kind: "success", value });
  }

  static failure<R, E>(error: E): Result<R, E> {
    return new Result<R, E>({ kind: "failure", error });
  }

  isSuccess(): this is Result<R, never> {
    return this.result.kind === "success";
  }

  isFailure(): this is Result<never, E> {
    return this.result.kind === "failure";
  }

  match<U>(onSuccess: (value: R) => U, onFail: (error: E) => U): U {
    switch (this.result.kind) {
      case "failure":
        return onFail(this.result.error);
      case "success":
        return onSuccess(this.result.value);
    }
  }

  map<U>(fn: (value: R) => U): Result<U, E> {
    return this.match(
      (value) => Result.success(fn(value)),
      (error) => Result.failure(error),
    );
  }

  orElse(defaultValue: R): R {
    return this.match(
      (value) => value,
      () => defaultValue,
    );
  }

  orThrow(e: E): R {
    return this.match(
      (value) => value,
      (error) => {
        if (e) throw e;
        throw error;
      },
    );
  }

  static run<R, E>(closure: () => R): Result<R, E> {
    try {
      const result = closure();
      return Result.success(result);
    } catch (error) {
      return Result.failure(error as E);
    }
  }

  static async runPromise<R, E>(closure: () => Promise<R>): Promise<Result<R, E>> {
    try {
      const result = await closure();
      return Result.success(result);
    } catch (error) {
      return Result.failure(error as E);
    }
  }
}

export function ok<R>(value: R): Result<R, never> {
  return Result.success(value);
}

export function failure<E>(error: E): Result<never, E> {
  return Result.failure(error);
}

