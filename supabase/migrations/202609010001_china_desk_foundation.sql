create extension if not exists pgcrypto;

create type public.app_role as enum ('CLIENT', 'ADMIN');
create type public.partner_status as enum ('IDENTIFIED', 'QUALIFIED', 'CONTACTED', 'INTERESTED', 'ACTIVE', 'NOT_A_FIT');
create type public.research_status as enum ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
create type public.request_status as enum ('SUBMITTED', 'REVIEWING', 'IN_PROGRESS', 'NEEDS_INFORMATION', 'COMPLETED', 'CANCELLED');
create type public.priority_level as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  role public.app_role not null default 'CLIENT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_id_idx on public.organization_members(user_id);

create table public.market_updates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text not null,
  category text not null check (category in ('Market','Competitor','Regulation','Pricing','Partner','Customer','Other')),
  priority public.priority_level not null default 'MEDIUM',
  source_url text,
  source_name text,
  notes text,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index market_updates_org_idx on public.market_updates(organization_id, published_at desc);

create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  chinese_name text,
  website text,
  location text,
  segment text,
  description text,
  products jsonb not null default '[]'::jsonb,
  pricing_notes text,
  positioning text,
  recent_activity text,
  priority public.priority_level not null default 'MEDIUM',
  external_client_notes text,
  sources jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index competitors_org_idx on public.competitors(organization_id, updated_at desc);

