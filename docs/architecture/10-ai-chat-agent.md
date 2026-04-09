# AI Chat Agent

The platform includes an AI-powered mental health support assistant built with the Vercel AI SDK and Google Gemini.

## Architecture

```
chat-agent/
├── domain/
│   ├── chat.ts                    # Chat aggregate (id, title, user, messages, status)
│   ├── chat-message.ts            # ChatMessage entity (role, content)
│   └── chat-repository.ts         # Repository port (abstract class)
├── infrastructure/
│   ├── agents/helsa/index.ts      # ToolLoopAgent configuration
│   ├── persistence/
│   │   ├── chat.schema.ts         # Drizzle schema
│   │   └── drizzle-chat-repository.ts
│   └── ...
└── presentation/
    └── ...                        # Chat UI components
```

## Agent Configuration

**File**: `src/modules/chat-agent/infrastructure/agents/helsa/index.ts`

- **Model**: Google Gemini 3-flash (`@ai-sdk/google`)
- **Type**: `ToolLoopAgent` from Vercel AI SDK
- **Max Steps**: 5 (stops after 5 reasoning steps)
- **Context**: Receives user profile and session data via `agentContextSchema`

## System Instructions

The agent is configured as an empathetic mental health support assistant with:

- Mental health information (conditions, treatments, coping strategies)
- Personalized insights based on user profile and history
- Self-care guidance and wellness recommendations
- Crisis detection for risk factors (self-harm, suicidal thoughts, substance abuse)
- Professional help referrals when appropriate
- Strict confidentiality guarantees

## Chat Domain Model

### Chat Aggregate
- `id` - Unique identifier
- `title` - Auto-generated from the first user message
- `user_id` - Owner of the chat
- `messages` - Collection of ChatMessage entities
- `status` - ACTIVE or ARCHIVED
- `date` - Creation timestamp

### ChatMessage
- `role` - "user" or "assistant"
- `content` - Message text

## Database Schema

- `chat` table: id, title, user_id, status, date
- `chat_message` table: id, content, role, chat_id (foreign key)

## API Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat/helsa` | Send a message and receive an AI response |

## Dependencies

- `ai` - Vercel AI SDK (agent abstraction, streaming)
- `@ai-sdk/google` - Google AI model provider
- `@ai-sdk/react` - React hooks for chat UI
