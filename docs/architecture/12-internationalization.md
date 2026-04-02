# Internationalization

The platform supports multiple languages using [next-intl](https://next-intl-docs.vercel.app/).

## Configuration

### Routing

**File**: `src/modules/shared/infrastructure/translation/routing.ts`

- **Supported locales**: `en` (English), `es` (Spanish)
- **Default locale**: `es` (Spanish)
- **Timezone**: `America/Caracas`

### Request Configuration

**File**: `src/modules/shared/infrastructure/translation/request.ts`

Locale resolution order:
1. `NEXT_LOCALE` cookie
2. URL parameter
3. Falls back to default locale (`es`)

Messages are loaded from JSON files: `./locales/${locale}.json`

### Next.js Integration

**File**: `next.config.ts`

The Next.js config is wrapped with `createNextIntlPlugin()`, pointing to the request configuration file.

## Message Files

- `src/modules/shared/infrastructure/translation/locales/en.json` - English translations
- `src/modules/shared/infrastructure/translation/locales/es.json` - Spanish translations

## Client-Side Provider

**File**: `src/modules/shared/presentation/providers.tsx`

`NextIntlClientProvider` wraps the application to provide translation access in client components.

## Usage

```typescript
import { useTranslations } from "next-intl";

export default function Component() {
  const t = useTranslations("namespace");
  return <h1>{t("title")}</h1>;
}
```
