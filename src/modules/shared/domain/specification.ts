export interface Predicate<T> {
  (candidate: T): boolean;
}

export abstract class Specification<T> {
  toPredicate(): Predicate<T> {
    return (candidate) => this.isSatisfiedBy(candidate);
  }
  abstract isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }
  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly first: Specification<T>,
    private readonly second: Specification<T>,
  ) {
    super();
  }
  isSatisfiedBy(candidate: T): boolean {
    return this.first.isSatisfiedBy(candidate) && this.second.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly first: Specification<T>,
    private readonly second: Specification<T>,
  ) {
    super();
  }
  isSatisfiedBy(candidate: T): boolean {
    return this.first.isSatisfiedBy(candidate) || this.second.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends Specification<T> {
  constructor(private readonly predicate: Specification<T>) {
    super();
  }
  isSatisfiedBy(candidate: T): boolean {
    return !this.predicate.isSatisfiedBy(candidate);
  }
}
export function and<T>(...specifications: Specification<T>[]): Specification<T> {
  return specifications.reduce((acc, spec) => acc.and(spec), specifications[0]);
}
export function or<T>(...specifications: Specification<T>[]): Specification<T> {
  return specifications.reduce((acc, spec) => acc.or(spec), specifications[0]);
}
export function not<T>(specification: Specification<T>): Specification<T> {
  return specification.not();
}

