import { updateChat } from '@/src/actions/update-chat';
import { google } from '@helsa/ai';
import { convertToCoreMessages, streamText } from 'ai';
import { SYSTEM_HELSA_ASSISTANT_PROMPT } from './prompt';
import { getUpcomingAppointments } from './tools/get-upcoming-appointments';

export const helsaAssistant = (messages: Array<any>, user: { id: string }, chatId: string) => {
  const coreMessages = convertToCoreMessages(messages);
  const result = streamText({
    messages: coreMessages,
    system: SYSTEM_HELSA_ASSISTANT_PROMPT,
    model: google('gemini-2.0-flash'),
    onFinish: async ({ response }) => updateChat(chatId, user.id, coreMessages, response.messages),
    tools: {
      getUpcomingAppointments: getUpcomingAppointments(user.id),
    },
  });
  return result.toDataStreamResponse();
};
