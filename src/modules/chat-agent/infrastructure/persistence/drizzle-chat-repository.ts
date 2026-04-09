import { database } from "@/modules/shared/infrastructure/database/client";
import { Chat, ChatStatusValue } from "../../domain/chat";
import { ChatRepository } from "../../domain/chat-repository";
import { chat } from "./chat.schema";
import { eq } from "drizzle-orm";

export class DrizzleChatRepository extends ChatRepository {
  async saveChat(payload: Chat): Promise<void> {
    const primitives = payload.toPrimitives();
    const existingChat = await database.query.chat.findFirst({
      where: eq(chat.user_id, primitives.user_id),
    });

    if (existingChat) {
      await database.update(chat).set({ messages: primitives.messages }).where(eq(chat.user_id, primitives.user_id));
    } else {
      await database.insert(chat).values(primitives);
    }
  }

  async getChat(user_id: string): Promise<Chat | null> {
    const userChat = await database.query.chat.findFirst({
      where: eq(chat.user_id, user_id),
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
}

