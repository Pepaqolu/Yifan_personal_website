-- Meridian Intelligence Experience. Additive to migrations 001-005.
-- Universal product profiles, explainable scoring, progress, feedback and governed learning.

alter table public.product_profiles
  alter column industry set default 'UNIVERSAL',
  add column if not exists objectives text[] not null default '{}',
  add column if not exists additional_context text,
  add column if not exists industry_overlay text not null default 'UNIVERSAL';

alter table public.product_profiles drop constraint if exists product_profiles_industry_overlay_check;
alter table public.product_profiles add constraint product_profiles_industry_overlay_check
  check (industry_overlay in ('UNIVERSAL','MEDTECH','CONSUMER','INDUSTRIAL','TECHNOLOGY'));

alter table public.query_plans drop constraint if exists query_plans_intent_check;
alter table public.query_plans add constraint query_plans_intent_check check (intent in (
  'FIND_REGULATION','FIND_REGULATORY_CLASSIFICATION','FIND_STANDARDS','DISCOVER_COMPETITORS',
  'DISCOVER_DISTRIBUTORS','DISCOVER_CUSTOMERS','DISCOVER_PARTNERS','DISCOVER_SUPPLIERS',
  'FIND_PRICING','FIND_TENDERS','FIND_COMPANY_ACTIVITY','FIND_MARKET_SIGNALS'
));

alter table public.search_results
  add column if not exists search_quality_score smallint check (search_quality_score between 0 and 100),
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists eligible_for_client boolean not null default false,
  add column if not exists duplicate_group_key text,
  add column if not exists independent_source_key text;

alter table public.evidence
  add column if not exists confidence_score smallint check (confidence_score between 0 and 100),
  add column if not exists source_credibility_score smallint check (source_credibility_score between 0 and 100),
  add column if not exists independent_source_key text;

alter table public.evidence drop constraint if exists evidence_verification_status_check;
alter table public.evidence add constraint evidence_verification_status_check check
  (verification_status in ('UNVERIFIED','SOURCE_CONFIRMED','CROSS_CONFIRMED','HUMAN_VERIFIED','CLIENT_CONFIRMED','STALE'));

alter table public.opportunity_fit_assessments
  add column if not exists opportunity_score smallint check (opportunity_score between 0 and 100),
  add column if not exists evidence_confidence_score smallint check (evidence_confidence_score between 0 and 100),
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists interpretation jsonb not null default '{}'::jsonb,
  add column if not exists last_interpreted_at timestamptz;

alter table public.regulatory_matches
  add column if not exists applicability_score smallint check (applicability_score between 0 and 100),
  add column if not exists evidence_confidence_score smallint check (evidence_confidence_score between 0 and 100),
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb;

alter table public.partners
  add column if not exists partnership_openness text not null default 'UNKNOWN',
  add column if not exists factory_verification_confidence smallint check (factory_verification_confidence between 0 and 100),
  add column if not exists contact_evidence jsonb not null default '[]'::jsonb,
  add column if not exists independent_source_count integer not null default 0 check (independent_source_count >= 0),
  add column if not exists raw_source_count integer not null default 0 check (raw_source_count >= 0);
alter table public.partners drop constraint if exists partners_partnership_openness_check;
alter table public.partners add constraint partners_partnership_openness_check
  check (partnership_openness in ('UNKNOWN','OPEN','CONSTRAINED','LOCKED'));

create table if not exists public.analysis_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.product_profiles(id) on delete cascade,
  search_run_id uuid references public.search_runs(id) on delete set null,
  workflow_type text not null default 'PRODUCT_INTELLIGENCE',
  stage text not null check (stage in ('PRODUCT_PROFILE','QUERY_PLANNING','SEARCHING','FETCHING','EVIDENCE_REVIEW','SCORING','INTERPRETING','COMPLETE','FAILED')),
  status text not null default 'RUNNING' check (status in ('QUEUED','RUNNING','COMPLETE','FAILED')),
  completed_stages text[] not null default '{}',
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists analysis_progress_org_idx on public.analysis_progress(organization_id, updated_at desc);

