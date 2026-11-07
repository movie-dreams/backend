-- =============================================================================
-- Movie Dreams — Migración 001
-- Esquema afectado: seguridad (tabla seguridad.usuario)
--
-- QUÉ HACE
--   1. Amplía la longitud del nombre de usuario: seguridad.usuario.usuario pasa
--      de character varying(50) a character varying(255).
--   2. Materializa la unicidad del nombre de usuario con la restricción
--      usuario_usuario_key (ALTER TABLE ... ADD CONSTRAINT ... UNIQUE (usuario)),
--      que en PostgreSQL crea además el índice único del mismo nombre.
--
-- POR QUÉ (decisión autorizada por el usuario: D-20 y D-21 de la spec 001)
--   Al pasar el nombre de usuario de la cuenta a ser el email (que admite hasta
--   255 caracteres), la longitud anterior de 50 ya no cabría; la ampliación de
--   un varchar es ampliativa y no destructiva. Además, la entidad ORM declaraba
--   `unique: true` pero con `synchronize: false` el índice único NUNCA llegó a
--   existir en la base física: la unicidad era solo una declaración del modelo.
--   Materializarla es la garantía real frente a altas simultáneas con el mismo
--   email. Verificado antes de aplicar: no hay nombres de usuario duplicados en
--   los datos actuales (12 filas, 12 valores distintos comparando sin distinguir
--   mayúsculas ni espacios), por lo que el cambio es aplicable.
--
-- ALCANCE
--   Solo estos dos cambios. No se renombra ninguna columna, no se cambia ningún
--   tipo de forma destructiva, no se añade NOT NULL y no se toca ningún otro
--   registro ni esquema.
--
-- CÓMO SE APLICA (manual, sin CLI de TypeORM y sin `synchronize`)
--   psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" \
--        -v ON_ERROR_STOP=1 -f migrations/001_usuario_nombre_longitud_y_unicidad.sql
--   Todo el cambio se aplica dentro de una única transacción (BEGIN/COMMIT):
--   si algo falla, no queda nada a medias.
--
-- CARÁCTER IDEMPOTENTE
--   - La ampliación de longitud es inocua si ya vale 255.
--   - La restricción única solo se añade si no existe todavía.
--   - La comprobación de duplicados se ejecuta siempre y aborta con un mensaje
--     claro si aparecieran valores repetidos.
--
-- CÓMO SE REVIERTE (en orden inverso a la aplicación)
--   -- 1) Elimina la restricción única (y su índice):
--   --   ALTER TABLE seguridad.usuario DROP CONSTRAINT IF EXISTS usuario_usuario_key;
--   -- 2) Devuelve la longitud anterior:
--   --   ALTER TABLE seguridad.usuario ALTER COLUMN usuario TYPE character varying(50);
--   La reversión de la longitud fallaría si algún nombre de usuario guardado
--   superase los 50 caracteres: en ese caso habría que depurar antes los datos,
--   no truncarlos.
--
-- CÓMO SE VERIFICA
--   \d seguridad.usuario   ->  usuario | character varying(255)
--                              usuario_usuario_key UNIQUE CONSTRAINT, btree (usuario)
--   SELECT conname, contype, pg_get_constraintdef(oid)
--     FROM pg_constraint WHERE conrelid = 'seguridad.usuario'::regclass;
-- =============================================================================

\set ON_ERROR_STOP on

BEGIN;

SET LOCAL lock_timeout = '5s';

-- 1) Comprobación previa: si ya hubiera nombres de usuario duplicados (comparando
--    sin distinguir mayúsculas ni espacios), se aborta la migración completa para
--    no dejar la base a medias ni imponer la unicidad sobre datos en conflicto.
DO $$
DECLARE
    duplicados text;
BEGIN
    SELECT string_agg(
               format('  - «%s» aparece %s veces', d.usuario_normalizado, d.repeticiones),
               E'\n' ORDER BY d.repeticiones DESC)
      INTO duplicados
      FROM (
          SELECT lower(trim(usuario)) AS usuario_normalizado,
                 count(*)             AS repeticiones
            FROM seguridad.usuario
           WHERE usuario IS NOT NULL
           GROUP BY lower(trim(usuario))
          HAVING count(*) > 1
      ) AS d;

    IF duplicados IS NOT NULL THEN
        RAISE EXCEPTION
            E'Migración 001 abortada: existen nombres de usuario duplicados, por lo que no se puede imponer la unicidad de seguridad.usuario.usuario.\n%',
            duplicados
            USING HINT = 'Depure los nombres de usuario repetidos (sin distinguir mayúsculas ni espacios) y vuelva a ejecutar la migración; no se ha modificado nada.';
    END IF;
END
$$;

-- 2) Ampliación de la longitud del nombre de usuario: 50 -> 255 caracteres.
ALTER TABLE seguridad.usuario
    ALTER COLUMN usuario TYPE character varying(255);

-- 3) Materialización de la unicidad del nombre de usuario. El nombre de la
--    restricción sigue la convención de PostgreSQL para la tabla y la columna
--    (como la clave primaria seguridad.usuario_pkey) y el índice único que crea
--    se llama igual: usuario_usuario_key.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_constraint
         WHERE conrelid = 'seguridad.usuario'::regclass
           AND conname  = 'usuario_usuario_key'
    ) THEN
        ALTER TABLE seguridad.usuario
            ADD CONSTRAINT usuario_usuario_key UNIQUE (usuario);
    END IF;
END
$$;

COMMIT;
