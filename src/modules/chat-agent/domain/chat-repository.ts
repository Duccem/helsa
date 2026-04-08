import { Chat } from "./chat";

export abstract class ChatRepository {
  abstract getChat(user_id: string): Promise<Chat | null>;
  abstract saveChat(chat: Chat): Promise<void>;
}