create table if not exists public.conflict_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.product_profiles(id) on delete cascade,
  opportunity_id uuid references public.partners(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  conflict_type text not null,
  competing_claims jsonb not null default '[]'::jsonb,
  stronger_evidence_summary text,
  relevance_score smallint check (relevance_score between 0 and 100),
  confidence_score smallint check (confidence_score between 0 and 100),
  suggested_action text,
  status text not null default 'OPEN' check (status in ('OPEN','CLIENT_RESOLVED','ADMIN_RESOLVED')),
  resolution text,
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conflict_records_org_idx on public.conflict_records(organization_id, created_at desc);

create table if not exists public.feedback_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.product_profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  feedback_type text not null check (feedback_type in ('USEFUL','NOT_RELEVANT','ALREADY_KNEW','CONTACT_INCORRECT','SCORE_TOO_HIGH','SCORE_TOO_LOW','CLAIM_CONFIRMED','CLAIM_DISPUTED')),
  detail text,
  proposed_score smallint check (proposed_score between 0 and 100),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists feedback_events_org_idx on public.feedback_events(organization_id, created_at desc);

create table if not exists public.learning_candidates (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  category text not null,
  proposed_rule jsonb not null,
  evidence_count integer not null default 0 check (evidence_count >= 0),
  organization_count integer not null default 0 check (organization_count >= 0),
  examples jsonb not null default '[]'::jsonb,
  expected_impact text,
  scope text not null default 'GLOBAL' check (scope in ('GLOBAL','INDUSTRY_OVERLAY')),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analysis_progress enable row level security;
alter table public.conflict_records enable row level security;
alter table public.feedback_events enable row level security;
alter table public.learning_candidates enable row level security;
revoke all on public.analysis_progress, public.conflict_records, public.feedback_events, public.learning_candidates from anon, authenticated;
grant select, insert, update on public.analysis_progress to authenticated;
grant select on public.conflict_records to authenticated;
grant select, insert on public.feedback_events to authenticated;
grant select, insert, update on public.learning_candidates to authenticated;

create policy analysis_progress_org_select on public.analysis_progress for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy analysis_progress_org_insert on public.analysis_progress for insert to authenticated
with check ((select private.is_admin()) or (organization_id in (select private.user_organization_ids()) and created_by=(select auth.uid())));
create policy analysis_progress_org_update on public.analysis_progress for update to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()))
with check ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy conflict_records_org_select on public.conflict_records for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy conflict_records_admin_all on public.conflict_records for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy feedback_events_org_select on public.feedback_events for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy feedback_events_org_insert on public.feedback_events for insert to authenticated
with check (organization_id in (select private.user_organization_ids()) and created_by=(select auth.uid()));
create policy learning_candidates_admin_all on public.learning_candidates for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create trigger analysis_progress_updated_at before update on public.analysis_progress for each row execute function public.set_updated_at();
create trigger conflict_records_updated_at before update on public.conflict_records for each row execute function public.set_updated_at();
create trigger learning_candidates_updated_at before update on public.learning_candidates for each row execute function public.set_updated_at();

alter table public.retrieval_logs drop constraint if exists retrieval_logs_event_type_check;
alter table public.retrieval_logs add constraint retrieval_logs_event_type_check check (event_type in (
  'QUERY_GENERATED','SOURCE_SEARCHED','SEARCH_STARTED','SEARCH_COMPLETED','SEARCH_FAILED','RESULT_REJECTED',
  'URL_RETRIEVED','RETRIEVAL_FAILED','EVIDENCE_EXTRACTED','REGULATORY_MATCH_CREATED','OPPORTUNITY_CREATED',
  'ASSESSMENT_GENERATED','SCORE_CALCULATED','INTERPRETATION_CREATED','FEEDBACK_RECORDED','LEARNING_CANDIDATE_CREATED'
));

do $$
declare table_name text;
begin
  foreach table_name in array array['analysis_progress','conflict_records','feedback_events','learning_candidates'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=table_name and c.relrowsecurity)
      then raise exception 'RLS is not enabled on public.%', table_name; end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=table_name)
      then raise exception 'No RLS policy exists on public.%', table_name; end if;
  end loop;
end $$;
