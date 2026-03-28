import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { ValueObject } from "@/modules/shared/domain/value-object";
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

export class ChatMessage {
  constructor(
    public role: ChatMessageRole,
    public content: ChatMessageContent,
  ) {}

  toPrimitives(): Primitives<ChatMessage> {
    return {
      role: this.role.getValue(),
      content: this.content.value,
    };
  }

  static fromPrimitives(primitives: Primitives<ChatMessage>): ChatMessage {
    return new ChatMessage(new ChatMessageRole(primitives.role), new ChatMessageContent(primitives.content));
  }
}

