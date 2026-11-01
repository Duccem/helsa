# Core: lógica de negocio por agregado

Toda la lógica de negocio vive en `apps/web/src/lib/core`. Cada agregado (ej. `therapist`, `settings`) es una carpeta con tres capas:

```
lib/core/
└── <agregado>/
    ├── domain/
    │   ├── types.ts        # Tipos del agregado (inferidos del schema de Drizzle)
    │   └── errors.ts       # Errores de dominio
    ├── adapters/
    │   └── <agregado>-repository.ts   # Único punto de acceso a la base de datos
    └── use-cases/
        └── <verbo>-<sustantivo>.ts    # Un archivo por caso de uso
```

Las rutas API y las páginas **solo** consumen casos de uso. Nunca llaman al repositorio ni a `db` directamente.

```
route.ts / page.tsx  →  use-case  →  repository  →  db
```

## Reglas

- Un agregado = una carpeta en `lib/core`, nombre en singular y en minúsculas.
- Los nombres de archivo van en `kebab-case`; las clases en `PascalCase`.
- Un caso de uso puede usar repositorios o casos de uso de otro agregado importándolos por ruta relativa (`../../therapist/...`).
- Las transformaciones genéricas (fechas, días de la semana, defaults) van en `lib/utils`, no en el core.

## `domain/types.ts`

Los tipos se infieren del schema de `@helsa/db`. No se redefinen a mano.

```ts
import type { therapist, therapist_rate } from "@helsa/db/schema/therapist";

export type Therapist = typeof therapist.$inferSelect;
export type TherapistRate = typeof therapist_rate.$inferSelect;
```

## `domain/errors.ts`

Cada error de negocio es una clase que extiende `CommonError` (`lib/utils/error.ts`). El mensaje se define dentro del constructor.

```ts
import { CommonError } from "@/lib/utils/error";

export class TherapistNotFound extends CommonError {
  constructor() {
    super("Terapeuta no encontrado");
  }
}

export class SlugAlreadyTaken extends CommonError {
  constructor(slug: string) {
    super(`The slug: ${slug} is already taken`);
  }
}
```

## `adapters/<agregado>-repository.ts`

- Una clase `<Agregado>Repository` por agregado.
- Es el único lugar donde se importa `db` y las tablas del schema.
- Solo hace persistencia: sin validaciones ni reglas de negocio.
- Métodos de lectura: `getById`, `getBySlug`, `getRates`… Devuelven la fila o `undefined`.
- Métodos de escritura: `create`, `update`, `save*`, `delete*`. Devuelven `void`.
- Las tablas hijas del agregado (tarifas, reglas, bloqueos) se gestionan desde el mismo repositorio.

```ts
import { eq } from "@helsa/db/operators";
import { therapist } from "@helsa/db/schema/therapist";
import { db } from "@/services";
import type { Therapist } from "../domain/types";

export class TherapistRepository {
  async getById(id: string) {
    const [response] = await db
      .select()
      .from(therapist)
      .where(eq(therapist.user_id, id))
      .limit(1);

    return response;
  }

  async update(data: Therapist) {
    await db.update(therapist).set(data).where(eq(therapist.user_id, data.user_id));
  }
}
```

## `use-cases/<verbo>-<sustantivo>.ts`

- Una clase por archivo con un único método público: `execute`.
- El input se tipa con un `type <CasoDeUso>Input` declarado en el mismo archivo.
- Firma: `execute(data, user)`. El usuario autenticado (`BetterUser`) va como último argumento.
- Las dependencias se instancian como propiedades privadas de la clase.
- Flujo: asegurar precondiciones → cargar el agregado → lanzar error de dominio si falta → transformar → persistir.
- El mapeo del input al modelo de base de datos va en métodos `private` de la clase.

```ts
import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../adapters/therapist-repository";
import { TherapistNotFound } from "../domain/errors";
import type { Therapist } from "../domain/types";
import { EnsureTherapist } from "./ensure-therapist";

type SaveProfessionalInput = {
  displayName: string;
  bio: string | null;
  specialties: string[];
};

export class SaveProfessional {
  private repository = new TherapistRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: SaveProfessionalInput, user: BetterUser) {
    await this.ensurer.execute(user);

    const therapist = await this.repository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    await this.repository.update(this.updateProfessionalData(data, therapist));
  }

  private updateProfessionalData(data: SaveProfessionalInput, therapist: Therapist) {
    return {
      ...therapist,
      display_name: data.displayName,
      bio: data.bio,
      specialties: [...new Set(data.specialties)],
    };
  }
}
```

### Casos de uso de lectura (`Load*`)

Devuelven datos listos para la UI (camelCase) y rellenan valores faltantes con `withDefaults`. Si necesitan varias fuentes, las cargan en paralelo con `Promise.all`.

```ts
import { withDefaults } from "@/lib/utils/with-defaults";
import { SettingsRepository } from "../adapters/settings-repository";

export const defaultPreferences = {
  timeFormat: "24h",
  weekStartsOn: 0,
  currencyDisplay: "both",
  privateMode: false,
};

export class LoadPreferences {
  private repository = new SettingsRepository();

  async execute(user_id: string) {
    const row = await this.repository.getSettings(user_id);

    return withDefaults(defaultPreferences, row?.preferences);
  }
}
```

### Composición entre casos de uso

Un caso de uso puede invocar a otro como precondición. Ejemplo: `EnsureTherapist` crea el perfil si no existe y lo usan todos los `Save*` del agregado `therapist`.

```ts
export class EnsureTherapist {
  private repository = new TherapistRepository();

  async execute(user: { id: string; name: string }) {
    await this.repository.create(user); // onConflictDoNothing
  }
}
```

## Consumo desde la capa de entrega

### Rutas API

El caso de uso se instancia una vez a nivel de módulo. La ruta valida el body con Zod, llama a `execute` y traduce los errores de dominio a códigos HTTP en el handler de errores de `withAuth`.

```ts
import type { NextRequest } from "next/server";
import { bookingSchema } from "@/components/dashboard/settings/schema";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { SlugAlreadyTaken, TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { SaveBookingInfo } from "@/lib/core/therapist/use-cases/save-booking-info";

const saveBooking = new SaveBookingInfo();

export const PUT = withAuth(
  async (request: NextRequest, _, ctx: AuthContext) => {
    const parsed = bookingSchema.parse(await readJson(request));
    await saveBooking.execute(parsed, ctx.user);
    return ok();
  },
  (error: TherapistNotFound | SlugAlreadyTaken) => {
    switch (true) {
      case error instanceof TherapistNotFound:
        return domainError(error, 404);
      case error instanceof SlugAlreadyTaken:
        return domainError(error, 400);
      default:
        return internalServerError();
    }
  },
);
```

### Server Components

```ts
import { LoadTherapistSettings } from "@/lib/core/settings/use-cases/load-therapist-settings";

const loadTherapistSettings = new LoadTherapistSettings();

export default async function Page() {
  // ...obtener user de la sesión
  const settings = await loadTherapistSettings.execute(user);
  // ...
}
```

## Checklist para un nuevo agregado

1. Crear `lib/core/<agregado>/{domain,adapters,use-cases}`.
2. `domain/types.ts` con los tipos inferidos del schema.
3. `domain/errors.ts` con los errores que extienden `CommonError`.
4. `adapters/<agregado>-repository.ts` con las consultas a `db`.
5. Un archivo por caso de uso en `use-cases/`, con una clase y un método `execute`.
6. Consumir los casos de uso desde `app/(server)/api/...` o desde las páginas, mapeando los errores de dominio a HTTP.
