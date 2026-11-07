# Plan 001 — Alta de usuario sin identificador de persona

Estado: implementado y verificado
Spec: `specs/001-alta-usuario-sin-id-persona/spec.md` (aprobada, D-1…D-26)
Tareas: `specs/001-alta-usuario-sin-id-persona/tasks.md`

> **Método de verificación de esta feature** (fijado por `AGENTS.md`, no se asume otro):
> cada criterio de aceptación se valida **interactuando con la API mediante el MCP de
> Playwright** (se envía el request y se contrasta la respuesta con el criterio esperado).
> Los specs de Vitest existentes (`pnpm test`, p. ej.
> `src/modules/billboard/application/services/movie.service.spec.ts`) **se conservan**: no
> se eliminan ni se reescriben, y no son el método de verificación de esta feature.

---

## 1. Contexto y alcance técnico

El alta de usuarios (`POST /api/v1/users`, ADMIN) pasa a recibir **solo email y
contraseña** y debe producir, en una única unidad de trabajo:

1. la **persona** (solo con su email normalizado),
2. la **cuenta** cuyo nombre de usuario es ese email, con la contraseña protegida, y su
   asignación **activa** al rol `Cliente`,
3. el **registro de cliente** del titular, activo.

El inicio de sesión se alinea: máximo de contraseña 50 → 100 y normalización del nombre de
usuario. Cambio estructural autorizado (D-20/D-21): longitud del nombre de usuario 50 →
255 y materialización del índice único del nombre de usuario. Segundo cambio estructural
autorizado (D-25): valor por defecto de fecha en la fecha de creación de la cuenta, para
que toda cuenta nueva entregue una fecha real.

Lo que **no cambia**: `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE
/users/:id` (RNF-3, criterio (m) de la spec), `POST /persons` (vía de alta de personas
existente), `POST /clients`, y ningún otro dato ni estructura más allá de los dos cambios
autorizados.

---

## 2. Estructura

### 2.1 Archivos nuevos

| Archivo | Responsabilidad |
| --- | --- |
| `migrations/001_usuario_nombre_longitud_y_unicidad.sql` | Cambio estructural autorizado (D-20/D-21): `seguridad.usuario.usuario` a `varchar(255)` y creación del índice único del nombre de usuario. Se aplica a mano con `psql` (ver §6.4). |
| `migrations/002_usuario_fecha_creacion_default.sql` | Segundo cambio estructural autorizado (D-25): valor por defecto de fecha en `seguridad.usuario.fecha_creacion`, para que toda cuenta nueva traiga su fecha de creación. Idempotente (puede ejecutarse de nuevo sin fallar), **sin relleno retroactivo** y sin tocar ninguna otra columna ni restricción; se aplica a mano con `psql` (ver §6.4). |
| `src/common/utils/identifier.utils.ts` | Reglas puras y compartidas: `normalizeIdentifier(value: string): string` (recorta espacios al inicio/fin y pasa a minúsculas). Sin framework, sin HTTP, sin ORM, sin reloj. Lo usan el alta (security) y el login (auth). |

### 2.2 Archivos modificados

| Archivo | Responsabilidad / cambio |
| --- | --- |
| `src/modules/security/application/dto/create-user.dto.ts` | DTO del alta: pasa de `id` + `username` + `password` a **`email` (normalizado por `@Transform` con la función pura, `@IsEmail`, `@IsNotEmpty`, `@MaxLength(255)`) + `password` (`@MinLength(6)`, `@MaxLength(100)`)**. Mensajes de validación en español. |
| `src/modules/security/application/dto/update-user.dto.ts` | Deja de heredar de `CreateUserDto` (para no recibir `email`) y pasa a ser una **clase propia que conserva el contrato documentado del `PATCH /users/:id`: `id?`, `username?` y `password?`**, con las validaciones vigentes y la contraseña alineada con el login (6–100). **El contrato del `PATCH` no cambia** (ver §5.4). |
| `src/modules/security/application/services/user.service.ts` | Orquestación del alta (`create`) + traducción de conflicto: normaliza, comprueba conflicto de forma insensible (persona por email y cuenta por nombre de usuario), delega la escritura conjunta en `PersonService.registerAccount`, traduce violación de unicidad a 409 y devuelve la cuenta creada. Además, `update` devuelve la cuenta actualizada **sin la contraseña** (RF-24, ver §5.9), manteniendo intactos el contrato de entrada del `PATCH` y su comportamiento heredado. |
| `src/modules/identity/application/services/person.service.ts` | **Método aditivo** `registerAccount({ email, password })`: crea la persona con el email, el cliente activo y la cuenta con `username = email`, contraseña protegida y rol `Cliente` activo; todo dentro de `@Transactional()` (se une a la transacción del alta). El `register(dto)` existente **no se toca**. |
| `src/modules/identity/domain/repositories/person.repository.ts` | Nuevo método abstracto `findByEmailInsensitive(email: string): Promise<Person \| null>`. |
| `src/modules/identity/infrastructure/persistence/typeorm-person.repository.ts` | Implementación de `findByEmailInsensitive` con comparación `LOWER(TRIM(email)) = LOWER(TRIM(:email))`. |
| `src/modules/security/domain/repositories/user.repository.ts` | Nuevo método abstracto `findByUsernameInsensitive(username: string): Promise<User \| null>`. |
| `src/modules/security/infrastructure/persistence/typeorm-user.repository.ts` | Implementación de `findByUsernameInsensitive` con `LOWER(TRIM(usuario)) = LOWER(TRIM(:username))`; además, el **listado y el detalle de cuentas se proyectan sin la contraseña** (RF-24, ver §5.9). |
| `src/modules/security/infrastructure/persistence/typeorm-user-role.repository.ts` | En el **listado y el detalle de asignaciones de rol**, cargar el usuario asociado **proyectado sin la contraseña** (identificador, nombre de usuario y fecha de creación), conservando la asignación completa, su rol y el resto de la respuesta (RF-25, ver §5.10). `save`, `update`, `delete` y `findByUserId` no se tocan. |
| `src/modules/security/presentation/controllers/user.controller.ts` | Documentación Swagger en español coherente con el nuevo contrato (solo cambian `@ApiOperation`, `@ApiBody`, descripciones de 400/409; el resto de endpoints intacto). |
| `src/modules/auth/application/dto/login.dto.ts` | `username` normalizado por `@Transform` (función pura) y `password` con `@MaxLength(100)`; mensajes en español. |
| `src/modules/auth/application/services/auth.service.ts` | `login` normaliza el nombre de usuario y lo busca con `findByUsernameInsensitive`. |
| `src/modules/security/infrastructure/entities/user.orm-entity.ts` | Alinear el modelo con el esquema físico autorizado: `length: 255` en el nombre de usuario (se mantiene `unique: true`, ahora sí materializado). Sin `synchronize`. |
| `src/modules/security/security.module.ts` | Añadir `IdentityModule` a `imports` para inyectar `PersonService` en `UserService`. |
| `src/main.ts` | **Solo** la `exceptionFactory` del `ValidationPipe` global, para que los mensajes de validación se entreguen en español (RNF-1). El resto del archivo (prefijo global, CORS, Swagger, `whitelist`/`forbidNonWhitelisted`) queda sin cambios. |

