import { DomainError } from '../domain-error';

/**
 * Representation of a domain error that can be thrown when a resource is not found.
 */
export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
