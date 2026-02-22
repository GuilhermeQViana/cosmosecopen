-- CosmoSec — Script de Inicialização do Banco de Dados
-- Este arquivo é executado automaticamente pelo PostgreSQL
-- na primeira vez que o container é criado.
--
-- Ele configura os roles necessários para o Supabase funcionar
-- e depois carrega o schema da aplicação.

-- ═══════════════════════════════════════════════════════
-- 1. Criar roles do Supabase (se não existirem)
-- ═══════════════════════════════════════════════════════

DO $$
BEGIN
  -- Role: anon (acesso público, sem autenticação)
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;

  -- Role: authenticated (usuários autenticados)
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;

  -- Role: service_role (acesso total, usado pelo backend)
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;

  -- Role: authenticator (usado pelo PostgREST para conectar)
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'cosmosec_db_pass';
  END IF;

  -- Role: supabase_auth_admin (usado pelo GoTrue)
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'cosmosec_db_pass';
  END IF;

  -- Role: supabase_admin (usado pelo Studio/Meta)
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'cosmosec_db_pass';
  END IF;

  -- Role: supabase_storage_admin
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'cosmosec_db_pass';
  END IF;
END
$$;

-- Conceder permissões aos roles
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_auth_admin TO authenticator;

-- Permissões do supabase_admin
GRANT ALL ON DATABASE postgres TO supabase_admin;
ALTER ROLE supabase_admin SUPERUSER;

-- ═══════════════════════════════════════════════════════
-- 2. Criar schemas necessários
-- ═══════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS storage;

-- Permissões nos schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO supabase_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════
-- 3. Extensões necessárias
-- ═══════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgjwt SCHEMA extensions;

-- Tornar extensões acessíveis
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════
-- 4. O schema da aplicação (supabase/schema.sql) será
--    carregado pelo volume mount separadamente.
--    Este arquivo prepara apenas a infraestrutura base.
-- ═══════════════════════════════════════════════════════

-- Nota: O arquivo supabase/schema.sql deve ser montado
-- como um segundo init script ou executado manualmente:
--   docker exec -i cosmosec-db-1 psql -U postgres < supabase/schema.sql
