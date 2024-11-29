'use server';
import { client as RedisClient } from '@/modules/shared/infrastructure/persistence/redis/redis-client';
import { Chat, SettingsResponse } from './types';

export async function getAssistantSettings(): Promise<SettingsResponse> {
  // const user = await getCurrentUser();

  const userId = '46ae6c1c-6ff1-48a7-85ba-0521bc3716e4';

  const defaultSettings: SettingsResponse = {
    enabled: true,
  };

  const settings = await RedisClient.get(`assistant:user:${userId}:settings`);

  return {
    ...defaultSettings,
    ...(settings || {}),
  };
}

export async function saveChat(chat: Chat) {
  const pipeline = RedisClient.pipeline();
  pipeline.hmset(`chat:${chat.id}`, chat);

  const chatKey = `chat:user:${chat.userId}`;

  pipeline
    .zadd(chatKey, {
      score: Date.now(),
      member: `chat:${chat.id}`,
    })
    .expire(chatKey, 2592000);

  await pipeline.exec();
}

type SetAassistant = {
  settings: SettingsResponse;
  userId: string;
  teamId: string;
  params: {
    enabled?: boolean | undefined;
  };
};

export async function setAssistantSettings({ settings, params, userId }: SetAassistant) {
  return RedisClient.set(`assistant:user:${userId}:settings`, {
    ...settings,
    ...params,
  });
}

export async function clearChats({ userId }: { teamId: string; userId: string }) {
  const chats: string[] = await RedisClient.zrange(`chat:user:${userId}`, 0, -1);

  const pipeline = RedisClient.pipeline();

  for (const chat of chats) {
    pipeline.del(chat);
    pipeline.zrem(`chat:user:${userId}`, chat);
  }

  await pipeline.exec();
}

export async function getLatestChat() {
  const settings = await getAssistantSettings();
  if (!settings?.enabled) return null;

  //const user = await getCurrentUser();

  const userId = '46ae6c1c-6ff1-48a7-85ba-0521bc3716e4';

  try {
    const chat: string[] = await RedisClient.zrange(`chat:user:${userId}`, 0, 1, {
      rev: true,
    });

    const lastId = chat.at(0);

    if (lastId) {
      return RedisClient.hgetall(lastId);
    }
  } catch (error) {
    return null;
  }
}

export async function getChats() {
  //const user = await getCurrentUser();

  const userId = '46ae6c1c-6ff1-48a7-85ba-0521bc3716e4';

  try {
    const pipeline = RedisClient.pipeline();
    const chats: string[] = await RedisClient.zrange(`chat:user:${userId}`, 0, -1, {
      rev: true,
    });

    for (const chat of chats) {
      pipeline.hgetall(chat);
    }

    const results = await pipeline.exec();

    return results as Chat[];
  } catch (error) {
    return [];
  }
}

export async function getChat(id: string) {
  //const session = await getSession();

  const userId = '46ae6c1c-6ff1-48a7-85ba-0521bc3716e4';

  const chat = await RedisClient.hgetall<Chat>(`chat:${id}`);

  if (!chat || (userId && chat.userId !== userId)) {
    return null;
  }

  return chat;
}
