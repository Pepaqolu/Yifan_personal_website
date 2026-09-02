-- Meridian public analysis intake and opportunity workflow extensions.
-- Internal China Desk table names remain unchanged to minimize migration risk.

create table if not exists public.analysis_requests (
  id uuid primary key default gen_random_uuid(),
  company_website text not null,
  company_name text,
  goals text[] not null default '{}',
  product_description text not null,
  industry text not null,
  target_audiences text[] not null default '{}',
  china_status text not null,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','PREPARING','READY','ARCHIVED')),
  analysis_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analysis_requests enable row level security;
revoke all on public.analysis_requests from anon, authenticated;

alter type public.partner_status add value if not exists 'REPLIED';
alter type public.partner_status add value if not exists 'NEGOTIATING';

create table if not exists public.opportunity_interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('EMAIL','WECHAT','CALL','REPLY','NOTE','REMINDER')),
  content text not null,
  follow_up_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists opportunity_interactions_partner_idx on public.opportunity_interactions(partner_id, created_at desc);
alter table public.opportunity_interactions enable row level security;
grant select, insert on public.opportunity_interactions to authenticated;

create policy opportunity_interactions_select on public.opportunity_interactions for select to authenticated
using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));

create policy opportunity_interactions_insert on public.opportunity_interactions for insert to authenticated
with check (organization_id in (select private.user_organization_ids()) and created_by = (select auth.uid()));

create policy partners_client_update on public.partners for update to authenticated
using (organization_id in (select private.user_organization_ids()))
with check (organization_id in (select private.user_organization_ids()));

-- Client members may manage pipeline and contact details, but cannot rewrite the
-- underlying opportunity record or its Meridian assessment. Admins retain the
-- existing full-management path.
create or replace function private.guard_client_partner_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin() then
    return new;
  end if;

  if new.organization_id is distinct from old.organization_id
    or new.company_name is distinct from old.company_name
    or new.chinese_name is distinct from old.chinese_name
    or new.partner_type is distinct from old.partner_type
    or new.location is distinct from old.location
    or new.website is distinct from old.website
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

drop trigger if exists partners_client_update_guard on public.partners;
create trigger partners_client_update_guard
before update on public.partners
for each row execute function private.guard_client_partner_update();
