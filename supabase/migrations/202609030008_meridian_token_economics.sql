-- Meridian Paid Beta Push 2. Additive to migrations 001-007.
-- Organization Token lots, immutable audit ledger, research jobs, reservations and cost control.

create table if not exists public.token_wallets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.token_lots (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.token_wallets(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('PROMOTIONAL','PURCHASED','ADJUSTMENT')),
  initial_tokens integer not null check (initial_tokens > 0),
  available_tokens integer not null check (available_tokens >= 0),
  reserved_tokens integer not null default 0 check (reserved_tokens >= 0),
  expires_at timestamptz,
  source_type text not null,
  source_reference text,
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id,idempotency_key),
  check (available_tokens + reserved_tokens <= initial_tokens),
  check ((kind='PROMOTIONAL' and expires_at is not null) or kind<>'PROMOTIONAL')
);
create index if not exists token_lots_spend_idx on public.token_lots(organization_id,kind,expires_at,created_at) where available_tokens>0;

create table if not exists public.research_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.product_profiles(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  research_tier text not null check (research_tier in ('QUICK','STANDARD','DEEP','INTENSIVE')),
  token_cost integer not null check (token_cost in (5,15,40,100)),
  retail_equivalent_usd numeric(12,4) not null check (retail_equivalent_usd>=0),
  target_cogs_usd numeric(12,6) not null check (target_cogs_usd>=0),
  warning_cogs_usd numeric(12,6) not null check (warning_cogs_usd>=target_cogs_usd),
  hard_cogs_usd numeric(12,6) not null check (hard_cogs_usd>=warning_cogs_usd),
  accumulated_cogs_usd numeric(12,6) not null default 0 check (accumulated_cogs_usd>=0),
  has_unknown_cost boolean not null default false,
  cost_status text not null default 'HEALTHY' check (cost_status in ('HEALTHY','WARNING','NEAR_LIMIT','LIMIT_REACHED','UNKNOWN_COST')),
  status text not null default 'CREATED' check (status in ('CREATED','RESERVED','RUNNING','COMPLETE','FAILED','REFUNDED','CANCELLED')),
  idempotency_key text not null,
  failure_type text,
  failure_message text,
  search_path_count integer not null default 0 check (search_path_count>=0),
  result_count integer not null default 0 check (result_count>=0),
  qualified_finding_count integer not null default 0 check (qualified_finding_count>=0),
  independent_source_count integer not null default 0 check (independent_source_count>=0),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (organization_id,idempotency_key)
);
create index if not exists research_jobs_org_idx on public.research_jobs(organization_id,created_at desc);

create table if not exists public.token_reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_job_id uuid not null unique references public.research_jobs(id) on delete cascade,
  research_tier text not null check (research_tier in ('QUICK','STANDARD','DEEP','INTENSIVE')),
  tokens_required integer not null check (tokens_required>0),
  promotional_tokens integer not null default 0 check (promotional_tokens>=0),
  purchased_tokens integer not null default 0 check (purchased_tokens>=0),
  adjustment_tokens integer not null default 0 check (adjustment_tokens>=0),
  allocations jsonb not null default '[]'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING','RESERVED','SETTLED','REFUNDED','CANCELLED')),
  idempotency_key text not null,
  reserved_at timestamptz,
  settled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id,idempotency_key),
  check (promotional_tokens+purchased_tokens+adjustment_tokens=tokens_required)
);

create table if not exists public.token_ledger (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_job_id uuid references public.research_jobs(id) on delete set null,
  token_lot_id uuid references public.token_lots(id) on delete set null,
  event_type text not null check (event_type in ('PROMO_GRANT','PURCHASE_GRANT','RESEARCH_RESERVE','RESEARCH_SETTLE','RESEARCH_REFUND','PROMO_EXPIRE','ADMIN_ADJUSTMENT','REVERSAL')),
  token_delta integer not null default 0,
  reserved_delta integer not null default 0,
  idempotency_key text not null,
  reason text,
  actor_type text not null check (actor_type in ('CLIENT','ADMIN','SYSTEM','PAYMENT')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id,idempotency_key)
);
create index if not exists token_ledger_org_idx on public.token_ledger(organization_id,created_at desc);

