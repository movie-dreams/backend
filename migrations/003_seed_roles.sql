-- =============================================================================
-- Movie Dreams — Migración 003
-- Esquema afectado: seguridad (tabla seguridad.rol)
--
-- QUÉ HACE
--   Inserta los roles de sistema por defecto si aún no existen:
--   Administrador, Gerente y Cliente.
--
-- POR QUÉ
--   El registro y la autorización dependen de que existan estos nombres exactos
--   en seguridad.rol. Un volumen Postgres vacío no los crea solo.
--
-- CARÁCTER IDEMPOTENTE
--   Solo inserta cuando no hay una fila con el mismo nombre de rol.
-- =============================================================================

\set ON_ERROR_STOP on

BEGIN;

INSERT INTO seguridad.rol (rol)
SELECT v.rol
  FROM (VALUES
          ('Administrador'),
          ('Gerente'),
          ('Cliente')
       ) AS v(rol)
 WHERE NOT EXISTS (
           SELECT 1
             FROM seguridad.rol r
            WHERE r.rol = v.rol
       );

COMMIT;
