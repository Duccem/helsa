import { getHelsaAgent } from "@/modules/chat-agent/infrastructure/agents/helsa";
import { saveChat } from "@/modules/chat-agent/infrastructure/agents/utils";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { createAgentUIStreamResponse } from "ai";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { session } = await authenticate();

    const { messages, chat_id } = await req.json();

    return createAgentUIStreamResponse({
      agent: getHelsaAgent(),
      uiMessages: messages,
      options: {
        user_id: session.user.id,
      },
      onFinish: async ({ messages }) => {
        await saveChat(chat_id, session.user.id, messages);
      },
      onError: (error) => {
        console.error("Agent execution error:", error);
        return `An error occurred during agent execution`;
      },
    });
  } catch (error) {
    if (error instanceof NotAuthorized) {
      return HttpNextResponse.domainError(error, 401);
    }

    return HttpNextResponse.internalServerError();
  }
};