create table if not exists public.research_cost_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_job_id uuid not null references public.research_jobs(id) on delete cascade,
  provider text not null,
  service text not null,
  operation text not null,
  model text,
  usage_units numeric,
  unit_type text,
  unit_cost_usd numeric(14,8),
  cost_usd numeric(14,8),
  cost_category text not null check (cost_category in ('SEARCH','MODEL','EXTERNAL_API','RETRIEVAL','COMPUTE','OTHER')),
  cost_type text not null check (cost_type in ('ACTUAL','ESTIMATED','UNKNOWN')),
  pricing_version text,
  pricing_source text,
  idempotency_key text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (organization_id,idempotency_key),
  check ((cost_type='UNKNOWN' and cost_usd is null) or (cost_type<>'UNKNOWN' and cost_usd is not null and cost_usd>=0))
);
create index if not exists research_cost_events_job_idx on public.research_cost_events(research_job_id,occurred_at);

alter table public.search_runs add column if not exists research_job_id uuid references public.research_jobs(id) on delete set null;
alter table public.analysis_progress add column if not exists research_job_id uuid references public.research_jobs(id) on delete set null;

create or replace function private.prevent_token_ledger_mutation() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Token ledger history is immutable.'; end; $$;
drop trigger if exists token_ledger_immutable on public.token_ledger;
create trigger token_ledger_immutable before update or delete on public.token_ledger for each row execute function private.prevent_token_ledger_mutation();

create or replace function private.expire_token_lots(target_org uuid) returns void language plpgsql security definer set search_path='' as $$
declare lot record;
begin
  for lot in select id,available_tokens from public.token_lots where organization_id=target_org and kind='PROMOTIONAL' and expires_at<=now() and available_tokens>0 for update loop
    update public.token_lots set available_tokens=0,updated_at=now() where id=lot.id;
    insert into public.token_ledger(organization_id,token_lot_id,event_type,token_delta,reserved_delta,idempotency_key,reason,actor_type)
    values(target_org,lot.id,'PROMO_EXPIRE',-lot.available_tokens,0,'expire:'||lot.id::text,'Promotional Token lot expired','SYSTEM') on conflict do nothing;
  end loop;
end; $$;