### 2.3 Archivos que se conservan sin cambios

`src/modules/security/application/dto/security-response.dto.ts` (`UserResponseDto`: `id`,
`username`, `createdAt`), `person.controller.ts`, `client.controller.ts`,
`create-person.dto.ts`, `role.repository.ts` y su implementación,
`user-role.repository.ts` (interfaz de dominio), `auth.controller.ts`, `src/app.module.ts`.

---

## 3. Determinismo

Cómputos de negocio extraídos a **funciones puras y deterministas** (principio 3 de
`docs/constitution.md`): sin `Date.now()`, sin `new Date()`, sin HTTP, sin TypeORM, con el
valor recibido por parámetro.

| Función | Firma | Ubicación | Uso |
| --- | --- | --- | --- |
| `normalizeIdentifier` | `(value: string): string` | `src/common/utils/identifier.utils.ts` | Recorta espacios al inicio/fin y pasa a minúsculas. Se usa en el `@Transform` del DTO del alta (RF-5), en `UserService.create` (defensa del invariante) y en el `@Transform` del login (RF-23). Idempotente. |

- **No** se calcula ninguna fecha en el backend: la fecha de creación de la cuenta la genera
  el origen de datos al insertar la fila —con el valor por defecto autorizado en D-25— y la
  fecha del registro de cliente también la genera el sistema de datos (definición «Fechas
  heredadas» de la spec). No se usa el reloj del backend para ningún cómputo de negocio.
- La **forma de dirección de correo válida** (RF-4) se valida con el validador de formato
  ya disponible en el toolchain, declarado en el DTO con mensaje en español. No es un
  cómputo de negocio propio y por eso no se extrae a función pura (alternativa descartada
  en §5.5).
- `ResponseUtils` construye `timestamp` con el reloj: es un adaptador de presentación
  preexistente, no un cómputo de negocio de esta feature, y no se modifica.

---

## 4. Algoritmos (pseudocódigo)

### 4.1 Alta conjunta — `UserService.create(dto)`  (`@Transactional()`)

```
función create(dto):
    email <- normalizeIdentifier(dto.email)            # función pura, idempotente
    # El rango 6–100 de la contraseña ya lo garantiza el DTO (400 antes de entrar aquí).

    # Conflicto (RF-17): insensible a mayúsculas y espacios, sobre el valor entrante y
    # sobre los valores ya guardados.
    si personaRepository.findByEmailInsensitive(email) != nulo:
        lanzar ConflictException('El email ya está registrado.')
    si userRepository.findByUsernameInsensitive(email) != nulo:
        lanzar ConflictException('El email ya está registrado.')

    intentar:
        persona <- personService.registerAccount({ email, password: dto.password })
    capturar UniqueViolation:                          # carrera entre altas simultáneas
        lanzar ConflictException('El email ya está registrado.')

    usuario <- userRepository.findById(persona.id)
    si usuario == nulo:                                # defensivo: no puede ocurrir
        lanzar InternalServerError('No se pudo recuperar el usuario creado')
    devolver usuario
```

### 4.2 Escritura conjunta — `PersonService.registerAccount({ email, password })`  (`@Transactional()`)

```
función registerAccount({ email, password }):          # método ADITIVO; register() no cambia
    emailNormalizado <- normalizeIdentifier(email)     # defensa: seguro aunque el llamador no normalice
    persona <- personRepository.save({ email: emailNormalizado })      # resto de datos sin informar
    clientRepository.save({ id: persona.id, isActive: true })          # cliente activo
    authService.registerUserWithRole(                                  # hash + rol activo
        { personId: persona.id, username: emailNormalizado, password },
        Role.CLIENT)                                                   # 'Cliente', por nombre
    devolver persona
```

`registerUserWithRole` (ya existente, no se reescribe) resuelve el rol por **nombre** con
`roleRepository.findByName('Cliente')`, hashea la contraseña y guarda la asignación con
`status: true`.

### 4.3 Rechazo de datos no admitidos (RF-2, RF-18, RF-19)

```
recibir(body) en el ValidationPipe global (whitelist: true, forbidNonWhitelisted: true):
    si alguna clave de body no está en { email, password }:
        rechazar 400 con mensaje en español (dato no admitido)
```

