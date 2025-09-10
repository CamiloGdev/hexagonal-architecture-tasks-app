-- Up Migration

-- Habilitar la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear la tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función que actualiza el timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se dispara ANTES de cualquier UPDATE en la tabla 'users'
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

------------------------------------------------------------------

-- Down Migration

-- Eliminar el trigger de la tabla 'users'
DROP TRIGGER IF EXISTS set_timestamp ON users;

-- Eliminar la función
DROP FUNCTION IF EXISTS trigger_set_timestamp ();

-- Eliminar la tabla de usuarios
DROP TABLE IF EXISTS users;
