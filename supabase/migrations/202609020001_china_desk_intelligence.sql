-- China Desk Intelligence Layer — Phase 2
-- Builds on the existing organization-isolated foundation.

alter table public.organizations
  add column if not exists ai_response_mode text not null default 'REVIEW'
    check (ai_response_mode in ('DIRECT', 'REVIEW')),
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_skipped_at timestamptz;

alter table public.competitors
  add column if not exists ai_assessment jsonb,
  add column if not exists ai_assessment_updated_at timestamptz;

alter table public.partners
  add column if not exists ai_assessment jsonb,
  add column if not exists ai_assessment_updated_at timestamptz;

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_conversations_org_user_idx
  on public.ai_conversations(organization_id, user_id, updated_at desc);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('USER', 'ASSISTANT')),
  content text not null,
  answer jsonb,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'FAILED')),
  source_references jsonb not null default '[]'::jsonb,
  confidence text check (confidence is null or confidence in ('HIGH', 'MEDIUM', 'LOW')),
  requires_local_execution boolean not null default false,
  request_id uuid references public.requests(id) on delete set null,
  reviewed_by uuid references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_messages_conversation_idx
  on public.ai_messages(conversation_id, created_at);
create index ai_messages_review_idx
  on public.ai_messages(organization_id, status, created_at desc);

create table public.ai_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  feature text not null check (feature in ('ASK_CHINA', 'RESEARCH', 'MARKET_PULSE', 'COMPETITOR', 'PARTNER')),
  entity_type text,
  entity_id uuid,
  source_material text,
  output jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'APPROVED', 'PUBLISHED', 'DISCARDED')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_drafts_review_idx
  on public.ai_drafts(status, created_at desc);
create index ai_drafts_org_idx
  on public.ai_drafts(organization_id, feature, created_at desc);

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  request_key text not null unique,
  created_at timestamptz not null default now()
);
create index ai_usage_org_created_idx
  on public.ai_usage(organization_id, created_at desc);

create trigger ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();
create trigger ai_messages_updated_at
  before update on public.ai_messages
  for each row execute function public.set_updated_at();
create trigger ai_drafts_updated_at
  before update on public.ai_drafts
  for each row execute function public.set_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_drafts enable row level security;
alter table public.ai_usage enable row level security;

revoke all on public.ai_conversations, public.ai_messages, public.ai_drafts, public.ai_usage
  from anon, authenticated;
grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert, update on public.ai_messages to authenticated;
grant select, insert, update, delete on public.ai_drafts to authenticated;
grant select on public.ai_usage to authenticated;

create policy ai_conversations_select on public.ai_conversations
  for select to authenticated
  using ((select private.is_admin()) or (
    user_id = (select auth.uid()) and
    organization_id in (select private.user_organization_ids())
  ));
create policy ai_conversations_insert on public.ai_conversations
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) and
    organization_id in (select private.user_organization_ids())
  );
create policy ai_conversations_update on public.ai_conversations
  for update to authenticated
  using ((select private.is_admin()) or user_id = (select auth.uid()))
  with check ((select private.is_admin()) or (
    user_id = (select auth.uid()) and
    organization_id in (select private.user_organization_ids())
  ));
create policy ai_conversations_delete on public.ai_conversations
  for delete to authenticated
  using ((select private.is_admin()) or (
    user_id = (select auth.uid()) and
    organization_id in (select private.user_organization_ids())
  ));

create policy ai_messages_select on public.ai_messages
  for select to authenticated
  using ((select private.is_admin()) or (
    organization_id in (select private.user_organization_ids()) and
    exists (
      select 1 from public.ai_conversations conversation
      where conversation.id = public.ai_messages.conversation_id
        and conversation.user_id = (select auth.uid())
    ) and (role = 'USER' or status = 'PUBLISHED')
  ));
create policy ai_messages_client_insert on public.ai_messages
  for insert to authenticated
  with check (
    role = 'USER' and status = 'PUBLISHED' and
    user_id = (select auth.uid()) and
    organization_id in (select private.user_organization_ids()) and
    exists (
      select 1 from public.ai_conversations conversation
      where conversation.id = public.ai_messages.conversation_id
        and conversation.user_id = (select auth.uid())
        and conversation.organization_id = public.ai_messages.organization_id
    )
  );
create policy ai_messages_admin_insert on public.ai_messages
  for insert to authenticated with check ((select private.is_admin()));
create policy ai_messages_admin_update on public.ai_messages
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy ai_drafts_admin_all on public.ai_drafts
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy ai_usage_admin_select on public.ai_usage
  for select to authenticated using ((select private.is_admin()));

-- Clients submit onboarding answers through a narrow function rather than
-- receiving broad UPDATE access to organizations.
create or replace function public.save_client_onboarding(
  answers jsonb,
  skip_onboarding boolean default false
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_org uuid;
  answer record;
begin
  select organization_id into target_org
  from public.organization_members
  where user_id = (select auth.uid())
  limit 1;

  if target_org is null then
    raise exception 'No organization membership';
  end if;

  if skip_onboarding then
    update public.organizations
    set onboarding_skipped_at = now()
    where id = target_org;
    return;
  end if;

  for answer in
    select * from jsonb_to_recordset(answers)
      as value(title text, category text, content text)
  loop
    if coalesce(length(trim(answer.content)), 0) > 0 then
      insert into public.knowledge_items(
        organization_id, title, category, content, tags, source, created_by
      ) values (
        target_org,
        left(answer.title, 160),
        answer.category,
        left(answer.content, 5000),
        array['onboarding'],
        'Client onboarding',
        (select auth.uid())
      );
    end if;
  end loop;

  update public.organizations
  set onboarding_completed_at = now(), onboarding_skipped_at = null
  where id = target_org;
end;
$$;
revoke all on function public.save_client_onboarding(jsonb, boolean) from public;
grant execute on function public.save_client_onboarding(jsonb, boolean) to authenticated;

-- Clients can maintain the bounded, structured company profile without broad
-- write access to arbitrary organization knowledge.
create or replace function public.save_company_context(answers jsonb) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_org uuid;
  answer record;
  existing_id uuid;
begin
  select organization_id into target_org
  from public.organization_members
  where user_id = (select auth.uid())
  limit 1;
  if target_org is null then raise exception 'No organization membership'; end if;

  for answer in
    select * from jsonb_to_recordset(answers)
      as value(title text, category text, content text)
  loop
    if answer.category not in ('Company','Products','Target Customers','Target Markets','Competitors','Existing Partners','Pricing','Commercial Strategy','Important Decisions','Other Context') then
      raise exception 'Unsupported company context category';
    end if;
    if coalesce(length(trim(answer.content)), 0) > 0 then
      select id into existing_id from public.knowledge_items
      where organization_id = target_org and title = answer.title and tags @> array['company-profile']
      order by updated_at desc limit 1;
      if existing_id is null then
        insert into public.knowledge_items(organization_id,title,category,content,tags,source,created_by)
        values (target_org,left(answer.title,160),answer.category,left(answer.content,5000),array['company-profile'],'Client company profile',(select auth.uid()));
      else
        update public.knowledge_items set content = left(answer.content,5000), category = answer.category
        where id = existing_id and organization_id = target_org;
      end if;
      existing_id := null;
    end if;
  end loop;
end;
$$;
revoke all on function public.save_company_context(jsonb) from public;
grant execute on function public.save_company_context(jsonb) to authenticated;

comment on table public.ai_messages is
  'Organization-isolated Ask China messages. Client RLS hides draft assistant responses until admin publication.';
comment on table public.ai_usage is
  'Server-written internal AI usage records for cost and product analysis.';