El DTO declara **solo** `email` y `password`; por tanto `id` y `username` (y cualquier
otro dato) quedan fuera del conjunto permitido y se rechazan con 400 antes de llegar al
controlador. No se escribe código nuevo para esto: se aprovecha el pipe global ya
configurado.

### 4.4 Login normalizado — `AuthService.login(dto)`

```
función login(dto):
    identificador <- normalizeIdentifier(dto.username)          # función pura
    usuario <- userRepository.findByUsernameInsensitive(identificador)
    si usuario == nulo o usuario.password == nulo:
        lanzar UnauthorizedException('Credenciales no válidas')
    si no bcrypt.compare(dto.password, usuario.password):
        lanzar UnauthorizedException('Credenciales no válidas')
    roles <- getActiveRolesForUser(usuario.id)
    devolver { token: firmar({ id: usuario.id, username: usuario.username, roles }) }
```

---

## 5. Justificación de las decisiones (con alternativa descartada)

### 5.1 Dónde vive la orquestación del alta

**Decisión:** el alta la orquesta `UserService.create` (security). Las tres escrituras
las encapsula un método **aditivo** `PersonService.registerAccount` (identity), que ya
tiene inyectados `PersonRepository`, `ClientRepository` y `AuthService` y ya sabe crear
persona + cliente + cuenta con rol `Cliente`.

- **Alternativa descartada A — que `security` componga llamando a `PersonService.register`
  con un `CreatePersonDto`:** obliga a `security` a construir el DTO de la aplicación de
  `identity` (acoplamiento entre DTOs de módulos distintos) y deja la regla «nombre de
  usuario = email» en el llamador, repartida fuera del módulo que conoce la relación
  persona/cliente/cuenta.
- **Alternativa descartada B — extender el `register(dto)` existente** para que el email
  sea obligatorio y el username por defecto: cambia el comportamiento y el contrato de
  `POST /persons`, que ya funciona y está fuera del alcance de la spec («no reescribas lo
  que ya funciona», «cambios pequeños y enfocados»).
- **Alternativa descartada C — crear un servicio nuevo en `identity`** (p. ej.
  `AccountRegistrationService`): duplica el cableado de dependencias que ya tiene
  `PersonService` y añade una capa de paso (módulo superficial) sin aportar
  encapsulamiento.
- **Alternativa descartada D — que `security` reutilice directamente
  `AuthService.registerUserWithRole`:** ese método exige un `personId` ya existente y no
  crea persona ni cliente; usarlo obligaría a crear la persona y el cliente desde
  `security`, que no tiene acceso a los repositorios de `identity` (el módulo solo exporta
  servicios), forzando a exportar repositorios y ampliando la superficie pública.

### 5.2 Cómo se resuelve el rol «Cliente»

**Decisión:** por **nombre**, con `Role.CLIENT` (`'Cliente'`) a través del
`roleRepository.findByName` que ya existe y ya se usa en `PersonService.register`.

- **Alternativa descartada — fijar el identificador interno 3:** el repositorio no expone
  búsqueda por identificador de negocio para el rol, el dato no está garantizado entre
  entornos y el usuario lo indicó solo como referencia de los datos actuales.
- **Consecuencia documentada (spec):** si el rol `'Cliente'` no existiera, `registerUserWithRole`
  lanza `NotFoundException('El rol \'Cliente\' no existe')` (404 con mensaje en español) y,
  al compartir transacción, el alta completa se revierte. Es la dependencia conocida
  registrada en la spec y no se cambia su comportamiento.

### 5.3 Cómo se garantiza la unicidad y el conflicto insensible

**Decisión:** doble barrera. (a) Comprobación previa en la aplicación con dos consultas
insensibles (`LOWER(TRIM(campo)) = LOWER(TRIM(valor))`) sobre el email de la persona y
sobre el nombre de usuario de la cuenta, dentro de la transacción; (b) el índice único
materializado (D-21) como última línea de defensa, cuya violación se **traduce a 409** con
el mismo mensaje en español.

- **Alternativa descartada — comparar en memoria** trayendo listados paginados y
  filtrando: incorrecto con paginación, costoso y filtra detalles de almacenamiento a la
  capa de aplicación.
- **Alternativa descartada — usar el `findByEmail`/`findByUsername` exactos** con el valor
  ya normalizado: no cubre valores **ya guardados** con espacios o mayúsculas, que es
  justo lo que exige RF-17/D-22.
- **Alternativa descartada — `ILIKE` sobre el valor normalizado:** ignora mayúsculas pero
  no los espacios guardados.
- **Trade-off declarado:** la expresión `LOWER(TRIM(...))` no usa el índice único; con el
  volumen actual (decenas de filas) es irrelevante y prevalece la corrección.

### 5.4 Cómo se ajusta `UpdateUserDto` (efecto colateral crítico)

**Decisión (del usuario):** `UpdateUserDto` deja de heredar de `CreateUserDto` —para no
recibir `email`— y pasa a ser una **clase propia que conserva los campos documentados hoy
en el `PATCH /users/:id`: `id?`, `username?` y `password?`**, con las validaciones vigentes
(`username?` texto no vacío tal como está declarado hoy y `password?` con el rango 6–100
alineado con el login). **El contrato documentado del `PATCH` no cambia** (RNF-3, criterio
(m)).

- **Motivo de la clase propia:** con el nuevo `CreateUserDto`, la herencia haría que el
  `PATCH` dejara de admitir `username` y pasara a admitir `email`, que **no es un dato de la
  cuenta** (vive en la persona) y rompería el contrato documentado del `PATCH`.
- **Alternativa descartada — desacoplar quitando `id`** (dejar solo `username?` y
  `password?`): reduce la superficie admitida y convierte en 400 —por
  `forbidNonWhitelisted`— un cuerpo con `id` que hoy está documentado y se admite; el
  usuario ha decidido de forma explícita **conservar** ese campo y su comportamiento, así
  que se conserva el contrato tal cual.
