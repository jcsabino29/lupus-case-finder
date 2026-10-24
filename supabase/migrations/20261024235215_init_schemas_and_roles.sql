-- =============================================================================
-- Lupus Case Finder: baseline schemas, extensions and least-privilege roles
-- =============================================================================
-- Stage 0 creates structure only: no tables, no data.
--
--   protected  identifiable (synthetic) patient records. Admin + ingest only.
--   research   de-identified records, embeddings, search indexes.
--
-- Roles are NOLOGIN group roles. In stage 1 a dedicated LOGIN role for the web
-- app is granted membership and switches with `SET LOCAL ROLE` per transaction
-- based on the signed-in user's role. Nothing in the app ever connects as the
-- database owner (postgres), which is reserved for migrations.
--
-- This migration is idempotent so it can be re-applied safely.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create schema if not exists extensions;
create extension if not exists vector with schema extensions;

-- -----------------------------------------------------------------------------
-- Schemas
-- -----------------------------------------------------------------------------
create schema if not exists protected;
create schema if not exists research;

comment on schema protected is
  'Identifiable (synthetic) patient records. Never exposed via the Data API. Admin and ingest_worker only.';
comment on schema research is
  'De-identified records, embeddings and search indexes. Readable by researchers. Never exposed via the Data API.';

-- Nobody gets anything by default. PUBLIC is every role, including Supabase's
-- anon/authenticated API roles.
revoke all on schema protected from public;
revoke all on schema research from public;

-- Belt and braces for Supabase's built-in API roles, if present.
do $$
declare
  api_role text;
begin
  foreach api_role in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = api_role) then
      execute format('revoke all on schema protected from %I', api_role);
      execute format('revoke all on schema research from %I', api_role);
    end if;
  end loop;
end
$$;

-- Objects created later in these schemas start with no privileges for PUBLIC.
-- Explicit, reviewed GRANTs in later migrations are the only way in.
alter default privileges in schema protected revoke all on tables from public;
alter default privileges in schema protected revoke all on sequences from public;
alter default privileges in schema protected revoke all on functions from public;
alter default privileges in schema research revoke all on tables from public;
alter default privileges in schema research revoke all on sequences from public;
alter default privileges in schema research revoke all on functions from public;

-- -----------------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------------
do $$
declare
  r text;
begin
  foreach r in array array['app_researcher', 'app_admin', 'ingest_worker'] loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format(
        'create role %I nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls',
        r
      );
    else
      -- Re-assert attributes in case they drifted.
      execute format(
        'alter role %I nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls',
        r
      );
    end if;
  end loop;
end
$$;

comment on role app_researcher is 'Researcher requests: research schema only (read).';
comment on role app_admin is 'Admin pages: both schemas; every protected read is audit-logged (stage 1).';
comment on role ingest_worker is 'Python batch worker: writes protected, runs de-identification into research.';

-- These roles must never create objects anywhere, including public.
revoke create on schema public from app_researcher, app_admin, ingest_worker;
revoke all on database postgres from app_researcher, app_admin, ingest_worker;

-- Schema USAGE only. Table-level SELECT/INSERT/UPDATE grants and row-level
-- security policies are added per table in stage 1.
grant usage on schema research to app_researcher, app_admin, ingest_worker;
grant usage on schema protected to app_admin, ingest_worker;
revoke all on schema protected from app_researcher;

-- pgvector types and operators live in the extensions schema.
grant usage on schema extensions to app_researcher, app_admin, ingest_worker;

-- Predictable name resolution; no implicit access to public.
alter role app_researcher set search_path = research, extensions;
alter role app_admin set search_path = research, protected, extensions;
alter role ingest_worker set search_path = protected, research, extensions;

-- Conservative limits so a runaway query can't hold the database.
alter role app_researcher set statement_timeout = '15s';
alter role app_admin set statement_timeout = '15s';
alter role ingest_worker set statement_timeout = '5min';
alter role app_researcher set idle_in_transaction_session_timeout = '30s';
alter role app_admin set idle_in_transaction_session_timeout = '30s';
