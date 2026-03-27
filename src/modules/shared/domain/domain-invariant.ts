export interface Predicate<T> {
  (candidate: T): boolean;
}
export class DomainInvariant<T> {
  constructor(
    public readonly message: string,
    public readonly predicate: Predicate<T>,
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.predicate(candidate);
  }

  and(other: DomainInvariant<T>): DomainInvariant<T> {
    return new AndDomainInvariant(this.message, [this, other]);
  }

  or(other: DomainInvariant<T>): DomainInvariant<T> {
    return new OrDomainInvariant(this.message, [this, other]);
  }

  not(): DomainInvariant<T> {
    return new NotDomainInvariant(this.message, this);
  }
}

export class AndDomainInvariant<T> extends DomainInvariant<T> {
  constructor(message: string, invariants: DomainInvariant<T>[]) {
    super(message, (candidate) => invariants.every((invariant) => invariant.isSatisfiedBy(candidate)));
  }
}

export class OrDomainInvariant<T> extends DomainInvariant<T> {
  constructor(message: string, invariants: DomainInvariant<T>[]) {
    super(message, (candidate) => invariants.some((invariant) => invariant.isSatisfiedBy(candidate)));
  }
}

export class NotDomainInvariant<T> extends DomainInvariant<T> {
  constructor(message: string, invariant: DomainInvariant<T>) {
    super(message, (candidate) => !invariant.isSatisfiedBy(candidate));
  }
}

export function and<T>(message: string, ...invariants: DomainInvariant<T>[]): DomainInvariant<T> {
  return new AndDomainInvariant(message, invariants);
}

export function or<T>(message: string, ...invariants: DomainInvariant<T>[]): DomainInvariant<T> {
  return new OrDomainInvariant(message, invariants);
}

export function not<T>(message: string, invariant: DomainInvariant<T>): DomainInvariant<T> {
  return new NotDomainInvariant(message, invariant);
}