- **Alternativa descartada — dejar `email?` en el `PATCH`:** obligaría a decidir a qué
  registro actualizar (persona vs cuenta), sería una funcionalidad nueva fuera de la spec y
  rompería la compatibilidad hacia atrás.
- **Incidencia heredada que se conserva (documentada, fuera del alcance):** el `id` enviado
  en el cuerpo **sobrescribe el identificador de la ruta** al actualizar, porque la carga
  previa del repositorio combina el identificador de la ruta con los datos del cuerpo. Es un
  comportamiento **preexistente**, ajeno a esta feature («haz solo lo que se pide», «no
  reescribas lo que ya funciona»), por lo que **no se corrige aquí**: se conserva y queda
  documentado (ver §7, B5.1).
- **Nota:** el `PATCH` ya hashea la contraseña (`user.service.update`), por lo que la
  protección no recuperable se mantiene sin cambios.

### 5.5 Cómo se valida el formato del email (RF-4)

**Decisión:** declarar el formato en el DTO con el validador de formato ya disponible en
el toolchain y **mensaje en español**, dentro del pipeline de validación global.

- **Alternativa descartada — función pura `isValidEmailShape` propia:** duplica una
  validación que el toolchain ya ofrece, añade código a mantener y se aparta de la
  convención ya usada en `create-person.dto.ts`.
- La `@Transform` con `normalizeIdentifier` se aplica **antes** del validador de formato,
  de modo que un email con espacios al inicio/fin o en mayúsculas se acepta normalizado
  (caso límite de RF-5/RF-17) y un email vacío o solo con espacios cae en la validación de
  obligatoriedad con mensaje en español (RF-6).

### 5.6 Cómo se aplica el cambio estructural autorizado

**Decisión:** un archivo `.sql` en `migrations/` (raíz, como indica `AGENTS.md`) aplicado
manualmente con `psql`: ampliar la longitud del nombre de usuario a `varchar(255)` y crear
el índice único **en la misma transacción**.

- **Alternativa descartada — CLI de TypeORM** (añadir `data-source.ts` + scripts
  `migration:run`/`migration:generate`): incorpora configuración y scripts nuevos al
  toolchain, que está fijo y requiere aprobación explícita (constitution, principio 1),
  para un único cambio ya autorizado.
- **Alternativa descartada — `synchronize`:** prohibido por `AGENTS.md` y por el principio 5.
- **Alternativa descartada — `CREATE INDEX CONCURRENTLY`:** no puede ejecutarse dentro de
  un bloque de transacción y es innecesario con el volumen actual.
- **Compatibilidad:** ampliar `varchar` es ampliativo y no destructivo; la creación del
  índice único es viable porque en los datos actuales **no hay nombres de usuario
  duplicados** (verificado). Si al aplicarlo fallara por duplicados, el proceso debe
  detenerse y reportarse (riesgo ya documentado en la spec).
- El modelo (`user.orm-entity.ts`) se alinea en la misma tarea para que la declaración
  siga coincidiendo con la base física.

### 5.7 Cómo se consigue la atomicidad de los tres registros

**Decisión:** `@Transactional()` de `typeorm-transactional` en `UserService.create` y en
los métodos que invoca (`PersonService.registerAccount`, `AuthService.registerUserWithRole`),
que se **unen** a la transacción exterior. Un fallo en la cuenta o en el cliente revierte
persona, cuenta y cliente (RF-20).

- **Alternativa descartada — `QueryRunner` manual:** más código, más superficie de error y
  rompe el estilo ya establecido en el proyecto.

### 5.8 Dependencias explícitas declaradas en el plan

- **Nombre de usuario = email:** el conflicto 409 cubre a la vez la persona (por su email)
  y la cuenta (por su nombre de usuario), con el mismo mensaje.
- **Comprobación insensible sobre valores guardados:** implementada en los dos repositorios
  nuevos (§5.3). `findByEmail` y `findByUsername` existentes se conservan (otros usos).
- **Cliente = persona:** el registro de cliente usa el identificador de la persona creada y
  su dato de actividad queda activo.
- **Cuentas preexistentes con nombres de usuario que no son email:** no se ven afectadas por
  el alta; el login sigue encontrándolas (normaliza el valor entrante y la búsqueda es
  insensible).
- **Divergencia entre las dos vías de alta:** `POST /persons` no cambia (sigue con
  nombre de usuario explícito y límite de contraseña de 50); se documenta en la spec y aquí.
- **Prerrequisito de verificación:** los bloques que exigen autenticación usaron tokens de
  **administrador** y **no administrador** emitidos localmente y firmados con el `JWT_SECRET`
  del entorno de desarrollo; no se dispone de las contraseñas reales de las cuentas sembradas
  (`mperez_admin`/`aflores_admin`).

### 5.9 Cómo se evita que las respuestas de cuentas expongan la contraseña (RF-24, D-23, D-24)

**Decisión:** retirar la contraseña de las tres respuestas afectadas, con dos intervenciones,
cada una en la capa que ya domina el dato:

1. **Lecturas (listado y detalle) — en el repositorio de cuentas:** las dos consultas
   seleccionan de forma explícita los datos visibles de la cuenta —identificador, nombre de
   usuario y fecha de creación heredada— junto con su persona asociada, y **no seleccionan la
   contraseña**. El resto de la respuesta que hoy se entrega se conserva (incluido el objeto
   de persona y, en el listado, su paginación y su orden). No cambia ninguna otra consulta ni
   la escritura de la cuenta, y la búsqueda por nombre de usuario que usa la autenticación
   **sigue trayendo la contraseña**, porque es imprescindible para compararla.
