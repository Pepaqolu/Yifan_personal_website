-- Meridian medtech intelligence: product memory, query plans, evidence,
-- regulatory matching, explainable opportunity assessment and diagnostics.

create table if not exists public.product_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text,
  company_url text,
  product_name text not null,
  product_description text,
  industry text not null default 'MEDTECH',
  subindustry text,
  intended_use text,
  clinical_use text,
  target_customer text,
  target_department text,
  target_market_segment text,
  business_goal text,
  target_geography text not null default 'China',
  price_positioning text,
  existing_markets text[] not null default '{}',
  existing_certifications text[] not null default '{}',
  china_status text,
  keywords_en text[] not null default '{}',
  keywords_zh text[] not null default '{}',
  synonyms_zh text[] not null default '{}',
  formal_terms_zh text[] not null default '{}',
  procurement_terms_zh text[] not null default '{}',
  distributor_terms_zh text[] not null default '{}',
  supplier_terms_zh text[] not null default '{}',
  regulatory_terms_zh text[] not null default '{}',
  related_categories text[] not null default '{}',
  regulatory_notes text,
  terminology_status text not null default 'AI_GENERATED'
    check (terminology_status in ('AI_GENERATED','USER_CONFIRMED','ADMIN_CONFIRMED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_profiles_org_idx on public.product_profiles(organization_id, updated_at desc);

create table if not exists public.source_registry (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  domain text not null,
  source_type text not null check (source_type in ('AUTHORITATIVE','COMMERCIAL','MARKET')),
  language text not null default 'zh-CN',
  authority_level text not null default 'MEDIUM' check (authority_level in ('PRIMARY','HIGH','MEDIUM','LOW')),
  regulatory_authority boolean not null default false,
  commercial_signal_strength text not null default 'MEDIUM' check (commercial_signal_strength in ('HIGH','MEDIUM','LOW','NONE')),
  access_method text not null default 'WEB_PAGE' check (access_method in ('WEB_PAGE','SEARCH_RESULT','MANUAL','API')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','LIMITED','PLANNED','MANUAL','DISABLED')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, domain)
);

create table if not exists public.query_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.product_profiles(id) on delete cascade,
  intent text not null check (intent in ('FIND_REGULATION','FIND_REGULATORY_CLASSIFICATION','FIND_STANDARDS','DISCOVER_COMPETITORS','DISCOVER_DISTRIBUTORS','FIND_TENDERS','FIND_COMPANY_ACTIVITY','FIND_MARKET_SIGNALS')),
  query text not null,
  query_language text not null default 'zh-CN',
  preferred_source_types text[] not null default '{}',
  geography text,
  product_terms text[] not null default '{}',
  rationale text not null,
  priority smallint not null default 3 check (priority between 1 and 5),
  status text not null default 'PLANNED' check (status in ('PLANNED','RUNNING','COMPLETE','FAILED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists query_plans_product_idx on public.query_plans(product_id, priority, created_at desc);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.product_profiles(id) on delete cascade,
  opportunity_id uuid references public.partners(id) on delete set null,
  source_id uuid references public.source_registry(id) on delete set null,
  source_url text not null,
  source_title text not null,
  source_type text not null check (source_type in ('AUTHORITATIVE','COMMERCIAL','MARKET')),
  retrieved_at timestamptz not null default now(),
  published_at timestamptz,
  last_verified_at timestamptz,
  stale_after timestamptz,
  language text not null default 'zh-CN',
  extracted_fact text not null,
  fact_type text not null,
  confidence text not null default 'LOW' check (confidence in ('HIGH','MEDIUM','LOW')),
  verification_status text not null default 'UNVERIFIED' check (verification_status in ('UNVERIFIED','SOURCE_CONFIRMED','CROSS_CONFIRMED','HUMAN_VERIFIED','STALE')),
  regulatory_relevance text,
  commercial_relevance text,
  authority_score smallint check (authority_score between 0 and 100),
  relevance_score smallint check (relevance_score between 0 and 100),
  recency_score smallint check (recency_score between 0 and 100),
  specificity_score smallint check (specificity_score between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists evidence_product_idx on public.evidence(product_id, retrieved_at desc);
create index if not exists evidence_opportunity_idx on public.evidence(opportunity_id, retrieved_at desc) where opportunity_id is not null;

create table if not exists public.regulatory_matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.product_profiles(id) on delete cascade,
  jurisdiction text not null default 'CN',
  authority text not null,
  document_name text not null,
  document_number text,
  document_type text not null,
  source_url text,
  effective_date date,
  status text not null default 'UNCERTAIN' check (status in ('LIKELY','POSSIBLE','UNCERTAIN','NEEDS_EXPERT_REVIEW')),
  applicability text not null,
  applicability_reason text not null,
  confidence text not null default 'LOW' check (confidence in ('HIGH','MEDIUM','LOW')),
  requirements_summary text,
  questions_to_validate text[] not null default '{}',
  evidence_ids uuid[] not null default '{}',
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists regulatory_matches_product_idx on public.regulatory_matches(product_id, last_checked_at desc);

create table if not exists public.opportunity_fit_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.product_profiles(id) on delete cascade,
  opportunity_id uuid not null references public.partners(id) on delete cascade,
  overall_assessment text not null check (overall_assessment in ('VERY_STRONG_FIT','STRONG_FIT','POSSIBLE_FIT','WEAK_FIT','INSUFFICIENT_EVIDENCE')),
  dimensions jsonb not null default '{}'::jsonb,
  why_it_matters text[] not null default '{}',
  concerns text[] not null default '{}',
  unknowns text[] not null default '{}',
  recommended_next_action text,
  confidence text not null default 'LOW' check (confidence in ('HIGH','MEDIUM','LOW')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, opportunity_id)
);

create table if not exists public.intelligence_corrections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.product_profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  field_name text not null,
  previous_value jsonb,
  corrected_value jsonb not null,
  confirmation_status text not null check (confirmation_status in ('USER_CONFIRMED','ADMIN_CONFIRMED')),
  corrected_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.product_profiles(id) on delete cascade,
  query_plan_id uuid references public.query_plans(id) on delete set null,
  event_type text not null check (event_type in ('QUERY_GENERATED','SOURCE_SEARCHED','URL_RETRIEVED','RETRIEVAL_FAILED','EVIDENCE_EXTRACTED','REGULATORY_MATCH_CREATED','OPPORTUNITY_CREATED','ASSESSMENT_GENERATED')),
  source_url text,
  status text not null default 'SUCCESS' check (status in ('SUCCESS','LIMITED','FAILED')),
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists retrieval_logs_org_idx on public.retrieval_logs(organization_id, created_at desc);

alter table public.partners
  add column if not exists product_id uuid references public.product_profiles(id) on delete set null;
alter table public.requests
  add column if not exists opportunity_id uuid references public.partners(id) on delete set null,
  add column if not exists product_id uuid references public.product_profiles(id) on delete set null;

do $$
declare table_name text;
begin
  foreach table_name in array array['product_profiles','source_registry','query_plans','evidence','regulatory_matches','opportunity_fit_assessments','intelligence_corrections','retrieval_logs']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
  end loop;
end $$;

grant insert, update on public.product_profiles, public.query_plans, public.intelligence_corrections to authenticated;
grant insert on public.retrieval_logs to authenticated;

create policy product_profiles_select on public.product_profiles for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy product_profiles_insert on public.product_profiles for insert to authenticated
with check (organization_id in (select private.user_organization_ids()) and created_by = (select auth.uid()));
create policy product_profiles_update on public.product_profiles for update to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()))
with check ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));

create policy source_registry_select on public.source_registry for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy query_plans_select on public.query_plans for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy query_plans_insert on public.query_plans for insert to authenticated
with check (organization_id in (select private.user_organization_ids()) and created_by = (select auth.uid()));
create policy query_plans_update on public.query_plans for update to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()))
with check ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy evidence_select on public.evidence for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy regulatory_matches_select on public.regulatory_matches for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy fit_assessments_select on public.opportunity_fit_assessments for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy corrections_select on public.intelligence_corrections for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy corrections_insert on public.intelligence_corrections for insert to authenticated
with check (organization_id in (select private.user_organization_ids()) and corrected_by = (select auth.uid()) and confirmation_status = 'USER_CONFIRMED');
create policy retrieval_logs_select on public.retrieval_logs for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy retrieval_logs_insert on public.retrieval_logs for insert to authenticated
with check (organization_id in (select private.user_organization_ids()));

create policy source_registry_admin_all on public.source_registry for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy evidence_admin_all on public.evidence for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy regulatory_matches_admin_all on public.regulatory_matches for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy fit_assessments_admin_all on public.opportunity_fit_assessments for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy corrections_admin_all on public.intelligence_corrections for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy retrieval_logs_admin_all on public.retrieval_logs for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create trigger product_profiles_updated_at before update on public.product_profiles for each row execute function public.set_updated_at();
create trigger source_registry_updated_at before update on public.source_registry for each row execute function public.set_updated_at();
create trigger query_plans_updated_at before update on public.query_plans for each row execute function public.set_updated_at();
create trigger regulatory_matches_updated_at before update on public.regulatory_matches for each row execute function public.set_updated_at();
create trigger opportunity_fit_assessments_updated_at before update on public.opportunity_fit_assessments for each row execute function public.set_updated_at();

-- Fail the migration if any new intelligence table is accidentally left
-- without RLS or without at least one policy.
do $$
declare table_name text;
begin
  foreach table_name in array array['product_profiles','source_registry','query_plans','evidence','regulatory_matches','opportunity_fit_assessments','intelligence_corrections','retrieval_logs']
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
