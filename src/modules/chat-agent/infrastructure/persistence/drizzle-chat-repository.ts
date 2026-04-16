import { database } from "@/modules/shared/infrastructure/database/client";
import { Chat, ChatStatusValue } from "../../domain/chat";
import { ChatRepository } from "../../domain/chat-repository";
import { chat } from "./chat.schema";
import { and, eq } from "drizzle-orm";

export class DrizzleChatRepository extends ChatRepository {
  async saveChat(payload: Chat): Promise<void> {
    const primitives = payload.toPrimitives();
    const existingChat = await database.query.chat.findFirst({
      where: eq(chat.id, primitives.id),
    });

    if (existingChat) {
      await database
        .update(chat)
        .set({ messages: primitives.messages, title: primitives.title })
        .where(eq(chat.id, primitives.id));
    } else {
      await database.insert(chat).values(primitives);
    }
  }

  async getActiveChat(user_id: string): Promise<Chat | null> {
    const userChat = await database.query.chat.findFirst({
      where: and(eq(chat.user_id, user_id), eq(chat.status, ChatStatusValue.ACTIVE)),
      orderBy: (chat, { desc }) => [desc(chat.date)],
    });

    if (!userChat) {
      return null;
    }

    return Chat.fromPrimitives({
      ...userChat,
      messages: userChat.messages as any[],
      status: userChat.status as ChatStatusValue,
    });
  }

  async findById(chat_id: string): Promise<Chat | null> {
    const userChat = await database.query.chat.findFirst({
      where: eq(chat.id, chat_id),
    });

    if (!userChat) {
      return null;
    }

    return Chat.fromPrimitives({
      ...userChat,
      messages: userChat.messages as any[],
      status: userChat.status as ChatStatusValue,
    });
  }

  async archiveChat(payload: Chat): Promise<void> {
    const primitives = payload.toPrimitives();
    await database.update(chat).set({ status: primitives.status }).where(eq(chat.id, primitives.id));
  }
}