2. **Actualización — en el servicio de cuentas, después de guardar:** la respuesta devuelve
   la cuenta actualizada **sin la contraseña**, conservando el resto de sus datos. Se hace
   aquí, y no en el repositorio de escritura, porque el guardado devuelve por diseño la
   entidad persistida completa (la contraseña del cuerpo se protege y se escribe, y el
   servicio la necesita en memoria durante la operación); cambiar lo que devuelve el guardado
   alteraría una pieza compartida por el resto de escrituras. La retirada es, por tanto, una
   decisión de la **respuesta** del servicio, que es quien conoce el contrato de salida. El
   contrato de entrada del `PATCH` y su comportamiento heredado **no cambian**.

Es una decisión de proyección/serialización: **no** toca el esquema ni los datos.

- **Alternativa descartada — (a) marcar la contraseña como no seleccionable por defecto en el
  modelo y pedirla explícitamente solo en la autenticación:** es la opción «segura por
  defecto», pero cambia la lectura de **todas** las consultas de la cuenta en toda la
  aplicación y, con la escritura actual (carga previa de la cuenta y guardado del objeto
  completo), una cuenta cargada sin la contraseña podría guardarse sin ella al actualizarse,
  lo que dejaría cuentas existentes sin contraseña y rompería su inicio de sesión. El riesgo
  de regresión pesa más que el beneficio para una corrección acotada; se descarta.
- **Alternativa descartada — (c) excluir la contraseña al serializar la respuesta en la capa
  de presentación:** el servicio devuelve objetos planos envueltos por el ayudante de
  respuestas del proyecto, así que declarar el campo como excluido no bastaría: exigiría
  introducir un serializador nuevo o mapear cada respuesta. Es un mecanismo nuevo, más
  amplio, y obliga a tocar los controladores —el mismo archivo que la orquestación del alta
  en curso—, con riesgo de colisión; se descarta.
- **Alternativa descartada — consultar como hoy y borrar la contraseña después, en la capa de
  aplicación:** el dato sensible viaja igualmente hasta la capa de aplicación y cualquier
  punto de lectura nuevo vuelve a exponerlo; no resuelve el problema en su origen.
- **Alternativa descartada — cambiar la proyección del guardado en el repositorio de
  escritura** (que `save` devolviera siempre la cuenta sin contraseña): el guardado es una
  pieza compartida por el resto de escrituras (el alta y las asignaciones), y alterar lo que
  devuelve rompería la expectativa de «devuelve la entidad persistida» en todos esos usos.
  La retirada corresponde al contrato de salida de la respuesta, no al de la escritura; se
  descarta.
- **Fuga residual corregida (D-24):** la respuesta de la actualización de una cuenta, cuando
  el solicitante envía una contraseña, devolvía esa contraseña ya protegida. El usuario
  aprobó incluirla en esta feature, por lo que **queda retirada** con la intervención 2; no
  queda ninguna fuga conocida en las respuestas de cuentas. La vía equivalente de las
  asignaciones de rol se corrige en §5.10.
- **Sin cambio de estructura de datos:** no hay migración ni cambio de esquema asociado a esta
  corrección.

### 5.10 Cómo se evita que las asignaciones de rol expongan la contraseña (RF-25, D-26)

**Decisión:** proyectar el usuario asociado **sin la contraseña** en las dos consultas de
lectura de asignaciones que hoy lo cargan completo —el listado y el detalle—, dentro del
repositorio de asignaciones: seleccionan de forma explícita los datos visibles de la cuenta
—identificador, nombre de usuario y fecha de creación heredada— junto con la asignación
completa y su rol. El resto de la respuesta se conserva: todos los campos de la asignación,
su objeto de rol, el objeto de usuario con esos tres datos y, en el listado, su paginación y
su orden. Las escrituras (creación, actualización y borrado de la asignación) y la búsqueda
por cuenta no se tocan, porque no cargan la cuenta completa. Es una decisión de proyección:
**no** toca el esquema ni los datos, y la contraseña sigue disponible para la autenticación.

**Por qué en ese punto:** por la misma razón que §5.9 —la consulta es el origen del dato
sensible y la proyección cubre cualquier punto de lectura presente, de modo que la contraseña
no viaja hasta capas que no la necesitan—.

- **Alternativa descartada — retirar la relación `user` de la respuesta:** rompería el
  contrato actual (la asignación se entrega junto con su cuenta) y obligaría al consumidor a
  una consulta adicional para obtenerla; se descarta.
- **Alternativa descartada — excluir la contraseña al serializar en la capa de
  presentación:** el servicio devuelve objetos planos envueltos por el ayudante de respuestas
  del proyecto, así que exigiría un serializador nuevo o mapear cada respuesta —mecanismo más
  amplio y acoplado a los controladores—; se descarta.
- **Alternativa descartada — consultar como hoy y borrar el campo después, en la capa de
  aplicación:** el dato sensible viaja igualmente hasta esa capa y cualquier lectura nueva
  vuelve a exponerlo; no resuelve el problema en su origen.
- **Sin cambio de estructura de datos:** no hay migración ni cambio de esquema asociado.

---

## 6. Diseño: contrato observable

### 6.1 `POST /api/v1/users` (rol ADMIN)

**Cuerpo admitido (solo estos dos campos):**

```json
{ "email": "ana@dominio.com", "password": "secreto123" }
```

**Éxito — 201 Created**

```json
{
  "status": "success",
  "message": "Usuario creado correctamente",
  "data": { "id": 12, "username": "ana@dominio.com", "createdAt": "2026-10-18T10:30:00.000Z" },
  "timestamp": "..."
}
```

`data` mantiene `UserResponseDto` (`id`, `username`, `createdAt`) y **nunca** incluye la
contraseña.

**Errores**

