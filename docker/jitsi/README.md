# Jitsi local (video sesiones)

Servidor Jitsi Meet para probar la videollamada terapeuta ↔ paciente en local.

## Levantar

```bash
cd docker/jitsi
cp .env.example .env      # rellenar JWT_APP_SECRET, JICOFO_AUTH_PASSWORD, JVB_AUTH_PASSWORD
docker compose up -d
```

O desde la raíz: `pnpm jitsi:up` / `pnpm jitsi:down` / `pnpm jitsi:logs`.

1. Abre <https://localhost:8443> una vez y acepta el certificado autofirmado. Si no lo haces, el iframe dentro de Helsa no carga.
2. `JWT_APP_SECRET` debe ser el mismo valor que `JITSI_APP_SECRET` en `apps/web/.env`.
3. Si cambias variables de autenticación, borra `.jitsi-meet-cfg/` y vuelve a levantar: Jitsi genera su config al primer arranque.

## Roles

| Quién | Cómo entra | Rol en la sala |
| --- | --- | --- |
| Terapeuta | JWT con `context.user.moderator: true` | Moderador: expulsar, silenciar a otros, lobby, terminar para todos |
| Paciente con sesión | JWT sin `moderator` | Participante (solo su audio, video y chat) |
| Paciente sin sesión | Sin token, como invitado (`guest.meet.jitsi`) | Participante, no puede crear la sala: espera a que entre el terapeuta |

El módulo `token_affiliation` de Prosody asigna el rol según el token, y `ENABLE_AUTO_OWNER=0` evita que el primero en entrar sea moderador.

## Token que firma Helsa (HS256)

```json
{
  "iss": "helsa",
  "aud": "helsa-video",
  "sub": "meet.jitsi",
  "room": "<id-de-la-cita>",
  "exp": 1767225600,
  "nbf": 1767222000,
  "context": {
    "user": {
      "id": "<user-id>",
      "name": "Dra. Ana Pérez",
      "email": "ana@example.com",
      "avatar": "https://...",
      "moderator": true
    }
  }
}
```

- `iss` = `JWT_APP_ID`, `aud` = `JWT_ACCEPTED_AUDIENCES`, `sub` = `meet.jitsi` (el dominio XMPP interno).
- `room` limita el token a una sala. Usa el id de la cita en minúsculas.
- Para el paciente con sesión, omite `moderator` (o ponlo en `false`).

## Probar desde otro dispositivo

Añade la IP de tu PC en la red local a `JVB_ADVERTISE_IPS` (por ejemplo `127.0.0.1,192.168.1.20`), cambia `PUBLIC_URL` a `https://192.168.1.20:8443` y abre el puerto UDP `10000` en el firewall de Windows.
