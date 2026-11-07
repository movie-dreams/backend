# Tareas 001 — Alta de usuario sin identificador de persona

Plan: `specs/001-alta-usuario-sin-id-persona/plan.md`
Spec: `specs/001-alta-usuario-sin-id-persona/spec.md` (aprobada)

**Método de verificación:** MCP de Playwright contra la API en marcha (`pnpm start:dev`,
prefijo `api/v1`), contrastando request y respuesta con el criterio. Los specs de Vitest
existentes se conservan (no se añaden, no se reescriben).

**Reglas de ejecución:** una tarea a la vez, marcar `[x]` y reportar antes de continuar.
Test-first: T1–T3 (guiones de verificación) se ejecutan **en rojo** antes de tocar el
código de negocio. Ningún cambio se da por terminado sin verificar.

**Credenciales de verificación (resuelto):** los casos que exigen autenticación se
verificaron con tokens de **administrador** y **no administrador** emitidos localmente y
firmados con el `JWT_SECRET` del entorno de desarrollo; **no se dispone de las contraseñas
reales de las cuentas sembradas**. Con esos tokens se verificaron T2, T3, T8, T9, T10 y T11.

---

- [x] **T1. Guion de verificación B1: contrato de entrada y rechazos del alta (401, 403, 400).** RF-2, RF-3, RF-4, RF-6, RF-7, RF-8, RF-18, RF-19, RF-21
  - [Depende de: Ninguna]
  - Hecho cuando: ejecutados los casos B1.1–B1.13 del plan con la API levantada (incluidos los que no requieren token), las respuestas obtenidas coinciden con los criterios de B1 y los casos dependientes de código aún no implementado fallan **en rojo por la razón correcta** (hoy se admite `id`/`username` y no existe `email`), sin crear registros en ningún rechazo.

- [x] **T2. Guion de verificación B2: alta exitosa y efectos observables (persona, cuenta, rol, cliente).** RF-1, RF-5, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16
  - [Depende de: Ninguna] *(requiere token de administrador: reportar bloqueo si no se dispone)*
  - Hecho cuando: ejecutados los casos B2.1–B2.6 con token de administrador, las respuestas y las observaciones posteriores (persona sin datos extra, cuenta con nombre de usuario igual al email, asignación activa al rol `Cliente`, cliente del titular activo, sin contraseña en la respuesta) coinciden con los criterios de B2, quedando en rojo lo no implementado.

- [x] **T3. Guion de verificación B3 y B4: conflictos de duplicado (409) y login alineado (contraseña 90 y nombre de usuario normalizado).** RF-17, RF-22, RF-23
  - [Depende de: T2] *(reutiliza la cuenta creada en T2; requiere token de administrador)*
  - Hecho cuando: ejecutados B3.1–B3.4 y B4.1–B4.4, las respuestas coinciden con los criterios (409 con mensaje en español y sin registros nuevos; 200 con token al entrar con el email normalizado y con contraseña de 90 caracteres; 401 con contraseña incorrecta) y lo no implementado queda en rojo por la razón correcta.

- [x] **T4. Aplicar y verificar los dos cambios estructurales autorizados (longitud 255 + unicidad, ya hecho; y valor por defecto de la fecha de creación) y alinear el modelo.** RF-7, RF-9, RF-15 (D-20, D-21, D-25; criterios (a), (l) y (n))
  - [Depende de: Ninguna]
  - Hecho cuando: **(i) cumplido y verificado** — existen la carpeta `migrations/` en la raíz y `001_usuario_nombre_longitud_y_unicidad.sql`, aplicado con `psql -v ON_ERROR_STOP=1` (manual, sin scripts de migración ni `synchronize`), la tabla del usuario muestra el nombre de usuario de 255 caracteres y su índice único, `user.orm-entity.ts` declara `length: 255` de forma coherente, y un intento de duplicar el nombre de usuario es rechazado por los datos (nunca se crea el duplicado); y **(ii) cumplido y verificado** — existe `migrations/002_usuario_fecha_creacion_default.sql`, aplicado de la misma forma manual, la columna de fecha de creación de la cuenta tiene valor por defecto (`column_default = LOCALTIMESTAMP`), un alta nueva devuelve `createdAt` con una fecha real (no nula), las cuentas preexistentes conservan exactamente el valor que tenían (las cuentas 17 y 18 siguen sin valor: **sin relleno retroactivo**), y una segunda ejecución del archivo no falla ni altera datos.

