import z from "zod";
import { Chat } from "../../domain/chat";
import { DrizzleChatRepository } from "../persistence/drizzle-chat-repository";

export async function getChat(user_id: string) {
  const respoistory = new DrizzleChatRepository();

  const chat = await respoistory.getChat(user_id);

  return chat?.toPrimitives() || null;
}

export async function saveChat(chat_id: string, user_id: string, messages: any[]) {
  const respoistory = new DrizzleChatRepository();
  const existingChat = await respoistory.getChat(user_id);

  if (existingChat) {
    existingChat.setMessages(messages);
    await respoistory.saveChat(existingChat);
  } else {
    const newChat = Chat.create(chat_id, messages, user_id);
    await respoistory.saveChat(newChat);
  }
}

export const agentContextSchema = z.object({
  user_id: z.uuid(),
});

export const getRequiredContext = (experimentalContext: unknown) => {
  const parsed = agentContextSchema.safeParse(experimentalContext);

  if (!parsed.success) {
    throw new Error("Agent tool context is missing. Ensure userId and organizationId are passed in call options.");
  }

  return parsed.data;
};

