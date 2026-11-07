-- =============================================================================
-- Movie Dreams — Migración 002
-- Esquema afectado: seguridad (tabla seguridad.usuario)
--
-- QUÉ HACE
--   Añade un valor por defecto de fecha a seguridad.usuario.fecha_creacion, de
--   modo que toda cuenta nueva reciba una fecha de creación real al insertarse
--   sin especificarla.
--
-- POR QUÉ (decisión autorizada por el usuario: D-25 de la spec 001)
--   El alta de usuarios (`POST /api/v1/users`) devolvía `createdAt: null` porque
--   la columna `fecha_creacion` no tenía valor por defecto en la base: la
--   entidad ORM la declara como `@CreateDateColumn`, pero con
--   `synchronize: false` ese valor por defecto nunca se materializó. La fecha de
--   creación de la cuenta la genera el origen de datos —el backend no la
--   calcula—, por lo que el valor por defecto es el mecanismo correcto. Esta
--   decisión excepciona, solo para esta columna de auditoría, la regla general
--   de no generar fechas en la base.
--
-- ALCANCE
--   Solo el valor por defecto de esa columna. NO se rellena retroactivamente
--   ninguna fila existente (ningún `UPDATE`): las cuentas que hoy tienen la
--   fecha sin valor siguen sin valor. No se cambia el tipo, la nulabilidad, las
--   restricciones ni ninguna otra columna, y no se toca
--   identidad.cliente.fecha_registro.
--
-- CÓMO SE APLICA (manual, sin CLI de TypeORM y sin `synchronize`)
--   psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" \
--        -v ON_ERROR_STOP=1 -f migrations/002_usuario_fecha_creacion_default.sql
--   El cambio se aplica dentro de una única transacción (BEGIN/COMMIT): si algo
--   falla, no queda nada a medias.
--
-- CARÁCTER IDEMPOTENTE
--   `ALTER COLUMN ... SET DEFAULT LOCALTIMESTAMP` puede ejecutarse cuantas veces
--   se quiera: la segunda ejecución deja el mismo valor por defecto y no altera
--   ninguna fila. No hay comprobaciones previas que dependan del estado, por lo
--   que el archivo es seguro de reintentar.
--
-- CÓMO SE REVIERTE
--   ALTER TABLE seguridad.usuario
--       ALTER COLUMN fecha_creacion DROP DEFAULT;
--
-- CÓMO SE VERIFICA
--   SELECT column_name, data_type, is_nullable, column_default
--     FROM information_schema.columns
--    WHERE table_schema = 'seguridad'
--      AND table_name   = 'usuario'
--      AND column_name  = 'fecha_creacion';
--   -- column_default debe mostrar LOCALTIMESTAMP.
--
--   SELECT id_persona, fecha_creacion
--     FROM seguridad.usuario
--    ORDER BY id_persona;
--   -- las filas preexistentes conservan exactamente su valor (las que estaban
--   -- sin valor siguen en NULL: no hay relleno retroactivo).
-- =============================================================================

\set ON_ERROR_STOP on

BEGIN;

SET LOCAL lock_timeout = '5s';

-- Valor por defecto en hora local del usuario (la columna es `timestamp without
-- time zone` y el proyecto trabaja en hora local, sin conversión a UTC). Solo
-- alcanza a las filas nuevas: no se modifica ningún registro existente.
ALTER TABLE seguridad.usuario
    ALTER COLUMN fecha_creacion SET DEFAULT LOCALTIMESTAMP;

COMMIT;
