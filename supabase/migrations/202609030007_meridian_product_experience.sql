-- Meridian Paid Beta Push 1. Additive to migrations 001-006.
-- Retry-safe CLIENT workspace provisioning and confirmable Product Understanding.

alter table public.product_profiles
  add column if not exists understanding_summary text,
  add column if not exists likely_audiences text[] not null default '{}',
  add column if not exists understanding_status text not null default 'DRAFT',
  add column if not exists understanding_mode text not null default 'USER_INPUT_FALLBACK',
  add column if not exists understanding_confirmed_at timestamptz,
  add column if not exists supplier_terms_zh text[] not null default '{}';

alter table public.product_profiles drop constraint if exists product_profiles_understanding_status_check;
alter table public.product_profiles add constraint product_profiles_understanding_status_check
  check (understanding_status in ('DRAFT','CONFIRMED','EDITED'));

alter table public.product_profiles drop constraint if exists product_profiles_understanding_mode_check;
alter table public.product_profiles add constraint product_profiles_understanding_mode_check
  check (understanding_mode in ('WEBSITE_RETRIEVAL','USER_INPUT_FALLBACK','USER_EDITED'));

create or replace function public.provision_client_workspace(workspace_name text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_role public.app_role;
  existing_organization uuid;
  new_organization uuid;
  actor_email text;
  safe_name text;
  safe_slug text;
begin
  if actor is null then
    raise exception 'Authentication is required.';
  end if;

  perform pg_advisory_xact_lock(hashtext(actor::text));

  select role into actor_role from public.profiles where id = actor;
  if actor_role is distinct from 'CLIENT'::public.app_role then
    raise exception 'Only CLIENT accounts may provision a client workspace.';
  end if;

  select organization_id into existing_organization
  from public.organization_members
  where user_id = actor
  order by created_at
  limit 1;

  if existing_organization is not null then
    return existing_organization;
  end if;

  select email into actor_email from auth.users where id = actor;
  safe_name := nullif(trim(workspace_name), '');
  if safe_name is null then
    safe_name := coalesce(nullif(split_part(actor_email, '@', 1), ''), 'Meridian') || '''s workspace';
  end if;
  safe_name := left(safe_name, 160);
  safe_slug := trim(both '-' from regexp_replace(lower(safe_name), '[^a-z0-9]+', '-', 'g'));
  if safe_slug = '' then safe_slug := 'meridian-client'; end if;
  safe_slug := left(safe_slug, 48) || '-' || left(replace(actor::text, '-', ''), 10);

  insert into public.organizations(name, slug)
  values (safe_name, safe_slug)
  returning id into new_organization;

  insert into public.organization_members(organization_id, user_id, title)
  values (new_organization, actor, 'Owner')
  on conflict (organization_id, user_id) do nothing;

  return new_organization;
end;
$$;

revoke all on function public.provision_client_workspace(text) from public, anon;
grant execute on function public.provision_client_workspace(text) to authenticated;

-- A qualifying discovery result can enter the owning client's pipeline without
-- an admin publication gate. The source remains explicitly unverified.
alter table public.partners
  add column if not exists origin_search_result_id uuid references public.search_results(id) on delete set null;
create unique index if not exists partners_origin_search_result_unique
  on public.partners(origin_search_result_id) where origin_search_result_id is not null;

create or replace function public.add_search_finding_to_pipeline(target_result uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target_org uuid;
  result_record record;
  existing_partner uuid;
  new_partner uuid;
  mapped_type text;
  opportunity_score integer;
  evidence_confidence integer;
  assessment_label text;
  assessment_breakdown jsonb;
begin
  if actor is null then raise exception 'Authentication is required.'; end if;
  select organization_id into target_org from public.organization_members where user_id=actor limit 1;
  if target_org is null then raise exception 'No client workspace found.'; end if;

  select r.*,q.intent into result_record
  from public.search_results r join public.query_plans q on q.id=r.query_plan_id
  where r.id=target_result and r.organization_id=target_org
    and r.eligible_for_client=true and r.search_quality_score>=60
    and q.intent in ('DISCOVER_DISTRIBUTORS','DISCOVER_CUSTOMERS','DISCOVER_PARTNERS','DISCOVER_SUPPLIERS');
  if not found then raise exception 'This result is not a qualifying pipeline opportunity.'; end if;

  select id into existing_partner from public.partners where origin_search_result_id=target_result;
  if existing_partner is not null then return existing_partner; end if;
  mapped_type := case result_record.intent
    when 'DISCOVER_DISTRIBUTORS' then 'Distributor'
    when 'DISCOVER_CUSTOMERS' then 'Customer'
    when 'DISCOVER_SUPPLIERS' then 'Supplier'
    else 'Strategic Partner' end;
  assessment_breakdown := jsonb_build_object(
    'productMarketFit',coalesce((result_record.score_breakdown->>'intentRelevance')::numeric,50),
    'customerChannelFit',coalesce((result_record.score_breakdown->>'specificity')::numeric,50),
    'partnershipOpenness',coalesce((result_record.score_breakdown->>'actionability')::numeric,40),
    'incumbentFriction',50,
    'legitimacy',coalesce((result_record.score_breakdown->>'sourceCredibility')::numeric,40),
    'commercialActivity',coalesce((result_record.score_breakdown->>'freshness')::numeric,40),
    'contactability',coalesce((result_record.score_breakdown->>'evidenceTraceability')::numeric,40),
    'evidenceCoverage',coalesce((result_record.score_breakdown->>'evidenceTraceability')::numeric,40)
  );
  opportunity_score := round(
    (assessment_breakdown->>'productMarketFit')::numeric*.20+
    (assessment_breakdown->>'customerChannelFit')::numeric*.15+
    (assessment_breakdown->>'partnershipOpenness')::numeric*.10+
    (assessment_breakdown->>'incumbentFriction')::numeric*.10+
    (assessment_breakdown->>'legitimacy')::numeric*.15+
    (assessment_breakdown->>'commercialActivity')::numeric*.10+
    (assessment_breakdown->>'contactability')::numeric*.10+
    (assessment_breakdown->>'evidenceCoverage')::numeric*.10
  );
  evidence_confidence := least(60,round(
    coalesce((result_record.score_breakdown->>'sourceCredibility')::numeric,40)*.28+5+
    coalesce((result_record.score_breakdown->>'evidenceTraceability')::numeric,40)*.15+
    coalesce((result_record.score_breakdown->>'freshness')::numeric,40)*.10+
    coalesce((result_record.score_breakdown->>'specificity')::numeric,40)*.10
  ));
  assessment_label := case when opportunity_score>=80 then 'STRONG_FIT' when opportunity_score>=60 then 'POSSIBLE_FIT' else 'WEAK_FIT' end;

  insert into public.partners(organization_id,product_id,company_name,partner_type,website,description,fit_score,status,source,verification_status,origin_search_result_id,created_by)
  values(target_org,result_record.product_id,left(result_record.title,240),mapped_type,result_record.url,result_record.snippet,opportunity_score,'QUALIFIED',result_record.url,'NOT_REQUESTED',target_result,actor)
  on conflict (origin_search_result_id) where origin_search_result_id is not null do nothing
  returning id into new_partner;
  if new_partner is null then select id into new_partner from public.partners where origin_search_result_id=target_result; end if;
  insert into public.opportunity_fit_assessments(organization_id,product_id,opportunity_id,overall_assessment,dimensions,why_it_matters,concerns,unknowns,recommended_next_action,confidence,opportunity_score,evidence_confidence_score,score_breakdown,interpretation,last_interpreted_at)
  values(target_org,result_record.product_id,new_partner,assessment_label,assessment_breakdown,array['This source matched the product and commercial intent strongly enough to investigate.'],array['This is an automatically generated, unverified source finding.'],array['Current portfolio, commercial role and decision-maker details remain unverified.'],'Review the original source and verify current commercial fit before outreach.','LOW',opportunity_score,evidence_confidence,assessment_breakdown,jsonb_build_object('whatWeFound',result_record.title,'sourceUrl',result_record.url,'provider','DETERMINISTIC'),now())
  on conflict (product_id,opportunity_id) do nothing;
  return new_partner;
end;
$$;
revoke all on function public.add_search_finding_to_pipeline(uuid) from public, anon;
grant execute on function public.add_search_finding_to_pipeline(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='product_profiles' and c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on public.product_profiles';
  end if;
end $$;
