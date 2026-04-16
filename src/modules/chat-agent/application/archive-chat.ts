import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { ChatNotFound } from "../domain/chat-not-found";
import { ChatRepository } from "../domain/chat-repository";

export class ArchiveChat {
  constructor(private readonly repository: ChatRepository) {}

  async execute(chatId: string, userId: string): Promise<void> {
    const chat = await this.repository.findById(chatId);

    if (!chat) {
      throw new ChatNotFound(chatId);
    }

    if (chat.user_id.value !== userId) {
      throw new NotAuthorized();
    }

    chat.archive();

    await this.repository.archiveChat(chat);
  }
}