- [x] **T6. DTOs del alta, del login y de la actualización, y función pura de normalización (absorbe T5).** RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-18, RF-19, RF-22, RF-23
  - [Depende de: Ninguna] *(absorbe T5: la función pura ya está implementada, así que no queda dependencia jerárquica pendiente)*
  - Hecho cuando: existe `src/common/utils/identifier.utils.ts` con `normalizeIdentifier(value: string): string` que recorta espacios al inicio/fin y pasa a minúsculas, es idempotente y no usa reloj, HTTP ni ORM (**punto heredado de T5, ya cerrada e implementada: se conserva como cumplido**); `create-user.dto.ts` declara solo `email` (normalizado por `@Transform`, formato validado, obligatorio, máximo 255) y `password` (6–100) con mensajes en español; `update-user.dto.ts` es una clase propia que **conserva el contrato documentado actual del `PATCH`** (`id?`, `username?` y `password?` con sus validaciones vigentes y la contraseña con el rango 6–100 alineado con el login) sin heredar del alta; `login.dto.ts` admite contraseñas hasta 100 y normaliza el nombre de usuario; B1 (salvo los casos que dependen del servicio) pasa a verde sin crear registros en los rechazos; y B5.1 pasa a verde (el `PATCH` sigue aceptando `id?`, `username?` y `password?` con 200 y su contrato documentado no cambia).

- [x] **T7. Búsquedas insensibles a mayúsculas y espacios en persona (email) y cuenta (nombre de usuario).** RF-17
  - [Depende de: Ninguna]
  - Hecho cuando: `PersonRepository.findByEmailInsensitive` y `UserRepository.findByUsernameInsensitive` existen en el dominio y en su implementación, comparan con `LOWER(TRIM(campo)) = LOWER(TRIM(valor))`, se conservan los métodos existentes, y una consulta de prueba con el valor en otra combinación de mayúsculas/espacios encuentra el registro guardado.

- [x] **T8. Orquestación del alta conjunta: persona + cuenta + rol `Cliente` + cliente, atómica, con conflicto 409.** RF-1, RF-7, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-20
  - [Depende de: T4, T6, T7]
  - Hecho cuando: `PersonService.registerAccount({ email, password })` (método aditivo, sin tocar `register`) crea persona con el email, cliente activo y cuenta con `username = email`, contraseña protegida y rol `Cliente` activo; `UserService.create` normaliza, rechaza el duplicado con 409 y mensaje en español, traduce la violación de unicidad a 409, devuelve `id`, `username` y `createdAt` sin contraseña, y `security.module.ts` importa `IdentityModule` sin errores de arranque; B2 y B3 pasan a verde.

- [x] **T9. Login alineado en el servicio: búsqueda por nombre de usuario normalizado.** RF-22, RF-23
  - [Depende de: T7] *(la función pura de T5, absorbida en T6, ya está implementada)*
  - Hecho cuando: `AuthService.login` normaliza el nombre de usuario antes de buscarlo con la búsqueda insensible y sigue respondiendo 401 «Credenciales no válidas» con credenciales incorrectas; B4.1–B4.3 pasan a verde (incluida la contraseña de 90 caracteres y el email con mayúsculas/espacios).

- [x] **T10. Cierre: guion completo en verde, no regresión, comprobaciones técnicas y `MEMORY.md`.** RNF-3, RNF-5 (criterios (m) y (n), más (o) y (p) por B5.6–B5.9)
  - [Depende de: T1, T2, T3, T4, T6, T7, T8, T9, T11]
  - Hecho cuando: B1–B7 del plan pasan (incluido el 401/403, los rechazos sin registros creados, los efectos observables del alta —entre ellos la **fecha de creación real** en la respuesta—, la verificación de los dos cambios estructurales y la ausencia de contraseña en el listado, el detalle y la actualización de cuentas **y en el listado y el detalle de asignaciones de rol**), las demás operaciones de usuario conservan su contrato (B5), `pnpm build`, `pnpm lint` y `pnpm test` (specs existentes conservados) terminan correctamente, la documentación en `/documentacion` está en español y `MEMORY.md` refleja el cierre de la feature.

