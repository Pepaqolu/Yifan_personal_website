-- Meridian Search Runner V1. Additive to migration 004.

create table if not exists public.search_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.product_profiles(id) on delete cascade,
  query_plan_id uuid not null references public.query_plans(id) on delete cascade,
  provider text not null,
  query text not null,
  status text not null default 'RUNNING' check (status in ('RUNNING','COMPLETE','FAILED','NOT_CONFIGURED')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  result_count integer not null default 0 check (result_count >= 0),
  official_source_count integer not null default 0 check (official_source_count >= 0),
  fetch_count integer not null default 0 check (fetch_count >= 0),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  failure_count integer not null default 0 check (failure_count >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_type text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists search_runs_plan_idx on public.search_runs(query_plan_id, started_at desc);
create index if not exists search_runs_org_idx on public.search_runs(organization_id, started_at desc);

create table if not exists public.search_results (
  id uuid primary key default gen_random_uuid(),
  search_run_id uuid not null references public.search_runs(id) on delete cascade,
  query_plan_id uuid not null references public.query_plans(id) on delete cascade,
  product_id uuid not null references public.product_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_id uuid references public.source_registry(id) on delete set null,
  title text not null,
  url text not null,
  domain text not null,
  snippet text,
  source_type text not null check (source_type in ('AUTHORITATIVE','COMMERCIAL','MARKET')),
  source_authority text not null check (source_authority in ('PRIMARY','HIGH','MEDIUM','LOW')),
  provider text not null,
  provider_rank integer not null check (provider_rank > 0),
  meridian_rank integer not null check (meridian_rank > 0),
  meridian_score integer not null check (meridian_score between 0 and 100),
  ranking_reasons jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  discovered_at timestamptz not null default now(),
  fetched_at timestamptz,
  extracted_title text,
  extracted_text text,
  suggested_fact text,
  status text not null default 'DISCOVERED' check (status in ('DISCOVERED','REVIEWED','REJECTED','FETCHED','EVIDENCE_CREATED')),
  fetch_error text,
  metadata jsonb not null default '{}'::jsonb,
  unique (query_plan_id, url)
);
create index if not exists search_results_plan_idx on public.search_results(query_plan_id, meridian_rank);
create index if not exists search_results_product_idx on public.search_results(product_id, discovered_at desc);

create table if not exists public.search_provider_checks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  configured boolean not null,
  healthy boolean not null,
  query text,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  result_count integer check (result_count is null or result_count >= 0),
  error_message text,
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz not null default now()
);
create index if not exists search_provider_checks_checked_idx on public.search_provider_checks(checked_at desc);

alter table public.evidence
  add column if not exists query_plan_id uuid references public.query_plans(id) on delete set null,
  add column if not exists search_result_id uuid references public.search_results(id) on delete set null;

alter table public.source_registry
  add column if not exists last_successful_retrieval_at timestamptz,
  add column if not exists last_failure_at timestamptz,
  add column if not exists failure_count integer not null default 0 check (failure_count >= 0),
  add column if not exists last_error text;

alter table public.search_runs enable row level security;
alter table public.search_results enable row level security;
alter table public.search_provider_checks enable row level security;
revoke all on public.search_runs, public.search_results, public.search_provider_checks from anon, authenticated;
grant select on public.search_runs, public.search_results to authenticated;
grant select on public.search_provider_checks to authenticated;

create policy search_runs_select on public.search_runs for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy search_results_select on public.search_results for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy search_provider_checks_admin_select on public.search_provider_checks for select to authenticated
using ((select private.is_admin()));

create policy search_runs_admin_all on public.search_runs for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy search_results_admin_all on public.search_results for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy search_provider_checks_admin_all on public.search_provider_checks for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

-- Extend retrieval diagnostics without weakening the existing policies.
alter table public.retrieval_logs drop constraint if exists retrieval_logs_event_type_check;
alter table public.retrieval_logs add constraint retrieval_logs_event_type_check check (event_type in (
  'QUERY_GENERATED','SOURCE_SEARCHED','SEARCH_STARTED','SEARCH_COMPLETED','SEARCH_FAILED',
  'RESULT_REJECTED','URL_RETRIEVED','RETRIEVAL_FAILED','EVIDENCE_EXTRACTED',
  'REGULATORY_MATCH_CREATED','OPPORTUNITY_CREATED','ASSESSMENT_GENERATED'
));

do $$
declare table_name text;
begin
  foreach table_name in array array['search_runs','search_results','search_provider_checks']
  loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name and c.relrowsecurity
    ) then raise exception 'RLS is not enabled on public.%', table_name; end if;
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = table_name
    ) then raise exception 'No RLS policy exists on public.%', table_name; end if;
  end loop;
end $$;

