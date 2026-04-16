import { Chat } from "./chat";

export abstract class ChatRepository {
  abstract getActiveChat(user_id: string): Promise<Chat | null>;
  abstract findById(chat_id: string): Promise<Chat | null>;
  abstract saveChat(chat: Chat): Promise<void>;
  abstract archiveChat(chat: Chat): Promise<void>;
}