create or replace function public.get_token_balance(target_organization uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare target_org uuid; result jsonb;
begin
  if target_organization is not null and (select private.is_admin()) then target_org:=target_organization;
  else select organization_id into target_org from public.organization_members where user_id=(select auth.uid()) limit 1; end if;
  if target_org is null then raise exception 'No authorized organization.'; end if;
  perform private.expire_token_lots(target_org);
  select jsonb_build_object(
    'organization_id',target_org,
    'available_tokens',coalesce(sum(available_tokens),0),
    'promotional_tokens',coalesce(sum(available_tokens) filter(where kind='PROMOTIONAL' and expires_at>now()),0),
    'purchased_tokens',coalesce(sum(available_tokens) filter(where kind='PURCHASED'),0),
    'adjustment_tokens',coalesce(sum(available_tokens) filter(where kind='ADJUSTMENT'),0),
    'reserved_tokens',coalesce(sum(reserved_tokens),0),
    'next_promo_expiry',min(expires_at) filter(where kind='PROMOTIONAL' and expires_at>now() and available_tokens>0)
  ) into result from public.token_lots where organization_id=target_org;
  return result;
end; $$;

create or replace function public.grant_beta_promotion(target_organization uuid,idempotency text default 'BETA_ACTIVATION') returns jsonb language plpgsql security definer set search_path='' as $$
declare wallet uuid; lot uuid; expiry timestamptz;
begin
  if not (select private.is_admin()) then raise exception 'Admin authorization required.'; end if;
  insert into public.token_wallets(organization_id) values(target_organization) on conflict(organization_id) do update set updated_at=now() returning id into wallet;
  perform pg_advisory_xact_lock(hashtext(target_organization::text||':BETA_ACTIVATION'));
  select id,expires_at into lot,expiry from public.token_lots where organization_id=target_organization and source_type='BETA_ACTIVATION' limit 1;
  if lot is null then
    expiry:=now()+interval '14 days';
    insert into public.token_lots(wallet_id,organization_id,kind,initial_tokens,available_tokens,expires_at,source_type,source_reference,idempotency_key)
    values(wallet,target_organization,'PROMOTIONAL',20,20,expiry,'BETA_ACTIVATION','ADMIN_TEST',idempotency) returning id into lot;
    insert into public.token_ledger(organization_id,token_lot_id,event_type,token_delta,idempotency_key,reason,actor_type)
    values(target_organization,lot,'PROMO_GRANT',20,'promo:'||idempotency,'20-Token beta activation grant','ADMIN');
  end if;
  return jsonb_build_object('token_lot_id',lot,'tokens',20,'expires_at',expiry);
end; $$;

create or replace function public.admin_adjust_token_balance(target_organization uuid,token_change integer,adjustment_reason text,idempotency text) returns jsonb language plpgsql security definer set search_path='' as $$
declare wallet uuid; lot_id uuid; remaining integer; take integer; lot record;
begin
  if not (select private.is_admin()) then raise exception 'Admin authorization required.'; end if;
  if token_change=0 or length(trim(coalesce(adjustment_reason,'')))<3 then raise exception 'A non-zero adjustment and reason are required.'; end if;
  perform pg_advisory_xact_lock(hashtext(target_organization::text||':'||idempotency));
  if exists(select 1 from public.token_ledger where organization_id=target_organization and idempotency_key='adjust:'||idempotency) then return public.get_token_balance(target_organization); end if;
  insert into public.token_wallets(organization_id) values(target_organization) on conflict(organization_id) do update set updated_at=now() returning id into wallet;
  if token_change>0 then
    insert into public.token_lots(wallet_id,organization_id,kind,initial_tokens,available_tokens,source_type,source_reference,idempotency_key)
    values(wallet,target_organization,'ADJUSTMENT',token_change,token_change,'ADMIN_ADJUSTMENT',left(adjustment_reason,240),'adjust-lot:'||idempotency) returning id into lot_id;
    insert into public.token_ledger(organization_id,token_lot_id,event_type,token_delta,idempotency_key,reason,actor_type)
    values(target_organization,lot_id,'ADMIN_ADJUSTMENT',token_change,'adjust:'||idempotency,left(adjustment_reason,1000),'ADMIN');
  else
    perform private.expire_token_lots(target_organization); remaining:=abs(token_change);
    if coalesce((select sum(available_tokens) from public.token_lots where organization_id=target_organization),0)<remaining then raise exception 'INSUFFICIENT_TOKENS'; end if;
    for lot in select * from public.token_lots where organization_id=target_organization and available_tokens>0 order by case kind when 'PROMOTIONAL' then 0 when 'PURCHASED' then 1 else 2 end,expires_at asc nulls last,created_at for update loop
      exit when remaining=0; take:=least(remaining,lot.available_tokens); update public.token_lots set available_tokens=available_tokens-take,updated_at=now() where id=lot.id;
      insert into public.token_ledger(organization_id,token_lot_id,event_type,token_delta,idempotency_key,reason,actor_type)
      values(target_organization,lot.id,'ADMIN_ADJUSTMENT',-take,'adjust:'||idempotency||':'||lot.id::text,left(adjustment_reason,1000),'ADMIN'); remaining:=remaining-take;
    end loop;
  end if;
  return public.get_token_balance(target_organization);
end; $$;

create or replace function public.reserve_research_tokens(target_product uuid,tier text,idempotency text) returns jsonb language plpgsql security definer set search_path='' as $$
declare target_org uuid; wallet uuid; job uuid; reservation uuid; needed integer; remaining integer; take integer; promo integer:=0; purchased integer:=0; adjustment integer:=0; allocations jsonb:='[]'::jsonb; lot record; target numeric; warning numeric; hard numeric; existing record;
begin
  select organization_id into target_org from public.product_profiles where id=target_product and organization_id in(select organization_id from public.organization_members where user_id=(select auth.uid()));
  if target_org is null then raise exception 'Product is not available in your workspace.'; end if;
  needed:=case upper(tier) when 'QUICK' then 5 when 'STANDARD' then 15 when 'DEEP' then 40 when 'INTENSIVE' then 100 else null end;
  if needed is null then raise exception 'Invalid research tier.'; end if;
  target:=needed*.10; warning:=needed*.12; hard:=needed*.13;
  insert into public.token_wallets(organization_id) values(target_org) on conflict(organization_id) do update set updated_at=now() returning id into wallet;
  perform pg_advisory_xact_lock(hashtext(target_org::text||':'||idempotency));
  select j.id,j.status,r.id as reservation_id,r.status as reservation_status into existing from public.research_jobs j left join public.token_reservations r on r.research_job_id=j.id where j.organization_id=target_org and j.idempotency_key=idempotency;
  if existing.id is not null then return jsonb_build_object('research_job_id',existing.id,'reservation_id',existing.reservation_id,'status',existing.reservation_status,'tokens',needed,'available_after',(select coalesce(sum(available_tokens),0) from public.token_lots where organization_id=target_org),'idempotent',true); end if;
  perform private.expire_token_lots(target_org);
  if coalesce((select sum(available_tokens) from public.token_lots where organization_id=target_org),0)<needed then raise exception 'INSUFFICIENT_TOKENS'; end if;
  insert into public.research_jobs(organization_id,product_id,requested_by,research_tier,token_cost,retail_equivalent_usd,target_cogs_usd,warning_cogs_usd,hard_cogs_usd,status,idempotency_key)
  values(target_org,target_product,(select auth.uid()),upper(tier),needed,needed,target,warning,hard,'CREATED',idempotency) returning id into job;
  remaining:=needed;
  for lot in select * from public.token_lots where organization_id=target_org and available_tokens>0 order by case kind when 'PROMOTIONAL' then 0 when 'PURCHASED' then 1 else 2 end,expires_at asc nulls last,created_at for update loop
    exit when remaining=0; take:=least(remaining,lot.available_tokens);
    update public.token_lots set available_tokens=available_tokens-take,reserved_tokens=reserved_tokens+take,updated_at=now() where id=lot.id;
    allocations:=allocations||jsonb_build_array(jsonb_build_object('lot_id',lot.id,'kind',lot.kind,'tokens',take,'expires_at',lot.expires_at));
    if lot.kind='PROMOTIONAL' then promo:=promo+take; elsif lot.kind='PURCHASED' then purchased:=purchased+take; else adjustment:=adjustment+take; end if;
    insert into public.token_ledger(organization_id,research_job_id,token_lot_id,event_type,token_delta,reserved_delta,idempotency_key,reason,actor_type)
    values(target_org,job,lot.id,'RESEARCH_RESERVE',-take,take,'reserve:'||job::text||':'||lot.id::text,upper(tier)||' research reservation','CLIENT');
    remaining:=remaining-take;
  end loop;
  if remaining<>0 then raise exception 'TOKEN_RESERVATION_INCONSISTENCY'; end if;
  insert into public.token_reservations(organization_id,research_job_id,research_tier,tokens_required,promotional_tokens,purchased_tokens,adjustment_tokens,allocations,status,idempotency_key,reserved_at)
  values(target_org,job,upper(tier),needed,promo,purchased,adjustment,allocations,'RESERVED','reservation:'||idempotency,now()) returning id into reservation;
  update public.research_jobs set status='RESERVED',updated_at=now() where id=job;
  return jsonb_build_object('research_job_id',job,'reservation_id',reservation,'status','RESERVED','tokens',needed,'promotional_tokens',promo,'purchased_tokens',purchased,'available_after',(select coalesce(sum(available_tokens),0) from public.token_lots where organization_id=target_org),'idempotent',false);
end; $$;

create or replace function public.settle_research_tokens(target_job uuid,idempotency text,metrics jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare reservation record; allocation jsonb; lot_expiry timestamptz;
begin
  select * into reservation from public.token_reservations where research_job_id=target_job for update;
  if reservation.id is null then raise exception 'Reservation not found.'; end if;
  if reservation.status='SETTLED' then return jsonb_build_object('status','SETTLED','idempotent',true); end if;
  if reservation.status='REFUNDED' then raise exception 'Cannot settle a refunded reservation.'; end if;
  if reservation.status<>'RESERVED' then raise exception 'Invalid reservation state.'; end if;
  for allocation in select value from jsonb_array_elements(reservation.allocations) loop
    update public.token_lots set reserved_tokens=reserved_tokens-(allocation->>'tokens')::integer,updated_at=now() where id=(allocation->>'lot_id')::uuid and reserved_tokens>=(allocation->>'tokens')::integer;
    if not found then raise exception 'Reservation allocation is inconsistent.'; end if;
    insert into public.token_ledger(organization_id,research_job_id,token_lot_id,event_type,token_delta,reserved_delta,idempotency_key,reason,actor_type)
    values(reservation.organization_id,target_job,(allocation->>'lot_id')::uuid,'RESEARCH_SETTLE',0,-(allocation->>'tokens')::integer,'settle:'||target_job::text||':'||(allocation->>'lot_id'),'Research completed','SYSTEM');
  end loop;
  update public.token_reservations set status='SETTLED',settled_at=now(),updated_at=now() where id=reservation.id;
  update public.research_jobs set status='COMPLETE',completed_at=now(),search_path_count=coalesce((metrics->>'search_path_count')::integer,0),result_count=coalesce((metrics->>'result_count')::integer,0),qualified_finding_count=coalesce((metrics->>'qualified_finding_count')::integer,0),independent_source_count=coalesce((metrics->>'independent_source_count')::integer,0),updated_at=now() where id=target_job;
  return jsonb_build_object('status','SETTLED','tokens',reservation.tokens_required,'promotional_tokens',reservation.promotional_tokens,'purchased_tokens',reservation.purchased_tokens,'idempotent',false);
end; $$;

create or replace function public.refund_research_tokens(target_job uuid,idempotency text,failure_message text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare reservation record; allocation jsonb; spendable integer; expiry timestamptz;
begin
  select * into reservation from public.token_reservations where research_job_id=target_job for update;
  if reservation.id is null then raise exception 'Reservation not found.'; end if;
  if reservation.status='REFUNDED' then return jsonb_build_object('status','REFUNDED','idempotent',true); end if;
  if reservation.status='SETTLED' then raise exception 'Cannot refund a settled reservation.'; end if;
  if reservation.status<>'RESERVED' then raise exception 'Invalid reservation state.'; end if;
  for allocation in select value from jsonb_array_elements(reservation.allocations) loop
    select expires_at into expiry from public.token_lots where id=(allocation->>'lot_id')::uuid for update;
    spendable:=case when (allocation->>'kind')='PROMOTIONAL' and expiry<=now() then 0 else (allocation->>'tokens')::integer end;
    update public.token_lots set reserved_tokens=reserved_tokens-(allocation->>'tokens')::integer,available_tokens=available_tokens+spendable,updated_at=now() where id=(allocation->>'lot_id')::uuid and reserved_tokens>=(allocation->>'tokens')::integer;
    if not found then raise exception 'Reservation allocation is inconsistent.'; end if;
    insert into public.token_ledger(organization_id,research_job_id,token_lot_id,event_type,token_delta,reserved_delta,idempotency_key,reason,actor_type,metadata)
    values(reservation.organization_id,target_job,(allocation->>'lot_id')::uuid,'RESEARCH_REFUND',spendable,-(allocation->>'tokens')::integer,'refund:'||target_job::text||':'||(allocation->>'lot_id'),coalesce($3,'Technical research failure'),'SYSTEM',jsonb_build_object('expired_promotional_tokens',(allocation->>'tokens')::integer-spendable));
  end loop;
  update public.token_reservations set status='REFUNDED',refunded_at=now(),updated_at=now() where id=reservation.id;
  update public.research_jobs set status='REFUNDED',failure_type='TECHNICAL',failure_message=left($3,1000),completed_at=now(),updated_at=now() where id=target_job;
  return jsonb_build_object('status','REFUNDED','tokens',reservation.tokens_required,'available_returned',(select coalesce(sum(available_tokens),0) from public.token_lots where organization_id=reservation.organization_id),'idempotent',false);
end; $$;

create or replace function public.record_research_cost(target_job uuid,provider_name text,service_name text,operation_name text,cost_value numeric,cost_kind text,category text,idempotency text,details jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare target_org uuid; total numeric; target numeric; hard numeric; state text;
begin
  select organization_id,target_cogs_usd,hard_cogs_usd into target_org,target,hard from public.research_jobs where id=target_job for update;
  if target_org is null then raise exception 'Research job not found.'; end if;
  insert into public.research_cost_events(organization_id,research_job_id,provider,service,operation,cost_usd,cost_category,cost_type,pricing_version,pricing_source,idempotency_key,metadata)
  values(target_org,target_job,provider_name,service_name,operation_name,cost_value,category,cost_kind,details->>'pricing_version',details->>'pricing_source',idempotency,details) on conflict(organization_id,idempotency_key) do nothing;
  select coalesce(sum(cost_usd),0) into total from public.research_cost_events where research_job_id=target_job and cost_usd is not null;
  state:=case when exists(select 1 from public.research_cost_events where research_job_id=target_job and cost_type='UNKNOWN') then 'UNKNOWN_COST' when total>=hard then 'LIMIT_REACHED' when total>=hard*.90 then 'NEAR_LIMIT' when total>target then 'WARNING' else 'HEALTHY' end;
  update public.research_jobs set accumulated_cogs_usd=total,has_unknown_cost=(state='UNKNOWN_COST'),cost_status=state,updated_at=now() where id=target_job;
  return jsonb_build_object('accumulated_cogs_usd',total,'hard_cogs_usd',hard,'cost_status',state);
end; $$;

alter table public.token_wallets enable row level security;
alter table public.token_lots enable row level security;
alter table public.token_ledger enable row level security;
alter table public.research_jobs enable row level security;
alter table public.token_reservations enable row level security;
alter table public.research_cost_events enable row level security;
revoke all on public.token_wallets,public.token_lots,public.token_ledger,public.research_jobs,public.token_reservations,public.research_cost_events from anon,authenticated;
grant select on public.token_wallets,public.token_lots,public.token_ledger,public.research_jobs,public.token_reservations to authenticated;

create policy token_wallets_select on public.token_wallets for select to authenticated using((select private.is_admin()) or organization_id in(select private.user_organization_ids()));
create policy token_lots_select on public.token_lots for select to authenticated using((select private.is_admin()) or organization_id in(select private.user_organization_ids()));
create policy token_ledger_select on public.token_ledger for select to authenticated using((select private.is_admin()) or organization_id in(select private.user_organization_ids()));
create policy research_jobs_select on public.research_jobs for select to authenticated using((select private.is_admin()) or organization_id in(select private.user_organization_ids()));
create policy token_reservations_select on public.token_reservations for select to authenticated using((select private.is_admin()) or organization_id in(select private.user_organization_ids()));
create policy research_cost_events_admin_select on public.research_cost_events for select to authenticated using((select private.is_admin()));

revoke all on function public.get_token_balance(uuid),public.grant_beta_promotion(uuid,text),public.admin_adjust_token_balance(uuid,integer,text,text),public.reserve_research_tokens(uuid,text,text),public.settle_research_tokens(uuid,text,jsonb),public.refund_research_tokens(uuid,text,text),public.record_research_cost(uuid,text,text,text,numeric,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.get_token_balance(uuid),public.reserve_research_tokens(uuid,text,text) to authenticated;
grant execute on function public.grant_beta_promotion(uuid,text),public.admin_adjust_token_balance(uuid,integer,text,text) to authenticated;
grant execute on function public.settle_research_tokens(uuid,text,jsonb),public.refund_research_tokens(uuid,text,text),public.record_research_cost(uuid,text,text,text,numeric,text,text,text,jsonb) to service_role;

drop trigger if exists token_wallets_updated_at on public.token_wallets; create trigger token_wallets_updated_at before update on public.token_wallets for each row execute function public.set_updated_at();
drop trigger if exists token_lots_updated_at on public.token_lots; create trigger token_lots_updated_at before update on public.token_lots for each row execute function public.set_updated_at();
drop trigger if exists research_jobs_updated_at on public.research_jobs; create trigger research_jobs_updated_at before update on public.research_jobs for each row execute function public.set_updated_at();
drop trigger if exists token_reservations_updated_at on public.token_reservations; create trigger token_reservations_updated_at before update on public.token_reservations for each row execute function public.set_updated_at();

do $$ declare table_name text; begin
  foreach table_name in array array['token_wallets','token_lots','token_ledger','research_jobs','token_reservations','research_cost_events'] loop
    if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=table_name and c.relrowsecurity) then raise exception 'RLS missing on public.%',table_name; end if;
    if not exists(select 1 from pg_policies where schemaname='public' and tablename=table_name) then raise exception 'RLS policy missing on public.%',table_name; end if;
  end loop;
end $$;