| Código | Cuándo | Mensaje (español) |
| --- | --- | --- |
| 400 | Falta `email` o `password`; email vacío/solo espacios; email con formato inválido; email > 255; contraseña fuera de 6–100; se envía `id`, `username` o cualquier dato no admitido | Identifica el dato faltante o rechazado («El email es obligatorio.», «La contraseña debe tener entre 6 y 100 caracteres.», …) |
| 401 | Sin token o token inválido | «No autenticado: token JWT ausente o inválido» |
| 403 | Token sin rol `Administrador` | «Acceso denegado: se requiere rol Administrador» |
| 409 | Ya existe persona o cuenta con ese email (comparación insensible a mayúsculas y espacios) | «El email ya está registrado.» |
| 404 / 500 | Dependencia no satisfecha (rol `Cliente` inexistente) / fallo inesperado | Mensaje controlado por `HandleException` |

**Efectos verificables tras un 201:** persona con `email` normalizado y el resto de datos
personales sin informar; cuenta con `username` = email y contraseña no recuperable;
asignación al rol `Cliente` con `status: true`; registro de cliente del titular activo.

### 6.2 `POST /api/v1/auth/login`

**Cuerpo:** `{ "username": "Ana@Dominio.com ", "password": "<6–100 caracteres>" }`

- El nombre de usuario se normaliza antes de buscarlo; con la cuenta creada por esta alta,
  el valor es su email (RF-9, RF-23).
- **200** con `{ status, message, data: { token }, timestamp }`; **400** si el cuerpo no
  cumple el DTO (contraseña fuera de 6–100, campos ausentes); **401** con «Credenciales no
  válidas» si no coincide.

### 6.3 Swagger (`/documentacion`)

Descripciones en español para `POST /users` (resumen, cuerpo, 400, 409) coherentes con el
nuevo contrato, y en `LoginDto`/`POST /auth/login` para la longitud admitida. Los
identificadores del código permanecen en inglés.

### 6.4 Cambios estructurales (aplicación y verificación)

**Primer cambio (D-20/D-21), ya aplicado:**

```
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" \
     -v ON_ERROR_STOP=1 -f migrations/001_usuario_nombre_longitud_y_unicidad.sql
```

Verificación: describir la tabla del usuario y comprobar el tipo ampliado y la existencia
del índice único; e intentar un alta duplicada después de la migración para observar el
409 (no un 500).

**Segundo cambio (D-25), aplicado y verificado:**

```
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" \
     -v ON_ERROR_STOP=1 -f migrations/002_usuario_fecha_creacion_default.sql
```

Resultado real tras aplicarlo: la columna de fecha de creación de la cuenta muestra
`column_default = LOCALTIMESTAMP`; un alta nueva devuelve `createdAt` con una fecha real (no
nula) y responde con el contrato de siempre; las cuentas preexistentes conservan exactamente
el valor que tenían —las cuentas 17 y 18 siguen sin valor, sin relleno retroactivo—; y una
segunda ejecución del archivo no falla ni altera datos (idempotente). El alta no genera la
fecha: la genera el origen de datos al insertar.

### 6.5 `GET /api/v1/users` y `GET /api/v1/users/:id` (rol ADMIN)

- **200** con el formato de respuesta del proyecto —y, en el listado, con su paginación y su
  orden actuales—. Cada cuenta se entrega con su identificador, su nombre de usuario y su
  fecha de creación, junto con los demás datos que hoy acompañan a la respuesta, y **nunca**
  con la contraseña, ni en texto plano ni protegida (RF-24, RNF-4).
- **401** sin token o con token inválido; **403** con token sin rol administrador; **404** al
  consultar una cuenta inexistente. Ninguno de estos rechazos incluye la contraseña.
- Ningún otro aspecto de la consulta ni de la respuesta cambia (RNF-3, criterio (m)).

### 6.6 `PATCH /api/v1/users/:id` (rol ADMIN)

- **Cuerpo admitido (sin cambios):** `id?`, `username?` y `password?`. Se conserva el
  comportamiento heredado ya decidido —un `id` en el cuerpo puede sobrescribir el de la
  ruta—, que no se corrige.
- **200** con la cuenta actualizada —identificador, nombre de usuario y fecha de creación,
  junto con los demás datos que hoy acompañan a la respuesta— y **sin** la contraseña, ni en
  texto plano ni protegida (RF-24, RNF-4). El resto de la respuesta no cambia.
- **400** si el cuerpo no cumple el DTO; **401/403** como en el resto de operaciones de
  usuario; **404** si la cuenta no existe. Ninguno de estos rechazos incluye la contraseña.

---

## 7. Estrategia de pruebas (primero los criterios de prueba, después el código)

Todos los bloques se ejecutan **con el MCP de Playwright** contra la API en marcha
(`pnpm start:dev`, prefijo `api/v1`), contrastando la respuesta obtenida con el criterio.
Los bloques B1–B3 y B6 se escriben y **se ejecutan en rojo** antes de implementar
(T1, T2, T3, T4 de `tasks.md`); solo después se toca el código. Los casos **B5.6–B5.9** (corrección de las fugas de contraseña) se ejecutan en **T11** y se
**repiten en el cierre** (T10) para validar el estado final.

> **Restricción operativa:** el *throttler* global limita a 30 peticiones por 60 s. El
> guion debe espaciar los requests (o reiniciar el servidor) para no confundir un 429 con
> el resultado esperado.
>
> **Prerrequisito:** token de administrador (y uno no administrador para el 403). Se
> emitieron localmente y se firmaron con el `JWT_SECRET` del entorno de desarrollo; no se
> usaron las contraseñas reales de las cuentas sembradas.

### B1. Contrato de entrada y rechazos del alta — mitiga RF-2, RF-3, RF-4, RF-6, RF-7, RF-8, RF-18, RF-19, RF-21