create table public.competitor_internal_notes (
  competitor_id uuid primary key references public.competitors(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  chinese_name text,
  partner_type text not null check (partner_type in ('Distributor','Customer','Supplier','Agency','Broker','Strategic Partner','Other')),
  location text,
  website text,
  contact_person text,
  contact_role text,
  wechat text,
  email text,
  phone text,
  english_ability text,
  interest_level text,
  status public.partner_status not null default 'IDENTIFIED',
  last_contact date,
  notes text,
  source text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index partners_org_idx on public.partners(organization_id, status, updated_at desc);

create table public.partner_internal_notes (
  partner_id uuid primary key references public.partners(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

create table public.research_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category text not null,
  summary text,
  status public.research_status not null default 'REQUESTED',
  full_content text,
  sources jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index research_reports_org_idx on public.research_reports(organization_id, updated_at desc);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  request_type text not null check (request_type in ('Research a company','Find partners','Find suppliers','Check a competitor','Validate an assumption','Market question','Contact someone','Other')),
  priority public.priority_level not null default 'MEDIUM',
  status public.request_status not null default 'SUBMITTED',
  updates jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index requests_org_idx on public.requests(organization_id, status, updated_at desc);

create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Company','Products','Target Customers','Target Markets','Competitors','Existing Partners','Existing Suppliers','Pricing','Commercial Strategy','Important Decisions','Previous Research','Other Context')),
  content text not null,
  tags text[] not null default '{}',
  source text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index knowledge_items_org_idx on public.knowledge_items(organization_id, category, updated_at desc);

create table public.activity (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_org_idx on public.activity(organization_id, created_at desc);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger market_updates_updated_at before update on public.market_updates for each row execute function public.set_updated_at();
create trigger competitors_updated_at before update on public.competitors for each row execute function public.set_updated_at();
create trigger partners_updated_at before update on public.partners for each row execute function public.set_updated_at();
create trigger research_reports_updated_at before update on public.research_reports for each row execute function public.set_updated_at();
create trigger requests_updated_at before update on public.requests for each row execute function public.set_updated_at();
create trigger knowledge_items_updated_at before update on public.knowledge_items for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create schema if not exists private;
create function private.is_admin() returns boolean language sql security definer set search_path = '' stable as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'ADMIN');
$$;
create function private.user_organization_ids() returns setof uuid language sql security definer set search_path = '' stable as $$
  select organization_id from public.organization_members where user_id = (select auth.uid());
$$;
revoke all on schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.user_organization_ids() to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.market_updates enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_internal_notes enable row level security;
alter table public.partners enable row level security;
alter table public.partner_internal_notes enable row level security;
alter table public.research_reports enable row level security;
alter table public.requests enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.activity enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.organizations, public.organization_members, public.market_updates, public.competitors, public.partners, public.research_reports, public.requests, public.knowledge_items, public.activity to authenticated;
grant insert on public.requests, public.activity to authenticated;
grant insert, update, delete on public.organizations, public.organization_members, public.market_updates, public.competitors, public.competitor_internal_notes, public.partners, public.partner_internal_notes, public.research_reports, public.requests, public.knowledge_items, public.activity to authenticated;
grant select on public.competitor_internal_notes, public.partner_internal_notes to authenticated;

create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()) or (select private.is_admin()));
create policy organizations_select on public.organizations for select to authenticated using ((select private.is_admin()) or id in (select private.user_organization_ids()));
create policy organizations_admin_all on public.organizations for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy memberships_select on public.organization_members for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy memberships_admin_all on public.organization_members for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy market_select on public.market_updates for select to authenticated using ((select private.is_admin()) or (organization_id in (select private.user_organization_ids()) and published_at is not null));
create policy market_admin_insert on public.market_updates for insert to authenticated with check ((select private.is_admin()));
create policy market_admin_update on public.market_updates for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy market_admin_delete on public.market_updates for delete to authenticated using ((select private.is_admin()));

create policy competitors_select on public.competitors for select to authenticated using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy competitors_admin_insert on public.competitors for insert to authenticated with check ((select private.is_admin()));
create policy competitors_admin_update on public.competitors for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy competitors_admin_delete on public.competitors for delete to authenticated using ((select private.is_admin()));
create policy competitor_internal_admin on public.competitor_internal_notes for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy partners_select on public.partners for select to authenticated using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy partners_admin_insert on public.partners for insert to authenticated with check ((select private.is_admin()));
create policy partners_admin_update on public.partners for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy partners_admin_delete on public.partners for delete to authenticated using ((select private.is_admin()));
create policy partner_internal_admin on public.partner_internal_notes for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy research_client_select on public.research_reports for select to authenticated using (organization_id in (select private.user_organization_ids()) and status = 'COMPLETED');
create policy research_admin_select on public.research_reports for select to authenticated using ((select private.is_admin()));
create policy research_admin_insert on public.research_reports for insert to authenticated with check ((select private.is_admin()));
create policy research_admin_update on public.research_reports for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy research_admin_delete on public.research_reports for delete to authenticated using ((select private.is_admin()));

create policy requests_select on public.requests for select to authenticated using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy requests_client_insert on public.requests for insert to authenticated with check (organization_id in (select private.user_organization_ids()) and created_by = (select auth.uid()));
create policy requests_admin_insert on public.requests for insert to authenticated with check ((select private.is_admin()));
create policy requests_admin_update on public.requests for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy requests_admin_delete on public.requests for delete to authenticated using ((select private.is_admin()));

create policy knowledge_select on public.knowledge_items for select to authenticated using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy knowledge_admin_insert on public.knowledge_items for insert to authenticated with check ((select private.is_admin()));
create policy knowledge_admin_update on public.knowledge_items for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy knowledge_admin_delete on public.knowledge_items for delete to authenticated using ((select private.is_admin()));

create policy activity_select on public.activity for select to authenticated using ((select private.is_admin()) or organization_id in (select private.user_organization_ids()));
create policy activity_insert on public.activity for insert to authenticated with check ((select private.is_admin()) or (organization_id in (select private.user_organization_ids()) and actor_id = (select auth.uid())));
create policy activity_admin_update on public.activity for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy activity_admin_delete on public.activity for delete to authenticated using ((select private.is_admin()));

insert into storage.buckets(id, name, public) values ('research-attachments', 'research-attachments', false) on conflict (id) do nothing;
create policy research_files_select on storage.objects for select to authenticated using (
  bucket_id = 'research-attachments' and ((select private.is_admin()) or (storage.foldername(name))[1]::uuid in (select private.user_organization_ids()))
);
create policy research_files_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'research-attachments' and (select private.is_admin()));
create policy research_files_admin_update on storage.objects for update to authenticated using (bucket_id = 'research-attachments' and (select private.is_admin())) with check (bucket_id = 'research-attachments' and (select private.is_admin()));
create policy research_files_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'research-attachments' and (select private.is_admin()));
