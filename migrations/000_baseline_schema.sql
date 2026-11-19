-- =============================================================================
-- Movie Dreams — Migración 000 (baseline)
-- Esquema afectado: cartelera, identidad, seguridad, ventas
--
-- QUÉ HACE
--   Crea el schema completo (tablas, secuencias, FKs, índices) a partir de un
--   dump --schema-only de la base de desarrollo existente.
--
-- NOTA
--   El estado físico de origen aún no incluía las migraciones 001/002; esas
--   se aplican después de forma idempotente. No inserta datos (roles → 003).
--
-- APLICACIÓN
--   Automática vía cinema/docker/migrate.sh (tabla public.schema_migrations).
-- =============================================================================

\set ON_ERROR_STOP on

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cartelera; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS cartelera;


--
-- Name: identidad; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS identidad;


--
-- Name: seguridad; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS seguridad;


--
-- Name: ventas; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS ventas;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asiento; Type: TABLE; Schema: cartelera; Owner: -
--

CREATE TABLE cartelera.asiento (
    id_asiento integer NOT NULL,
    id_sala integer,
    fila character varying(20),
    numero integer,
    tipo character varying(20),
    activo boolean
);


--
-- Name: asiento_id_asiento_seq; Type: SEQUENCE; Schema: cartelera; Owner: -
--

CREATE SEQUENCE cartelera.asiento_id_asiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asiento_id_asiento_seq; Type: SEQUENCE OWNED BY; Schema: cartelera; Owner: -
--

ALTER SEQUENCE cartelera.asiento_id_asiento_seq OWNED BY cartelera.asiento.id_asiento;


--
-- Name: funcion; Type: TABLE; Schema: cartelera; Owner: -
--

CREATE TABLE cartelera.funcion (
    id_funcion integer NOT NULL,
    id_pelicula integer,
    id_sala integer,
    fecha date,
    hora_inicio time without time zone,
    hora_fin time without time zone,
    precio numeric,
    estado character varying(20)
);


--
-- Name: funcion_id_funcion_seq; Type: SEQUENCE; Schema: cartelera; Owner: -
--

CREATE SEQUENCE cartelera.funcion_id_funcion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: funcion_id_funcion_seq; Type: SEQUENCE OWNED BY; Schema: cartelera; Owner: -
--

ALTER SEQUENCE cartelera.funcion_id_funcion_seq OWNED BY cartelera.funcion.id_funcion;


--
-- Name: imagen_pelicula; Type: TABLE; Schema: cartelera; Owner: -
--

CREATE TABLE cartelera.imagen_pelicula (
    id_imagen_pelicula integer NOT NULL,
    nombre_archivo character varying(255) NOT NULL,
    tamano_bytes integer NOT NULL,
    id_pelicula integer NOT NULL
);


--
-- Name: imagen_pelicula_id_imagen_pelicula_seq; Type: SEQUENCE; Schema: cartelera; Owner: -
--

CREATE SEQUENCE cartelera.imagen_pelicula_id_imagen_pelicula_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: imagen_pelicula_id_imagen_pelicula_seq; Type: SEQUENCE OWNED BY; Schema: cartelera; Owner: -
--

ALTER SEQUENCE cartelera.imagen_pelicula_id_imagen_pelicula_seq OWNED BY cartelera.imagen_pelicula.id_imagen_pelicula;


--
-- Name: pelicula; Type: TABLE; Schema: cartelera; Owner: -
--

CREATE TABLE cartelera.pelicula (
    id_pelicula integer NOT NULL,
    titulo character varying(100),
    sinopsis text,
    duracion_minutos integer,
    fecha_estreno date,
    activo boolean
);


--
-- Name: pelicula_id_pelicula_seq; Type: SEQUENCE; Schema: cartelera; Owner: -
--

CREATE SEQUENCE cartelera.pelicula_id_pelicula_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pelicula_id_pelicula_seq; Type: SEQUENCE OWNED BY; Schema: cartelera; Owner: -
--

ALTER SEQUENCE cartelera.pelicula_id_pelicula_seq OWNED BY cartelera.pelicula.id_pelicula;


--
-- Name: sala; Type: TABLE; Schema: cartelera; Owner: -
--

CREATE TABLE cartelera.sala (
    id_sala integer NOT NULL,
    nombre character varying(100),
    capacidad integer,
    tipo character varying(20),
    activa boolean
);


--
-- Name: sala_id_sala_seq; Type: SEQUENCE; Schema: cartelera; Owner: -
--

CREATE SEQUENCE cartelera.sala_id_sala_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sala_id_sala_seq; Type: SEQUENCE OWNED BY; Schema: cartelera; Owner: -
--

ALTER SEQUENCE cartelera.sala_id_sala_seq OWNED BY cartelera.sala.id_sala;


--
-- Name: cliente; Type: TABLE; Schema: identidad; Owner: -
--

CREATE TABLE identidad.cliente (
    id_persona integer NOT NULL,
    fecha_registro timestamp without time zone,
    activo boolean
);


