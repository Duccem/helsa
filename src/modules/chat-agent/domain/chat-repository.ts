import { Chat } from "./chat";

export interface ChatRepository {
  getChat(user_id: string): Promise<Chat | null>;
  saveChat(chat: Chat): Promise<void>;
}
