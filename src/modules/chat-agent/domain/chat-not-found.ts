import { DomainError } from "@/modules/shared/domain/domain-error";

export class ChatNotFound extends DomainError {
  constructor(chatId: string) {
    super({ chatId });
  }

  get message(): string {
    return `Chat with ID ${this.params.chatId} not found`;
  }
}

