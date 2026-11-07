# Constitución — Movie Dreams

Principios innegociables basados en la **skill sdd**. Toda spec, plan y tarea
debe cumplirlos de forma estricta.

1. **Simplicidad primero**: El toolchain es NestJS 12 + TypeScript 6 (ESM) +
   TypeORM/PostgreSQL + Vitest sobre pnpm. No se añaden dependencias, ORM,
   empaquetadores ni capas nuevas sin aprobación explícita.
2. **La spec manda**: Nada se implementa si no está en la spec activa
   (`specs/NNN-*/`). Si falta una decisión de negocio o diseño, se para y se
   pregunta.
3. **Lógica separada del framework**: Los cómputos de negocio son funciones
   puras y deterministas que reciben parámetros como «hoy». Prohibido
   `Date.now()`, `new Date()` o acceso a HTTP o TypeORM dentro de ellas.
4. **Verificación como puerta**: Ningún cambio se declara completo hasta
   verificarlo. El *cómo* se verifica se especifica en `AGENTS.md` (hoy con el
   MCP de Playwright; en el futuro, con tests unitarios de Vitest, que se
   conservan).
5. **Los datos son sagrados**: Los esquemas `cartelera`, `ventas`, `identidad` y
   `seguridad` y sus columnas físicas son intocables; todo cambio va por una
   migración DDL aprobada, sin `synchronize`, ni borrados ni renombrados sin
   consentimiento.
6. **Idioma**: Código (nombres, tipos y comentarios técnicos) en inglés; todo lo
   demás —mensajes, documentación, Swagger e interfaz— en español.
