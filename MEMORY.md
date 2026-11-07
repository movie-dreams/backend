# MEMORY — Movie Dreams

Registro histórico de contexto entre sesiones. La IA es dueña de este archivo y lo actualiza
al cerrar cada fase del ciclo sdd.

## Estado actual

- Fecha de cierre: **2026-10-19**.
- Feature `001-alta-usuario-sin-id-persona`: **cerrada y aprobada por el reviewer** (fase 7;
  ciclo de corrección 2/2, veredicto APROBADO, sin discrepancias técnicas).
- Spec: `specs/001-alta-usuario-sin-id-persona/spec.md` — `Estado: aprobada`, con las
  decisiones **D-1…D-26** registradas y sin dudas abiertas.
- Plan: `specs/001-alta-usuario-sin-id-persona/plan.md` — **implementado y verificado**.
- Tareas: `specs/001-alta-usuario-sin-id-persona/tasks.md` — **10/10 en `[x]`** (T1–T11; T5
  absorbida por T6).
- Datos al cierre: `usuario 12 / persona 17 / cliente 12 / rol_usuario 13`; cuentas 17 y 18
  con `fecha_creacion` NULL (sin relleno retroactivo); sin restos de pruebas.

## Feature 001 — Alta de usuario sin identificador de persona

**Qué se pidió:** `POST /api/v1/users` (rol ADMIN) deja de exigir el identificador de una
persona preexistente y el nombre de usuario elegido. Con **email y contraseña** debe crear de
forma conjunta y atómica la **persona** (solo con su email), la **cuenta** (nombre de usuario
= email, contraseña protegida no recuperable) con asignación **activa** al rol «Cliente», y el
**registro de cliente** activo del titular. Si el email ya existe → **409 sin crear nada**. El
login se alinea: contraseña 6–100 y nombre de usuario normalizado (recorte + minúsculas).

**Estado:** cerrada y aprobada por el reviewer. La verificación encontró y corrigió fugas de
contraseña en respuestas de cuentas y de asignaciones de rol (D-23, D-24, D-26) y la fecha de
creación nula del alta (D-25).

### Decisiones clave (D-1…D-26, resumidas)

- **D-1…D-3:** la persona se crea solo con el email; el email vive en la persona; la contraseña
  se guarda con bcrypt (no recuperable) para poder validar el login.
- **D-5, D-6:** un email ya registrado se rechaza con 409, sin reutilizar la persona ni crear
  persona, cuenta o cliente; la salida del alta se mantiene (`id`, `username`, `createdAt`) y
  nunca incluye la contraseña.
- **D-7, D-8, D-20, D-21:** alta atómica (persona + cuenta + cliente); enviar el identificador
  de persona da 400; se autoriza ampliar el nombre de usuario de 50 a 255 y materializar su
  índice único (migración 001).
- **D-9…D-13:** email normalizado (recorte + minúsculas), formato válido, máximo 255;
  contraseña 6–100 en alta y login; email vacío o solo con espacios → 400.
- **D-14, D-16…D-19, D-22:** el conflicto se decide en la aplicación y la garantía real la da la
  unicidad; la entrada del alta es solo email + contraseña; `username = email`; rol «Cliente»
  activo; cliente activo del titular; comparación de duplicados insensible a mayúsculas y
  espacios, sobre el valor entrante y el guardado. D-4 y D-15 quedaron sustituidas.
- **D-23/D-24:** sin contraseña en `GET /users`, `GET /users/:id` y en la respuesta de
  `PATCH /users/:id`, conservando el resto del contrato y la paginación; el login sigue
  validando la contraseña.
- **D-25:** valor por defecto `LOCALTIMESTAMP` en `seguridad.usuario.fecha_creacion`
  (migración 002), excepción autorizada a «el backend no genera fechas»; solo afecta a filas
  nuevas, **sin relleno retroactivo**.
- **D-26:** sin contraseña en `GET /user-roles` y `GET /user-roles/:id`, conservando la
  asignación, su rol, los datos de la cuenta asociada y la paginación.
- **PATCH:** `UpdateUserDto` es una clase propia que conserva `id?`, `username?` y `password?`.
  El `id` enviado en el cuerpo sobrescribe el de la ruta: incidencia heredada y decisión
  explícita de conservarla.

### Estructura tocada