--
-- Name: persona; Type: TABLE; Schema: identidad; Owner: -
--

CREATE TABLE identidad.persona (
    id_persona integer NOT NULL,
    nombres character varying(60),
    apellidos character varying(40),
    documento character varying(20),
    telefono character varying(15),
    email character varying(255),
    fecha_nacimiento date
);


--
-- Name: persona_id_persona_seq; Type: SEQUENCE; Schema: identidad; Owner: -
--

CREATE SEQUENCE identidad.persona_id_persona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: persona_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: identidad; Owner: -
--

ALTER SEQUENCE identidad.persona_id_persona_seq OWNED BY identidad.persona.id_persona;


--
-- Name: rol; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.rol (
    id_rol integer NOT NULL,
    rol character varying(30)
);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

CREATE SEQUENCE seguridad.rol_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rol_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: -
--

ALTER SEQUENCE seguridad.rol_id_rol_seq OWNED BY seguridad.rol.id_rol;


--
-- Name: rol_usuario; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.rol_usuario (
    id_rol_usuario bigint NOT NULL,
    id_usuario integer,
    id_rol integer,
    fecha_inicio date,
    fecha_fin date,
    estado boolean
);


--
-- Name: rol_usuario_id_rol_usuario_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

CREATE SEQUENCE seguridad.rol_usuario_id_rol_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rol_usuario_id_rol_usuario_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: -
--

ALTER SEQUENCE seguridad.rol_usuario_id_rol_usuario_seq OWNED BY seguridad.rol_usuario.id_rol_usuario;


--
-- Name: usuario; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.usuario (
    id_persona integer NOT NULL,
    usuario character varying(50),
    contrasena character varying(255),
    fecha_creacion timestamp without time zone
);


--
-- Name: detalle_reserva; Type: TABLE; Schema: ventas; Owner: -
--

CREATE TABLE ventas.detalle_reserva (
    id_detalle_reserva integer NOT NULL,
    id_reserva integer,
    id_asiento integer,
    precio numeric
);


--
-- Name: detalle_reserva_id_detalle_reserva_seq; Type: SEQUENCE; Schema: ventas; Owner: -
--

CREATE SEQUENCE ventas.detalle_reserva_id_detalle_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_reserva_id_detalle_reserva_seq; Type: SEQUENCE OWNED BY; Schema: ventas; Owner: -
--

ALTER SEQUENCE ventas.detalle_reserva_id_detalle_reserva_seq OWNED BY ventas.detalle_reserva.id_detalle_reserva;


--
-- Name: reserva; Type: TABLE; Schema: ventas; Owner: -
--

CREATE TABLE ventas.reserva (
    id_reserva integer NOT NULL,
    id_cliente integer,
    id_funcion integer,
    fecha_reserva timestamp without time zone,
    codigo_reserva character varying(20),
    estado character varying(20),
    total numeric
);


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE; Schema: ventas; Owner: -
--

CREATE SEQUENCE ventas.reserva_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: ventas; Owner: -
--

ALTER SEQUENCE ventas.reserva_id_reserva_seq OWNED BY ventas.reserva.id_reserva;


--
-- Name: asiento id_asiento; Type: DEFAULT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.asiento ALTER COLUMN id_asiento SET DEFAULT nextval('cartelera.asiento_id_asiento_seq'::regclass);


--
-- Name: funcion id_funcion; Type: DEFAULT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.funcion ALTER COLUMN id_funcion SET DEFAULT nextval('cartelera.funcion_id_funcion_seq'::regclass);


--
-- Name: imagen_pelicula id_imagen_pelicula; Type: DEFAULT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.imagen_pelicula ALTER COLUMN id_imagen_pelicula SET DEFAULT nextval('cartelera.imagen_pelicula_id_imagen_pelicula_seq'::regclass);


--
-- Name: pelicula id_pelicula; Type: DEFAULT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.pelicula ALTER COLUMN id_pelicula SET DEFAULT nextval('cartelera.pelicula_id_pelicula_seq'::regclass);


--
-- Name: sala id_sala; Type: DEFAULT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.sala ALTER COLUMN id_sala SET DEFAULT nextval('cartelera.sala_id_sala_seq'::regclass);


--
-- Name: persona id_persona; Type: DEFAULT; Schema: identidad; Owner: -
--

ALTER TABLE ONLY identidad.persona ALTER COLUMN id_persona SET DEFAULT nextval('identidad.persona_id_persona_seq'::regclass);


--
-- Name: rol id_rol; Type: DEFAULT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol ALTER COLUMN id_rol SET DEFAULT nextval('seguridad.rol_id_rol_seq'::regclass);


--
-- Name: rol_usuario id_rol_usuario; Type: DEFAULT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_usuario ALTER COLUMN id_rol_usuario SET DEFAULT nextval('seguridad.rol_usuario_id_rol_usuario_seq'::regclass);


