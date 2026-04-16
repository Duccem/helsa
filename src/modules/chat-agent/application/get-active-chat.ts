import { Primitives } from "@/modules/shared/domain/primitives";
import { Chat } from "../domain/chat";
import { ChatRepository } from "../domain/chat-repository";

export class GetActiveChat {
  constructor(private readonly repository: ChatRepository) {}

  async execute(userId: string): Promise<Primitives<Chat> | null> {
    const chat = await this.repository.getActiveChat(userId);

    if (!chat) {
      return null;
    }

    return chat.toPrimitives();
  }
}

