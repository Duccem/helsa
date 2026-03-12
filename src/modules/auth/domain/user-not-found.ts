import { DomainError } from "@/modules/shared/domain/domain-error";

export class UserNotFound extends DomainError {
  constructor(user_id: string) {
    super({ user_id });
  }

  get message(): string {
    return `User with id ${this.params.user_id} not found`;
  }
}
