-- Meridian acquisition funnel: free snapshots, private sharing, trials and retention foundations.

alter table public.analysis_requests
  alter column company_website drop not null,
  add column if not exists additional_context text,
  add column if not exists target_buyer_custom text,
  add column if not exists source_snapshot jsonb,
  add column if not exists share_token_hash text,
  add column if not exists share_token_expires_at timestamptz,
  add column if not exists generated_at timestamptz,
  add column if not exists ai_model text,
  add column if not exists generation_error text,
  add column if not exists request_fingerprint text,
  add column if not exists claimed_by uuid references auth.users(id) on delete set null,
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create unique index if not exists analysis_requests_share_token_idx
  on public.analysis_requests(share_token_hash)
  where share_token_hash is not null;
create index if not exists analysis_requests_created_idx
  on public.analysis_requests(created_at desc);
create index if not exists analysis_requests_rate_limit_idx
  on public.analysis_requests(request_fingerprint, created_at desc)
  where request_fingerprint is not null;

drop trigger if exists analysis_requests_updated_at on public.analysis_requests;
create trigger analysis_requests_updated_at
before update on public.analysis_requests
for each row execute function public.set_updated_at();

alter table public.organizations
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists source_analysis_id uuid references public.analysis_requests(id) on delete set null;

alter table public.partners
  add column if not exists description text,
  add column if not exists products jsonb not null default '[]'::jsonb,
  add column if not exists brands jsonb not null default '[]'::jsonb,
  add column if not exists market_segment text,
  add column if not exists fit_score integer check (fit_score is null or fit_score between 0 and 100),
  add column if not exists fit_explanation jsonb,
  add column if not exists sources jsonb not null default '[]'::jsonb,
  add column if not exists next_action text,
  add column if not exists verification_status text not null default 'NOT_REQUESTED'
    check (verification_status in ('NOT_REQUESTED','REQUESTED','IN_PROGRESS','VERIFIED','LIMITED','FAILED'));

create table if not exists public.digest_subscriptions (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  enabled boolean not null default true,
  frequency text not null default 'WEEKLY' check (frequency in ('WEEKLY')),
  last_digest_at timestamptz,
  next_digest_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.digest_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  summary jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','READY','SENT','FAILED')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists digest_runs_org_idx on public.digest_runs(organization_id, period_end desc);

drop trigger if exists digest_subscriptions_updated_at on public.digest_subscriptions;
create trigger digest_subscriptions_updated_at
before update on public.digest_subscriptions
for each row execute function public.set_updated_at();

alter table public.digest_subscriptions enable row level security;
alter table public.digest_runs enable row level security;
revoke all on public.digest_subscriptions, public.digest_runs from anon, authenticated;
grant select on public.digest_subscriptions, public.digest_runs to authenticated;

create policy digest_subscriptions_select on public.digest_subscriptions for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy digest_subscriptions_admin_all on public.digest_subscriptions for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy digest_runs_select on public.digest_runs for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy digest_runs_admin_all on public.digest_runs for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

-- Refresh the client opportunity guard for the expanded commercial object.
create or replace function private.guard_client_partner_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin() then return new; end if;
  if new.organization_id is distinct from old.organization_id
    or new.company_name is distinct from old.company_name
    or new.chinese_name is distinct from old.chinese_name
    or new.partner_type is distinct from old.partner_type
    or new.location is distinct from old.location
    or new.website is distinct from old.website
    or new.description is distinct from old.description
    or new.products is distinct from old.products
    or new.brands is distinct from old.brands
    or new.market_segment is distinct from old.market_segment
    or new.fit_score is distinct from old.fit_score
    or new.fit_explanation is distinct from old.fit_explanation
    or new.sources is distinct from old.sources
    or new.verification_status is distinct from old.verification_status
    or new.english_ability is distinct from old.english_ability
    or new.interest_level is distinct from old.interest_level
    or new.source is distinct from old.source
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
    or new.ai_assessment is distinct from old.ai_assessment
    or new.ai_assessment_updated_at is distinct from old.ai_assessment_updated_at
  then
    raise exception 'Client members may only update opportunity workflow and contact fields.';
  end if;
  return new;
end;
$$;