Módulos `security`/`identity`/`auth`: DTOs (`create-user`, `update-user`, `login`),
`src/common/utils/identifier.utils.ts`, `user.service`, `person.service`, `auth.service`,
interfaces e implementaciones `typeorm-user*` (cuentas y asignaciones de rol),
`identity.module`, `security.module`, `user.controller` y `main.ts` (`exceptionFactory` en
español). Migraciones `001_usuario_nombre_longitud_y_unicidad.sql` y
`002_usuario_fecha_creacion_default.sql` (raíz, aplicación manual con `psql`).

### Verificación

- Método: MCP de Playwright contra la API en marcha, contrastando request y respuesta, más
  consultas `psql` para datos y estructura.
- Resultado: **B1–B6 en verde**; `pnpm build` OK, `pnpm lint` OK (único aviso preexistente en
  `billboard/create-movie.dto.ts`) y `pnpm test` 4/4.
- Tokens de administrador y no administrador **emitidos localmente y firmados con el
  `JWT_SECRET` del entorno de desarrollo**: no se dispone de las contraseñas reales de las
  cuentas sembradas.
- Ciclo de corrección: `DELETE /users/:id` → **204** (antes 500 por la FK de `rol_usuario`),
  404 en inexistente, sin restos y conservando persona/cliente; Swagger del `PATCH` alineado;
  acoplamiento resuelto (`IdentityModule` ya no exporta `PersonRepository`; se usa
  `PersonService.findByEmail`).

### Deuda preexistente aceptada (fuera de alcance, no corregida)

- 401/403 con mensajes en inglés.
- `GET /user-roles?userId=` → 400 por el `whitelist`.
- `POST /clients` acepta `isActive`/`registrationDate` nulos.
- Swagger no documenta `person` en `UserResponseDto` ni `user` en `UserRoleResponseDto`.
- Mensajes 400 duplicados por campo ausente.
- `UpdateUserDto.username` sin máximo de longitud.
- 10 de 12 cuentas preexistentes tienen contraseña no bcrypt.
- `PATCH` admite `id` en el cuerpo (decisión explícita).
- Repo sin commits: no hay `git diff` para auditar.

### Próximos pasos sugeridos (si el usuario los aprueba)

- Documentar `person`/`user` en Swagger.
- Añadir `@MaxLength(255)` al `username` del `PATCH`.
- Revisar las contraseñas sembradas no bcrypt.
- Corregir `GET /user-roles?userId=` y los mensajes 401/403 en español.
- Valorar el borrado masivo de asignaciones.

## Reglas del repo vigentes

- Stack fijo: pnpm + NestJS 12 + TypeScript 6 (ESM) + TypeORM/PostgreSQL + Vitest; sin
  dependencias ni cambios de toolchain sin aprobación.
- Sin `synchronize`: todo cambio de esquema va por migración DDL manual en `migrations/`
  (raíz), con compatibilidad hacia atrás.
- Código en inglés; mensajes de API, Swagger y documentación en español.
- Fechas en hora local del usuario, siempre recibidas en el request; el backend no las genera
  (única excepción autorizada: D-25).
- Verificación hoy con el MCP de Playwright; roadmap de tests unitarios con Vitest, cuyos
  specs existentes se conservan.
- El frontend (`frontend-cine-dip`) no se modifica.

## Historial de sesiones

- **2026-10-17** — Se crean `AGENTS.md`, `docs/constitution.md` y este `MEMORY.md`. Backend de
  compra de entradas Movie Dreams; esquemas `cartelera`, `ventas`, `identidad`, `seguridad`.
- **2026-10-17/18** — Fases 1 y 2 de la spec 001: 23 RF, 7 RNF, 26 casos límite, criterios
  (a)…(p) y decisiones D-1…D-22; el usuario aprueba la spec. Auditoría contra código y base
  real: sin duplicados, índice único inexistente, sin `migrations/`.
- **2026-10-18** — Fase 3: se crean `plan.md` y `tasks.md` (10 tareas, dependencias y ondas).
  Después se implementa T1–T9 y, durante la verificación, se autorizan D-23, D-24 y D-25.
- **2026-10-19** — Ciclo de corrección (2/2): T11 (D-26), T4(ii) (migración 002) y cierre T10.
  `DELETE` corregido, Swagger alineado y acoplamiento resuelto. Reviewer: **APROBADO**;
  feature cerrada.
