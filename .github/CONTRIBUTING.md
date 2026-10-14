# Guía de contribución — ECommerce

¡Gracias por tu interés en contribuir a **Helsa Server**! Esta guía describe el flujo de trabajo, las convenciones de código y los criterios de revisión que usamos en el repositorio. Léela completa antes de tu primer PR; te ahorrará revisiones largas.

> Si todavía no conoces la arquitectura del proyecto, empieza por el [README](../README.md) y por [docs/01-architecture.md](../docs/01-architecture.md).

---

## Tabla de contenidos

- [Guía de contribución — ECommerce](#guía-de-contribución--ecommerce)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [1. Antes de empezar](#1-antes-de-empezar)
  - [2. Configuración del entorno](#2-configuración-del-entorno)
  - [3. Flujo de trabajo (branching)](#3-flujo-de-trabajo-branching)
  - [4. Convención de commits](#4-convención-de-commits)
  - [5. Estilo y convenciones de código](#5-estilo-y-convenciones-de-código)
  - [6. Arquitectura: dónde poner cada cosa](#6-arquitectura-dónde-poner-cada-cosa)
  - [7. Tests](#7-tests)
  - [8. Base de datos y migraciones](#8-base-de-datos-y-migraciones)
  - [9. Documentación](#9-documentación)
  - [10. Pull Requests](#10-pull-requests)
  - [11. Seguridad](#11-seguridad)
  - [12. Reporte de bugs y propuestas](#12-reporte-de-bugs-y-propuestas)

---

## 1. Antes de empezar

- **Discute primero los cambios grandes.** Si tu PR introduce un nuevo bounded context, una integración externa, un cambio de arquitectura o rompe contratos públicos, abre un _issue_ o discútelo con el equipo antes de codificar.
- **Un PR = un propósito.** No mezcles refactors, fixes y features en el mismo PR. Es mejor varios PRs pequeños que uno gigante.
- **No introduzcas cambios fuera del alcance acordado** (renombrar variables no relacionadas, reformatear archivos completos, "limpiar" código vecino, etc.).

## 2. Configuración del entorno

Requisitos previos:

- **Node.js 24** (la versión usada en CI; ver [`.github/workflows/deploy-dev.yml`](workflows/deploy-dev.yml)).
- **Docker** para RabbitMQ (y opcionalmente para el stack Jitsi).
- Una base de datos PostgreSQL accesible (Neon en producción; cualquier Postgres compatible local).

Setup inicial:

```bash
# 1. Instalar dependencias (CI usa --legacy-peer-deps; replícalo si tienes conflictos)
npm install

# 2. Variables de entorno
cp .env.example .env   # y completa los valores

# 3. Servicios auxiliares
docker compose up -d rabbitmq

# 4. Migraciones
npm run database:migrate

# 5. Servidor en modo desarrollo
npm run dev
```

Scripts útiles:

| Script                     | Para qué                                               |
| -------------------------- | ------------------------------------------------------ |
| `npm run dev`              | Servidor con recarga (nodemon + ts-node + SWC).        |
| `npm run build`            | Compila TypeScript y resuelve alias.                   |
| `npm test`                 | Corre Vitest (lo mismo que CI).                        |
| `npm run test:watch`       | Tests en watch mode.                                   |
| `npm run database:build`   | Genera migraciones a partir de los schemas de Drizzle. |
| `npm run database:migrate` | Aplica migraciones pendientes.                         |
| `npm run database:dev`     | Drizzle Studio en `:3001`.                             |

## 3. Flujo de trabajo (branching)

- La rama principal es **`main`** y debe permanecer siempre desplegable. Cada push a `main` dispara el workflow [`deploy-dev.yml`](workflows/deploy-dev.yml).
- **No se hace push directo a `main`.** Todo cambio entra vía Pull Request.
- Crea ramas desde `main` con el prefijo correspondiente al tipo de cambio y un slug descriptivo:

  ```
  feat/appointment-reschedule
  fix/schedule-availability-tz
  refactor/shared-event-bus
  docs/medical-record-context
  chore/update-vitest
  ```

- Mantén la rama actualizada con `main` mediante **rebase** (preferido) o merge cuando sea necesario para resolver conflictos.
- **Nunca** uses `git push --force` sobre `main`. Sobre tu propia rama de feature, prefiere `--force-with-lease`.

## 4. Convención de commits

Seguimos **[Conventional Commits](https://www.conventionalcommits.org/)** — observa el `git log` del proyecto para más ejemplos.

```
<tipo>(<scope opcional>): <resumen en imperativo, sin punto final>
```

Tipos permitidos:

| Tipo       | Cuándo usarlo                                           |
| ---------- | ------------------------------------------------------- |
| `feat`     | Nueva funcionalidad de negocio.                         |
| `fix`      | Corrección de bug.                                      |
| `refactor` | Cambio interno sin alterar el comportamiento.           |
| `docs`     | Solo documentación (incluye `docs/`, READMEs, OpenAPI). |
| `test`     | Cambios solo en tests.                                  |
| `chore`    | Tareas auxiliares (deps, formatos, etc.).               |
| `ci`       | Pipelines / GitHub Actions.                             |
| `perf`     | Cambios orientados a rendimiento.                       |

El **scope** debería ser el bounded context o módulo afectado:

```
feat(appointment): agregar endpoint de reagendamiento
fix(schedule): corregir cálculo de slots cuando el día tiene gaps
docs(medical-record): documentar el aggregate root
refactor(shared): extraer EventBus a un puerto explícito
```

Reglas:

- Resumen ≤ 72 caracteres, en **minúsculas**, modo imperativo ("agrega" → no "agregado", "agregando").
- Si el commit introduce un breaking change, agrégalo en el cuerpo con `BREAKING CHANGE: <descripción>`.
- **No uses `--no-verify`** para saltarte hooks. Si un hook falla, arregla la causa.
- **No incluyas credenciales** ni datos de pacientes/usuarios en mensajes, snapshots o fixtures.

## 5. Estilo y convenciones de código

- **TypeScript estricto** — respeta el `tsconfig.json`. Evita `any`; si lo necesitas puntualmente, justifícalo en el PR.
- **Nombres de archivo en `kebab-case`** (`schedule-appointment.ts`, `appointment-rating.ts`).
- **Clases en `PascalCase`** (Aggregates, Use Cases, ValueObjects).
- **Columnas de DB y campos primitivos en `snake_case`** dentro de `toPrimitives()`; `camelCase` puntual solo donde lo exige una librería externa (ej. BetterAuth).
- **Imports con alias `@/`** (definido en `tsconfig.json`) en vez de paths relativos largos.
- **Comentarios escasos**: el código y los nombres ya explican el _qué_; comenta solo el _por qué_ cuando no sea obvio (invariantes, workarounds, decisiones).
- **No introduzcas lógica de negocio fuera del dominio.** Los routers, repositorios y servicios externos NO deben tomar decisiones de negocio.
- **Usa `Result<T, E>`** para flujos esperables; reserva las excepciones para fallos verdaderamente excepcionales.
- **No commitees archivos generados** (`dist/`, coverage, `.env*`, archivos de IDE, etc.). Si falta algo en `.gitignore`, añádelo en el mismo PR.

## 6. Arquitectura: dónde poner cada cosa

Helsa Server sigue **DDD táctico + arquitectura hexagonal** organizada por _bounded contexts_. Antes de codificar, ubica tu cambio:

```
src/contexts/<area>/<context>/
├── application/      # Use Cases (orquestación, sin reglas de negocio)
│   └── event-handlers/  (opcional)
├── domain/           # Aggregates, Entities, ValueObjects, Domain Events, Ports
└── infrastructure/   # Adaptadores: Drizzle repos, integraciones externas, middlewares
```

Reglas direccionales:

- `domain/` **no** importa de `application/` ni de `infrastructure/`, ni de librerías externas (excepto utilidades puras).
- `application/` **no** importa de `infrastructure/`. Depende solo de puertos del dominio.
- `infrastructure/` puede importar de los dos anteriores e implementa los puertos.
- La comunicación entre bounded contexts es **vía Domain Events** publicados en RabbitMQ; no instancies directamente código de otro contexto.

Donde encaja cada cosa:

- **Nuevo endpoint HTTP** → router en `src/app/routers/<context>.ts` + use case en `application/`.
- **Nueva regla de negocio** → vive en un `Aggregate`/`Entity`/`ValueObject` del `domain/`.
- **Nueva integración externa** (HTTP, SDK) → un puerto en `domain/` + un adaptador en `infrastructure/`, registrado en el contenedor Diod.
- **Job programado** → use case + handler en `src/app/crons/`.
- **Consumir eventos de otro contexto** → un event handler en `application/event-handlers/`.

Si dudas, lee [docs/01-architecture.md](../docs/01-architecture.md) y el documento del contexto correspondiente en [docs/](../docs/README.md).

## 7. Tests

- Usamos **Vitest**. Los tests viven en [`test/`](../test/) replicando la estructura de `src/`.
- **Cubre con tests unitarios la lógica de dominio y los use cases.** Los aggregates y value objects son el corazón del sistema y deben tener tests.
- Para repositorios e integraciones externas, prefiere **tests de integración** con dobles a nivel de puerto, no mocks profundos del SDK.
- Antes de pedir review:

  ```bash
  npm run build   # asegura que compila
  npm test        # asegura que la suite pasa
  ```

- **No subas tests que dependan de servicios remotos vivos** (Polar, SACS, etc.). Si necesitas validar contra ellos, documéntalo en el PR pero deja la prueba como manual.
- **Datos de prueba**: usa builders/factories en `test/`, nunca datos personales reales.

## 8. Base de datos y migraciones

- Los schemas de Drizzle viven en `src/contexts/shared/infrastructure/database/`.
- Para crear una migración:
  1. Edita el schema correspondiente.
  2. `npm run database:build` — genera el SQL.
  3. **Revisa el SQL generado** antes de commitearlo. Drizzle Kit a veces propone cambios destructivos no deseados.
  4. `npm run database:migrate` localmente para validar.

- Reglas obligatorias:
  - **Nunca edites una migración ya mergeada.** Crea una nueva.
  - **Ningún cambio destructivo silencioso** (drop column/table, type narrowing). Si es necesario, hazlo explícito en el PR y coordina con el equipo.
  - **Las migraciones deben ser idempotentes y reversibles conceptualmente** (aunque no escribamos el `down`).
  - **No commitees credenciales** ni dumps de datos.

## 9. Documentación

La documentación detallada vive en [`docs/`](../docs/) (en español). Actualízala cuando:

- Agregues o cambies un bounded context → el documento `docs/NN-bounded-context-<name>.md`.
- Modifiques contratos públicos (endpoints, eventos, schemas) → actualiza [`docs/15-api-reference.md`](../docs/15-api-reference.md), [`docs/13-database-schema.md`](../docs/13-database-schema.md) y/o [`docs/14-event-flows.md`](../docs/14-event-flows.md).
- Cambies la infraestructura compartida → [`docs/05-shared-infrastructure.md`](../docs/05-shared-infrastructure.md).
- Cambies el stack o herramientas → [`README.md`](../README.md) y [`docs/02-tech-stack.md`](../docs/02-tech-stack.md).

La API REST publica su referencia interactiva (Scalar/OpenAPI) cuando el servidor está corriendo; mantén las anotaciones sincronizadas con el código.

## 10. Pull Requests

- **Plantilla**: el repo aplica automáticamente la plantilla de [`pull_request_template.md`](pull_request_template.md). Complétala con honestidad (no marques checkboxes que no aplicas).
- **Título del PR**: mismo formato que un commit (`<tipo>(<scope>): <resumen>`).
- **Descripción**: explica el _qué_ y, sobre todo, el _por qué_. Incluye capturas o ejemplos de payloads si aplica.
- **Tamaño**: idealmente < 400 líneas cambiadas. Si es más grande, justifícalo o divídelo.
- **CI debe estar verde** (`Deploy to Dev → test job`) antes de pedir review.
- **Al menos 1 aprobación** antes de mergear.
- Estrategia de merge: **squash & merge** por defecto. Asegúrate de que el título del squash quede como un commit válido (ver [§4](#4-convención-de-commits)); no dejes el título auto-generado con `(#123)` y mensaje genérico.
- **Borra la rama** tras mergear.

Antes de marcar el PR como "Ready for review":

- [ ] El código compila (`npm run build`) y pasa tests (`npm test`).
- [ ] La rama está actualizada con `main`.
- [ ] No hay archivos sin querer (`dist/`, `.env`, `node_modules`, etc.).
- [ ] No hay `console.log` ni código comentado abandonado.
- [ ] No hay secretos ni datos sensibles.
- [ ] La documentación está actualizada cuando aplica.

## 11. Seguridad

- **Nunca commitees secretos.** Usa `.env` (que está en `.gitignore`) y registra nuevas variables en el esquema de `@t3-oss/env-core` correspondiente.
- Si descubres un secreto commiteado, **avisa de inmediato al equipo y rota la credencial**; no basta con borrar el archivo en un commit posterior.
- Para reportar vulnerabilidades, **no abras un issue público**. Contacta directamente al maintainer (ver [`README.md`](../README.md)).
- Sigue las prácticas OWASP cuando expongas nuevos endpoints: valida entradas con Zod, autentica/autoriza explícitamente, evita SQL crudo (usa Drizzle), no devuelvas información médica/identificable sin chequeos de pertenencia.

## 12. Reporte de bugs y propuestas

Al abrir un issue, incluye:

- **Bug**: pasos para reproducir, comportamiento esperado vs. observado, versión/commit, logs relevantes (sin datos sensibles).
- **Propuesta**: problema que resuelve, alternativa(s) consideradas, impacto en bounded contexts existentes.

---

¡Gracias por contribuir! Si algo en esta guía no está claro o crees que debería evolucionar, abre un PR sobre este mismo archivo.