| Caso | Request | Respuesta esperada |
| --- | --- | --- |
| B1.1 | `POST /users` sin token, cuerpo válido | 401 |
| B1.2 | `POST /users` con token no administrador | 403 |
| B1.3 | Sin `email` | 400 indicando que falta/rechaza el email |
| B1.4 | Sin `password` | 400 indicando que falta la contraseña |
| B1.5 | Email vacío / solo espacios | 400 «email obligatorio» |
| B1.6 | Email sin `@` / sin dominio / con espacios internos | 400 «El email no es válido.» |
| B1.7 | Email de 256 caracteres | 400 con la longitud máxima del email |
| B1.8 | Email válido de 255 caracteres | 201 (tras implementar) |
| B1.9 | Contraseña de 5 y de 101 caracteres | 400 con el rango 6–100 |
| B1.10 | Cuerpo con `id` (identificador de persona) | 400 dato no admitido |
| B1.11 | Cuerpo con `username` | 400 dato no admitido |
| B1.12 | Cuerpo con otro campo cualquiera | 400 dato no admitido |
| B1.13 | cualquiera de los 400 anteriores | comprobar que **no** se creó persona ni cuenta ni cliente (consulta posterior por API) |

### B2. Alta exitosa y efectos observables — mitiga RF-1, RF-5, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16

| Caso | Request | Observación esperada |
| --- | --- | --- |
| B2.1 | `POST /users` con email válido nuevo y contraseña válida | 201 con `data.id`, `data.username = email normalizado`, `data.createdAt` con una fecha real (no nula); sin contraseña en la respuesta |
| B2.2 | `GET /persons/{data.id}` | email normalizado informado; nombres, apellidos, documento, teléfono y fecha de nacimiento **sin informar** |
| B2.3 | `GET /clients/{data.id}` | cliente del titular existente y activo |
| B2.4 | Consulta de las asignaciones de rol de la cuenta | vinculación activa con el rol `Cliente` |
| B2.5 | Email con mayúsculas y espacios al inicio/fin | 201 y `data.username` con el valor normalizado (RF-5, RF-9) |
| B2.6 | Repetir B2.1 con el mismo email en mayúsculas o con espacios | 409 «El email ya está registrado.» y sin registros nuevos |

### B3. Conflictos de duplicado — mitiga RF-17 (y la parte de normalización de RF-5)

| Caso | Request | Respuesta esperada |
| --- | --- | --- |
| B3.1 | Alta con el email de la cuenta creada en B2.1 | 409 y sin registros nuevos |
| B3.2 | Alta con el email en otra combinación de mayúsculas/espacios | 409 |
| B3.3 | Alta con el email de una **persona sin cuenta** existente | 409 y la persona existente intacta |
| B3.4 | Alta con el email de un usuario preexistente cuyo nombre de usuario no es un email | 409 si su email ya está en la persona asociada |

### B4. Login alineado — mitiga RF-22, RF-23, RF-12

| Caso | Request | Respuesta esperada |
| --- | --- | --- |
| B4.1 | `POST /auth/login` con `username = email` de la cuenta creada y su contraseña | 200 con token |
| B4.2 | Igual pero con el email en mayúsculas y con espacios | 200 con token |
| B4.3 | Alta con contraseña de 90 caracteres, y login con esa contraseña | alta 201 y login 200 (antes el login la rechazaba) |
| B4.4 | Login con contraseña incorrecta | 401 «Credenciales no válidas» |

### B5. No regresión — mitiga RNF-3 y el criterio (m); incluye la corrección de las fugas de contraseña (RF-24, RF-25, RNF-4, criterios (o) y (p))

Se verifica que el contrato documentado del `PATCH /users/:id` **no cambia**: sigue
admitiendo `id?`, `username?` y `password?` como hoy (B5.1).

| Caso | Request | Respuesta esperada |
| --- | --- | --- |
| B5.1 | `PATCH /users/{id}` con `{"username": "..."}`, con `{"password": "..."}`, con `{"id": <otro id>, "username": "..."}` y con los tres campos a la vez | 200 en todos los casos: `id?`, `username?` y `password?` siguen admitiéndose sin 400 por dato no admitido, y el esquema documentado en `/documentacion` conserva esos tres campos (RNF-3, criterio (m)) |
| B5.2 | `GET /users`, `GET /users/{id}` | 200 con `UserResponseDto` |
| B5.3 | `DELETE /users/{id}` sobre una cuenta de prueba | 204 |
| B5.4 | `POST /persons` con su contrato actual | 201 sin cambios de comportamiento |
| B5.5 | `GET /clients` y `POST /clients` | contratos intactos |
| B5.6 | `GET /users`, `GET /users/{id}` y `PATCH /users/{id}` con `{"password": "..."}`, los tres con token de administrador | 200 en los tres casos: el listado conserva su paginación y sus datos, el detalle y la actualización conservan los suyos, y **ninguna** de las tres respuestas contiene la contraseña en ningún formato (ni en texto plano ni protegida); se contrasta además que las respuestas siguen entregando los mismos datos que antes, salvo la contraseña, y que el `PATCH` sigue admitiendo `id?`, `username?` y `password?` (RF-24, RNF-4, criterio (o)) |
| B5.7 | `POST /auth/login` con una cuenta existente y su contraseña correcta, después de la corrección; y, tras actualizar su contraseña con `PATCH /users/{id}`, iniciar sesión con la contraseña nueva | 200 con token en ambos casos: la contraseña sigue guardándose y siendo accesible para la validación, es decir, ni la corrección ni la retirada de la respuesta afectaron a la autenticación (RF-12, RNF-7) |
| B5.8 | `GET /user-roles`, con token de administrador | 200: conserva su paginación y todos los datos de cada asignación (incluido su rol) y de la cuenta asociada (identificador, nombre de usuario y fecha de creación), y **ninguna** parte de la respuesta contiene la contraseña, ni en texto plano ni protegida (RF-25, RNF-4, criterio (p)) |
| B5.9 | `GET /user-roles/{id}`, con token de administrador | 200: conserva todos los datos de la asignación, su rol y los datos de la cuenta asociada (identificador, nombre de usuario y fecha de creación), y la respuesta no contiene la contraseña en ningún nivel, ni en texto plano ni protegida (RF-25, RNF-4, criterio (p)) |