--
-- Name: detalle_reserva id_detalle_reserva; Type: DEFAULT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.detalle_reserva ALTER COLUMN id_detalle_reserva SET DEFAULT nextval('ventas.detalle_reserva_id_detalle_reserva_seq'::regclass);


--
-- Name: reserva id_reserva; Type: DEFAULT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.reserva ALTER COLUMN id_reserva SET DEFAULT nextval('ventas.reserva_id_reserva_seq'::regclass);


--
-- Name: asiento asiento_pkey; Type: CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.asiento
    ADD CONSTRAINT asiento_pkey PRIMARY KEY (id_asiento);


--
-- Name: funcion funcion_pkey; Type: CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.funcion
    ADD CONSTRAINT funcion_pkey PRIMARY KEY (id_funcion);


--
-- Name: imagen_pelicula imagen_pelicula_pkey; Type: CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.imagen_pelicula
    ADD CONSTRAINT imagen_pelicula_pkey PRIMARY KEY (id_imagen_pelicula);


--
-- Name: pelicula pelicula_pkey; Type: CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.pelicula
    ADD CONSTRAINT pelicula_pkey PRIMARY KEY (id_pelicula);


--
-- Name: sala sala_pkey; Type: CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.sala
    ADD CONSTRAINT sala_pkey PRIMARY KEY (id_sala);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: identidad; Owner: -
--

ALTER TABLE ONLY identidad.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_persona);


--
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: identidad; Owner: -
--

ALTER TABLE ONLY identidad.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id_persona);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- Name: rol_usuario rol_usuario_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_usuario
    ADD CONSTRAINT rol_usuario_pkey PRIMARY KEY (id_rol_usuario);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_persona);


--
-- Name: detalle_reserva detalle_reserva_pkey; Type: CONSTRAINT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.detalle_reserva
    ADD CONSTRAINT detalle_reserva_pkey PRIMARY KEY (id_detalle_reserva);


--
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id_reserva);


--
-- Name: asiento asiento_id_sala_fkey; Type: FK CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.asiento
    ADD CONSTRAINT asiento_id_sala_fkey FOREIGN KEY (id_sala) REFERENCES cartelera.sala(id_sala);


--
-- Name: imagen_pelicula fk_pelicula; Type: FK CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.imagen_pelicula
    ADD CONSTRAINT fk_pelicula FOREIGN KEY (id_pelicula) REFERENCES cartelera.pelicula(id_pelicula) ON DELETE CASCADE;


--
-- Name: funcion funcion_id_pelicula_fkey; Type: FK CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.funcion
    ADD CONSTRAINT funcion_id_pelicula_fkey FOREIGN KEY (id_pelicula) REFERENCES cartelera.pelicula(id_pelicula);


--
-- Name: funcion funcion_id_sala_fkey; Type: FK CONSTRAINT; Schema: cartelera; Owner: -
--

ALTER TABLE ONLY cartelera.funcion
    ADD CONSTRAINT funcion_id_sala_fkey FOREIGN KEY (id_sala) REFERENCES cartelera.sala(id_sala);


--
-- Name: cliente cliente_id_persona_fkey; Type: FK CONSTRAINT; Schema: identidad; Owner: -
--

ALTER TABLE ONLY identidad.cliente
    ADD CONSTRAINT cliente_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES identidad.persona(id_persona);


--
-- Name: rol_usuario rol_usuario_id_rol_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_usuario
    ADD CONSTRAINT rol_usuario_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES seguridad.rol(id_rol);


--
-- Name: rol_usuario rol_usuario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_usuario
    ADD CONSTRAINT rol_usuario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_persona);


--
-- Name: usuario usuario_id_persona_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario
    ADD CONSTRAINT usuario_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES identidad.persona(id_persona);


--
-- Name: detalle_reserva detalle_reserva_id_asiento_fkey; Type: FK CONSTRAINT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.detalle_reserva
    ADD CONSTRAINT detalle_reserva_id_asiento_fkey FOREIGN KEY (id_asiento) REFERENCES cartelera.asiento(id_asiento);


--
-- Name: detalle_reserva detalle_reserva_id_reserva_fkey; Type: FK CONSTRAINT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.detalle_reserva
    ADD CONSTRAINT detalle_reserva_id_reserva_fkey FOREIGN KEY (id_reserva) REFERENCES ventas.reserva(id_reserva);


--
-- Name: reserva reserva_id_cliente_fkey; Type: FK CONSTRAINT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.reserva
    ADD CONSTRAINT reserva_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES identidad.cliente(id_persona);


--
-- Name: reserva reserva_id_funcion_fkey; Type: FK CONSTRAINT; Schema: ventas; Owner: -
--

ALTER TABLE ONLY ventas.reserva
    ADD CONSTRAINT reserva_id_funcion_fkey FOREIGN KEY (id_funcion) REFERENCES cartelera.funcion(id_funcion);


--
-- PostgreSQL database dump complete
--


