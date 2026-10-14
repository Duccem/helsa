<!-- Título sugerido: <tipo>(<scope>): <resumen corto> | ej: feat(appointment): agregar endpoint de productos -->

## Descripción

<!-- ¿Qué cambia este PR y por qué? Mantenlo breve. -->

## Tipo de cambio

<!-- Marca con [x] lo que aplique -->

- [ ] Feature (nueva funcionalidad)
- [ ] Fix (corrección de bug)
- [ ] Refactor (cambio interno sin afectar comportamiento)
- [ ] Docs (documentación)
- [ ] Infra / Tooling (CI, build, dependencias, config)
- [ ] Chore (otros: limpieza, formateo, etc.)

## Alcance

### Capa afectada

- [ ] `app/` (routers, crons, entrypoint HTTP)
- [ ] `contexts/admin` (auth, billing)
- [ ] `contexts/clinic` (appointment, chat, diagnosis, doctor, medical-record, patient, prescription, schedule, video-call)
- [ ] `contexts/shared` (domain, infrastructure)
- [ ] Otro: <!-- especificar -->

### Bounded context / módulo(s)

<!-- Lista los módulos específicos tocados. Ej: clinic/appointment, clinic/schedule, shared/infrastructure -->

-

## Tarea relacionada

<!-- Elige una de las opciones -->

- Issue / Ticket: <!-- #123 o link -->
- No hay tarea asignada — motivo: <!-- ej: fix puntual, ajuste de infra, documentación interna -->

## Cómo probar

<!-- Pasos mínimos para validar el cambio. Endpoints, comandos, escenarios. Si no aplica, indícalo. -->

1.
2.

## Checklist

- [ ] El código compila y pasa linter/typecheck
- [ ] Se agregaron/actualizaron tests cuando aplica
- [ ] Se actualizó la documentación (OpenAPI, READMEs, `docs/`) si el cambio lo requiere
- [ ] No incluye secretos, credenciales ni datos sensibles

## Notas adicionales

<!-- Decisiones de diseño, deuda técnica conocida, follow-ups, breaking changes, migraciones, etc. -->

