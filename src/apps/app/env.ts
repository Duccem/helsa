import { keys as ai } from '@helsa/ai/keys';
import { keys as auth } from '@helsa/auth/keys';
import { keys as cache } from '@helsa/cache/keys';
import { keys as database } from '@helsa/database/keys';
import { keys as emails } from '@helsa/email/keys';
import { keys as events } from '@helsa/events/keys';
import { keys as notifications } from '@helsa/notifications/keys';
import { keys as observability } from '@helsa/observability/keys';
import { keys as payments } from '@helsa/payment/keys';
import { keys as supabase } from '@helsa/supabase/keys';
import { keys as video } from '@helsa/video/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [
    ai(),
    auth(),
    database(),
    emails(),
    observability(),
    payments(),
    supabase(),
    video(),
    cache(),
    notifications(),
    events(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
