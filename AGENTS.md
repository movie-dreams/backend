---
description: Contexto global y forma de trabajar para Movie Dreams.
alwaysApply: true
---

# Movie Dreams

Backend del producto **Movie Dreams**: API REST para comprar entradas de una
película —cartelera, salas, asientos, funciones, reservas y usuarios/roles—.
Lo consume el frontend en
`/mnt/Data/frontend-web-architecture/frontend-cine-dip`, **desarrollado por otra
persona**: este repo es solo el backend y el frontend no se modifica.

## Stack y estructura

- NestJS 12 + TypeScript 6 (ESM, `nodenext`, imports con extensión `.js`) +
  TypeORM/PostgreSQL + Vitest, gestionado con **pnpm**. Toolchain oficial y fijo:
  no se cambia sin aprobación.
- Arquitectura por módulos en capas: `domain/` (entidades, repositorios, enums),
  `application/` (servicios y DTO), `infrastructure/` (entidades ORM,
  persistencia, estrategias) y `presentation/` (controladores).
- Archivos clave:
  - `src/main.ts` — bootstrap, prefijo global `api/v1`, Swagger en
    `/documentacion`, CORS y `ValidationPipe`.
  - `src/app.module.ts` — composición de módulos, TypeORM, throttler y estáticos.
  - `src/config/*` — configuración y validación de variables de entorno.
  - `src/modules/{auth,identity,security,billboard,sales}` — módulos de dominio.
  - `src/common/*` — DTO, decoradores, interfaces y utilidades compartidas.
  - `migrations/` — migraciones DDL de la base de datos (raíz del proyecto).

## Convenciones

- **Código en inglés**: identificadores, tipos, funciones y comentarios técnicos.
- **Interfaz y documentación en español**: mensajes de error de la API,
  descripciones de Swagger, JSDoc, `MEMORY.md`, este archivo y
  `docs/constitution.md`.
- Los errores y respuestas usan los helpers de `src/common`, no formatos sueltos.

## Datos y Persistencia

- PostgreSQL con esquemas `cartelera`, `ventas`, `identidad` y `seguridad`. Las
  **columnas físicas están en español** y se mapean a propiedades en inglés en
  las entidades ORM (`src/modules/*/infrastructure/entities/*.orm-entity.ts`).
- Todo cambio de esquema se hace con **migraciones DDL** en `migrations/` (raíz).
  Sin `synchronize`.
- **Compatibilidad hacia atrás** obligatoria: nunca renombrar columnas ni cambiar
  tipos sin una migración aprobada.

## Fechas y tiempo

- Se usa la **hora local** del usuario; no se convierte a UTC.
- Las fechas y horas **siempre llegan en el request**. Prohibido generarlas en la
  base de datos o en el servicio del backend.
- El parseo y formateo de fechas se centraliza en funciones puras que reciben la
  fecha (o `hoy`) como parámetro.

## Forma de trabajar

- Usa la **skill sdd** para todo el ciclo de vida: capturar requerimientos
  funcionales, definir los no funcionales, planificar los cambios, implementar,
  verificar y cerrar con un resumen.
- Lee `AGENTS.md`, `docs/constitution.md`, `MEMORY.md` y la spec activa
  (`specs/NNN-*/spec.md`) antes de tocar código.
- Eres dueño de `MEMORY.md`: actualízalo en cada ciclo para transmitir el
  contexto entre sesiones.
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Escribe los **casos de prueba (test cases) antes** de comenzar la
  implementación; implementar es, únicamente, dejarlos en verde.
- **Ningún cambio está terminado si no está verificado.**
- Si te bloqueas, prueba hasta **3 soluciones distintas**; si persiste,
  comunícamelo para que yo decida.
- Al terminar, dame un resumen con los cambios clave y cualquier decisión a
  revisar.
- Nota de rutas sdd: donde la skill dice `.cursor/constitution.md` y
  `.cursor/MEMORY.md`, en este repo son `docs/constitution.md` y `MEMORY.md`.

## Límites

- ✅ **Siempre**: leer `AGENTS.md`, `docs/constitution.md`, `MEMORY.md` y la spec
  activa; verificar el cambio antes de darlo por terminado; actualizar
  `MEMORY.md`.
- ⚠ **Pregunta antes**: añadir dependencias, cambios de esquema o migraciones
  nuevas, renombrar campos y cambios estructurales de carpetas.
- 🚫 **Nunca**: modificar el esquema físico o borrar datos sin migración
  aprobada; añadir librerías sin aprobación; implementar fuera de la spec activa;
  tocar el frontend (`/mnt/Data/frontend-web-architecture/frontend-cine-dip`).

## Verificación

- Por ahora cada criterio de aceptación se valida **interactuando con la API
  mediante el MCP de Playwright**: se envía el request y se contrasta la respuesta
  obtenida contra el criterio esperado.
- **Roadmap**: en el futuro la verificación pasará a **tests unitarios** con
  Vitest (`pnpm test`, specs `*.spec.ts`). El toolchain de Vitest y los specs
  existentes se conservan y no se eliminan.
- El *cómo* se verifica cada cambio concreto se detalla en la spec/plan
  correspondiente (`specs/NNN-*/`).
- Comandos técnicos: `pnpm start:dev`, `pnpm build`, `pnpm lint`, `pnpm format`.