- [x] **T11. Retirar la contraseña de las respuestas de cuentas (listado, detalle y actualización) y de las asignaciones de rol (listado y detalle).** RF-24, RF-25, RNF-3, RNF-4 (D-23, D-24, D-26; criterios (o) y (p))
  - [Depende de: T8] *(toca `user.service.ts`, el archivo de la orquestación del alta: debe ejecutarse **después** de T8, nunca en paralelo; la parte de asignaciones solo toca `typeorm-user-role.repository.ts`)*
  - Hecho cuando: `GET /users`, `GET /users/{id}` y `PATCH /users/{id}` con `{"password": "..."}` siguen respondiendo 200 con sus datos (y el listado con su paginación), **ninguna** de esas tres respuestas contiene la contraseña en ningún formato —ni en texto plano ni protegida—, el resto de la respuesta y el contrato de entrada del `PATCH` se conservan, y `POST /auth/login` sigue respondiendo 200 con token con la contraseña correcta, también después de actualizarla (B5.6 y B5.7 en verde); además, `GET /user-roles` y `GET /user-roles/{id}` siguen respondiendo 200 conservando todos los datos de la asignación, su rol, los datos de la cuenta asociada (identificador, nombre de usuario y fecha de creación) y la paginación del listado, y **ninguna** de las dos respuestas contiene la contraseña en ningún nivel (B5.8 y B5.9 en verde).

---

## Orden, carácter y paralelización

| Onda | Tareas en paralelo | Carácter |
| --- | --- | --- |
| 1 (cerrada) | **T1** y **T7** (más **T5**, absorbida en T6) | Completadas y verificadas; se conservan como referencia |
| 2 (cerrada) | **T6** (DTOs de security y de auth + función pura) | Toca los DTOs y `identifier.utils.ts` |
| 3 (cerrada) | **T8** (servicio de alta, servicio de persona, módulo y controlador de usuarios) y **T9** (`auth.service.ts`) | T8 dependió de T4 parte (i), T6 y T7; T9 de T7 y de la función pura. T8 y T9 no comparten archivos |
| 4 (cerrada) | **T11** (repositorio de cuentas + retirada de la contraseña en la respuesta de la actualización en `user.service.ts`, y proyección sin contraseña en el repositorio de asignaciones de rol) y **T4 parte (ii)** (migración del valor por defecto de la fecha de creación y su verificación) | T11 dependió de T8 y tocó solo código de `security`/`identity`; T4(ii) tocó un `.sql` en `migrations/` y los datos, **sin colisión** con ese código. Ambas cerradas antes de T10 |
| 5 (cerrada) | **T10** (cierre y verificación completa) | Dependió de todas las anteriores; cierre con B1–B7 en verde y build/lint/test correctos |

- **Dependencias jerárquicas:** T3 → T2; T6 → Ninguna (absorbe la función pura de T5, ya implementada); T8 → (T4 parte (i), T6, T7); T9 → T7 (función pura ya disponible); T11 → T8; T4 parte (ii) → Ninguna; T10 → todas (incluidas T11 y T4). Todas cerradas.
- **Independientes (ortogonales):** T4 parte (ii) no comparte archivos con T11 (SQL y datos frente a código de `security`/`identity`); se ejecutaron en paralelo sin colisión.
- **T11 en serie tras T8 (no paralizable con T8):** la retirada de la contraseña en la respuesta de la actualización vive en `user.service.ts`, el mismo archivo que la orquestación del alta, así que se ejecutó **después** de que T8 estuviera cerrada. Su verificación (B5.6 y B5.7) se repitió en T10 para validar el estado final.
- **Advertencia de colisión (histórica):** T6 y T8 no debían ejecutarse a la vez (T8 consume los DTOs de T6); T8 y T11 comparten `user.service.ts` (fueron en serie); T9 y T8 podían coexistir pero T9 debía ejecutarse después de T7; T4(ii) no colisiona con T11 (migración y datos frente a código).
- **Reparto final:** todas las tareas están cerradas; T11 y T4(ii) se ejecutaron en paralelo y T10 cerró en serie al final.

**Límite de tareas:** las **10 filas vigentes** (T5 absorbida por T6 y T11 añadida) están
cerradas, dentro del máximo permitido; no hace falta fragmentar la spec.