> **Nota (incidencia heredada, fuera de alcance):** al enviar `id` en el cuerpo del `PATCH`,
> ese valor sobrescribe el identificador de la ruta (la carga previa del repositorio combina
> ambos). B5.1 verifica **solo la admisión** del campo y la continuidad del contrato
> documentado: la incidencia se **conserva** tal como está hoy y **no** se corrige en esta
> feature (ver §5.4).

### B6. Cambios estructurales y unicidad — mitiga RF-7, RF-9, RF-15 y los criterios (a), (l) y (n)

| Caso | Comprobación | Resultado esperado |
| --- | --- | --- |
| B6.1 | Describir la tabla del usuario en la base | nombre de usuario de 255 caracteres e índice único presente |
| B6.2 | Alta con email de 60 caracteres | 201 (antes no cabía en el nombre de usuario) |
| B6.3 | Alta con email de 256 caracteres | 400 |
| B6.4 | Insertar/altar dos veces el mismo nombre de usuario (alta posterior y, si es viable, dos altas simultáneas) | conflicto (409), nunca 500 ni duplicado persistido |
| B6.5 | Describir la columna de fecha de creación tras aplicar el segundo cambio, y ejecutar un alta nueva | la columna tiene valor por defecto y la respuesta del alta trae `data.createdAt` con una fecha real, no nula (RF-15, criterio (a)) |
| B6.6 | Consultar las cuentas preexistentes (17 y 18) antes y después de aplicar el segundo cambio, y reintentar la aplicación del archivo | conservan exactamente el valor que tenían —las que estaban sin valor siguen sin valor—, el valor por defecto no rellena filas antiguas, y el reintento no falla ni altera datos (D-25) |

### B7. Comprobaciones técnicas del repositorio

- `pnpm build` sin errores.
- `pnpm lint` (`oxlint src`) sin nuevos avisos.
- `pnpm test` se ejecuta para confirmar que los specs de Vitest existentes **siguen
  pasando**; no se añaden ni se reescriben specs de Vitest y no son el método de
  verificación de esta feature.

### Cómo se cierra cada requisito

| Requisitos | Bloque que lo verifica |
| --- | --- |
| RF-2, RF-3, RF-4, RF-6, RF-7, RF-8, RF-18, RF-19, RF-21 | B1 (y B6.3 para el máximo del email) |
| RF-1, RF-5, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-16 | B2 |
| RF-15 y criterio (a) (fecha de creación real del alta) | B2.1, B6.5 y B6.6 |
| RF-17 | B3, B2.6, B6.4 |
| RF-22, RF-23 | B4 |
| RF-24 (consultas y actualización de cuentas sin contraseña) | B5.6 (listado, detalle y actualización) y B5.7 (la autenticación sigue funcionando) |
| RF-25 (asignaciones de rol sin contraseña) | B5.8 (listado) y B5.9 (asignación concreta) |
| RNF-1 (mensajes en español) | B1, B3 (mensajes observados) |
| RNF-2 (atomicidad) | B2 (efectos completos) y ausencia de registros parciales en B1.13/B3 |
| RNF-3 (contrato) | B5 |
| RNF-4 (sin contraseña en respuestas) | B2.1, B5.6, B5.8 y B5.9 |
| RNF-5 (documentación en español) | Revisión de `/documentacion` en la tarea de cierre |
| RNF-6 (validación previa) | B1.13 (ningún registro creado en rechazos) |
| RNF-7 (cuenta lista para operar) | B2.2, B2.3, B2.4, B4.1, B5.7 |

---

## 8. Orden de implementación y trazabilidad

1. Guiones de verificación B1–B3, B6 (rojo) — sin tocar `src/`.
2. Cambios estructurales autorizados aplicados y verificados: (i) longitud 255 e índice
   único (D-20/D-21); y (ii) valor por defecto de la fecha de creación (D-25), aplicado y
   verificado antes del cierre.
3. Función pura compartida de normalización.
4. DTOs del alta y del login/`UpdateUserDto`.
5. Búsquedas insensibles en los repositorios.
6. `PersonService.registerAccount` + `UserService.create` + `imports` del módulo.
7. `AuthService.login` alineado.
8. Retirada de la contraseña en el listado, el detalle y la respuesta de la actualización de
   cuentas (RF-24), y en el listado y el detalle de asignaciones de rol (RF-25): la primera
   toca el servicio de cuentas, así que va **después** del paso 6 (orquestación del alta),
   nunca en paralelo con él; la segunda solo toca la proyección del repositorio de
   asignaciones.
9. Guion completo en verde, `pnpm build`, `pnpm lint`, `pnpm test` de no regresión,
   `MEMORY.md`.

Detalle, dependencias y agrupaciones paralelizables: `tasks.md`.

---

## 9. Fuera de alcance del plan

- Cambios en `POST /persons`, `POST /clients` y sus DTOs (más allá de no tocarlos).
- Asignación de roles distintos de `Cliente` (sigue en `POST /user-roles`).
- Cualquier otro cambio de estructura de datos que los tres autorizados (D-20, D-21, D-25).
- Frontend (`frontend-cine-dip`), dependencias nuevas, scripts nuevos en `package.json`.
- Migrar la verificación a Vitest (roadmap del proyecto, no de esta feature).
