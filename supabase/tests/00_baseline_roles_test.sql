-- pgTAP tests for the stage 0 security baseline. Run with: supabase test db
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(19);

-- Schemas and extensions
select has_schema('protected');
select has_schema('research');
select has_extension('vector');

-- Roles exist and are locked down
select has_role('app_researcher');
select has_role('app_admin');
select has_role('ingest_worker');

select is(
  (select count(*)::int from pg_roles
    where rolname in ('app_researcher', 'app_admin', 'ingest_worker')
      and (rolcanlogin or rolsuper or rolcreaterole or rolcreatedb or rolbypassrls or rolreplication)),
  0,
  'app roles have no login, superuser, createrole, createdb, bypassrls or replication'
);

-- Researchers can't reach identifiable data
select ok(has_schema_privilege('app_researcher', 'research', 'usage'), 'researcher can use research');
select ok(not has_schema_privilege('app_researcher', 'protected', 'usage'), 'researcher cannot use protected');
select ok(not has_schema_privilege('app_researcher', 'research', 'create'), 'researcher cannot create in research');

-- Admin and worker
select ok(has_schema_privilege('app_admin', 'protected', 'usage'), 'admin can use protected');
select ok(has_schema_privilege('ingest_worker', 'protected', 'usage'), 'worker can use protected');
select ok(not has_schema_privilege('app_admin', 'protected', 'create'), 'admin cannot create in protected');
select ok(not has_schema_privilege('ingest_worker', 'public', 'create'), 'worker cannot create in public');

-- Supabase API roles see neither schema
select ok(not has_schema_privilege('anon', 'protected', 'usage'), 'anon cannot use protected');
select ok(not has_schema_privilege('anon', 'research', 'usage'), 'anon cannot use research');
select ok(not has_schema_privilege('authenticated', 'protected', 'usage'), 'authenticated cannot use protected');
select ok(not has_schema_privilege('authenticated', 'research', 'usage'), 'authenticated cannot use research');
select ok(not has_schema_privilege('service_role', 'protected', 'usage'), 'service_role cannot use protected');

select * from finish();
rollback;
