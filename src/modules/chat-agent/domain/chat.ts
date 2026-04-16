import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { ChatMessage, ChatMessageRoleValue } from "./message";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
export class ChatId extends Uuid {}
export class ChatTitle extends StringValueObject {
  static init(lastMessageContent: string): ChatTitle {
    const maxLength = 50;
    const truncatedContent =
      lastMessageContent.length > maxLength ? lastMessageContent.slice(0, maxLength) + "..." : lastMessageContent;
    return new ChatTitle(truncatedContent);
  }
}
export class ChatUserId extends Uuid {}
export class ChatDate extends Timestamp {}

export enum ChatStatusValue {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export class ChatStatus extends Enum<ChatStatusValue> {
  constructor(value: ChatStatusValue) {
    super(value, Object.values(ChatStatusValue));
  }

  static fromString(value: string): ChatStatus {
    return new ChatStatus(value as ChatStatusValue);
  }

  static active(): ChatStatus {
    return new ChatStatus(ChatStatusValue.ACTIVE);
  }

  static archived(): ChatStatus {
    return new ChatStatus(ChatStatusValue.ARCHIVED);
  }
}

export class Chat extends Aggregate {
  constructor(
    public id: ChatId,
    public title: ChatTitle,
    public user_id: ChatUserId,
    public messages: ChatMessage[],
    public date: ChatDate,
    public status: ChatStatus,
  ) {
    super(id);
  }
  toPrimitives(): Primitives<Chat> {
    return {
      id: this.id.value,
      title: this.title.value,
      user_id: this.user_id.value,
      messages: this.messages.map((message) => message.toPrimitives()),
      date: this.date.value,
      status: this.status.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Chat>): Chat {
    return new Chat(
      ChatId.fromString(primitives.id),
      ChatTitle.fromString(primitives.messages[0].parts.find((p) => p.type === "text")?.text ?? "New Chat"),
      ChatUserId.fromString(primitives.user_id),
      primitives.messages.map((message) => ChatMessage.fromPrimitives(message)),
      ChatDate.fromDate(new Date(primitives.date)),
      ChatStatus.fromString(primitives.status),
    );
  }

  static create(chat_id: string, messages: Primitives<ChatMessage>[], user_id: string): Chat {
    const lastMessageContent =
      messages.length > 0
        ? (messages[messages.length - 1].parts.find((p) => p.type === "text")?.text ?? "New Chat")
        : "New Chat";
    return new Chat(
      ChatId.fromString(chat_id),
      ChatTitle.init(lastMessageContent),
      new ChatUserId(user_id),
      messages.map((message) =>
        ChatMessage.fromPrimitives({
          role: message.role as ChatMessageRoleValue,
          id: message.id,
          parts: message.parts ?? [],
        }),
      ),
      ChatDate.now(),
      ChatStatus.active(),
    );
  }

  archive(): void {
    this.status = ChatStatus.archived();
  }

  setMessages(messages: any[]) {
    this.messages = messages.map((message) => ChatMessage.fromPrimitives(message));
    if (messages.length > 0) {
      const lastMessageContent = messages
        .find((m) => m.parts.some((p: any) => p.type === "text"))
        ?.parts.find((p: any) => p.type === "text")?.text;
      this.title = ChatTitle.init(lastMessageContent);
    }
  }
}

