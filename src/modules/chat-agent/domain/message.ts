import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject, ValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";

export enum ChatMessageRoleValue {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
  TOOL = "tool",
}

export class ChatMessageRole extends Enum<ChatMessageRoleValue> {
  constructor(value: ChatMessageRoleValue) {
    super(value, Object.values(ChatMessageRoleValue));
  }
}

export class ChatMessageContent extends ValueObject<any> {
  validate(): void {
    if (this.value === null || this.value === undefined) {
      throw new InvalidArgument({ argument: "content", value: this.value });
    }
  }
}

export class ChatMessagePart extends ValueObject<{ type?: string; text?: string; state?: string }> {
  validate(): void {
    const { type, text } = this.value;
    if (type === "text" && (text === undefined || text === null)) {
      throw new InvalidArgument({ argument: "content part", value: this.value });
    }
  }
}

export class ChatMessageId extends ValueObject<string> {
  validate(): void {
    return;
  }
}

export class ChatMessage {
  constructor(
    public role: ChatMessageRole,
    public id: ChatMessageId,
    public parts: ChatMessagePart[],
  ) {}

  toPrimitives(): Primitives<ChatMessage> {
    return {
      role: this.role.value,
      id: this.id.value,
      parts: this.parts.map((part) => part.value),
    };
  }

  static fromPrimitives(primitives: Primitives<ChatMessage>): ChatMessage {
    return new ChatMessage(
      new ChatMessageRole(primitives.role),
      new ChatMessageId(primitives.id),
      primitives.parts.map((part) => new ChatMessagePart(part)),
    );
  }
}

