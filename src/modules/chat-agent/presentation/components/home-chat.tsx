"use client";

import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/modules/shared/presentation/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/modules/shared/presentation/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/modules/shared/presentation/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/modules/shared/presentation/components/ai-elements/suggestion";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/shared/presentation/components/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { SquarePenIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ToolCallRenderer } from "./tool-call-renderer";
import { ToolResultsPanel } from "./tools/tool-results-panel";

const suggestions = [
  "Resume el historial clínico de mi próximo paciente",
  "¿Qué medicamentos tienen contraindicaciones con metformina?",
  "Genera una nota de evolución para el último paciente atendido",
  "¿Cuáles son los criterios diagnósticos para hipertensión arterial?",
  "Revisa las citas pendientes de hoy",
  "Sugiere un plan de tratamiento para diabetes tipo 2",
];

type ActiveChatResponse = {
  id: string;
  messages: UIMessage[];
} | null;

export const HomeChat = () => {
  const [text, setText] = useState<string>("");
  const [newChatId, setNewChatId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: activeChat } = useQuery<ActiveChatResponse>({
    queryKey: ["active-chat"],
    queryFn: async () => {
      const response = await fetch("/api/chat");
      if (!response.ok) throw new Error("Failed to fetch active chat");
      return response.json();
    },
    refetchOnWindowFocus: false,
    initialData: null,
  });

  const chatId = useMemo(() => newChatId ?? activeChat?.id ?? Uuid.generate().value, [newChatId, activeChat?.id]);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/helsa",
      body: { chat_id: chatId },
    }),
  });

  const { mutate: archiveAndReset, isPending: isArchiving } = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chat/${chatId}/archive`, { method: "PATCH" });
      if (!response.ok) throw new Error("Failed to archive chat");
    },
    onSuccess: () => {
      setNewChatId(Uuid.generate().value);
      setMessages([]);
      queryClient.setQueryData(["active-chat"], null);
    },
  });

  useEffect(() => {
    if (activeChat?.messages?.length && !newChatId) {
      setMessages(activeChat.messages as UIMessage[]);
    }
  }, [activeChat, setMessages, newChatId]);

  const handleNewChat = useCallback(() => {
    const currentId = activeChat?.id;
    if (currentId) {
      archiveAndReset(currentId);
    } else {
      setNewChatId(Uuid.generate().value);
      setMessages([]);
    }
  }, [activeChat?.id, archiveAndReset, setMessages]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ parts: [{ type: "text", text: trimmed }] });
    setText("");
  }, [text, sendMessage]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage({ parts: [{ type: "text", text: suggestion }] });
    },
    [sendMessage],
  );

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  }, []);

  const isSubmitDisabled = useMemo(
    () => !text.trim() || status === "streaming" || status === "submitted",
    [text, status],
  );

  const showSuggestions = messages.length === 0;

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row">
      <div className="relative flex max-h-[700px] flex-1 flex-col divide-y overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex shrink-0 items-center justify-between px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Helsa AI</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button disabled={isArchiving} onClick={handleNewChat} size="icon-sm" variant="ghost">
                  <SquarePenIcon className="size-4" />
                </Button>
              }
            />

            <TooltipContent>Nueva conversación</TooltipContent>
          </Tooltip>
        </div>
        <Conversation>
          <ConversationContent className="min-h-[500px]">
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return <MessageResponse key={i}>{part.text}</MessageResponse>;
                    }
                    if (part.type.startsWith("tool-")) {
                      return <ToolCallRenderer key={i} part={part as any} />;
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="grid shrink-0 gap-4 pt-4">
          {showSuggestions && (
            <Suggestions className="px-4">
              {suggestions.map((suggestion) => (
                <Suggestion key={suggestion} onClick={handleSuggestionClick} suggestion={suggestion} />
              ))}
            </Suggestions>
          )}
          <div className="w-full px-4 pb-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea onChange={handleTextChange} value={text} placeholder="Consulta con Helsa" />
              </PromptInputBody>
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>

      <ToolResultsPanel messages={messages} />
    </div>
  );
};
