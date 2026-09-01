-- Fictional development data only. Never use these records as production claims.
insert into public.organizations(id, name, slug)
values ('10000000-0000-0000-0000-000000000001', 'ACME Medical — Demo', 'acme-medical-demo')
on conflict (id) do update set name = excluded.name;

insert into public.market_updates(organization_id,title,summary,category,priority,source_name,published_at) values
('10000000-0000-0000-0000-000000000001','Domestic competitor adds a mid-market tier','A fictional competitor launch may change pricing expectations.','Competitor','HIGH','Demo company announcement',now()-interval '2 days'),
('10000000-0000-0000-0000-000000000001','Regional distributors expand hospital coverage','Two fictional distributors added priority provinces.','Partner','MEDIUM','Demo trade media',now()-interval '5 days'),
('10000000-0000-0000-0000-000000000001','Documentation consultation published','A fictional consultation may affect product documentation.','Regulation','MEDIUM','Demo regulatory notice',now()-interval '9 days'),
('10000000-0000-0000-0000-000000000001','Channel pricing remains stable','Illustrative pricing checks show no material movement.','Pricing','LOW','Demo channel review',now()-interval '14 days'),
('10000000-0000-0000-0000-000000000001','Hospital group announces procurement review','A fictional customer network is reviewing its 2027 plan.','Customer','MEDIUM','Demo customer notice',now()-interval '18 days');

insert into public.competitors(organization_id,company_name,chinese_name,location,segment,description,products,pricing_notes,positioning,recent_activity,priority,external_client_notes,sources) values
('10000000-0000-0000-0000-000000000001','Demo Medical A','示例医疗甲','Shenzhen','Core devices','Fictional domestic manufacturer.','["Core system","Compact system"]','Mid-market pricing.','Local engineering and responsive service.','New product tier announced.','HIGH','Watch channel response.','["Demo website"]'),
('10000000-0000-0000-0000-000000000001','Demo Diagnostics B','示例诊断乙','Shanghai','Diagnostics','Fictional diagnostics company.','["Diagnostic platform"]','Premium tier.','Clinical workflow.','Distributor campaign.','MEDIUM','Review priority provinces.','["Demo distributor pages"]'),
('10000000-0000-0000-0000-000000000001','Demo Device C','示例器械丙','Suzhou','Value devices','Fictional value-tier manufacturer.','["Value device"]','Price-led.','Accessible alternative.','Pricing unchanged.','LOW','Monitor tenders.','["Demo marketplace scan"]'),
('10000000-0000-0000-0000-000000000001','Demo Health Tech D','示例科技丁','Beijing','Digital health','Fictional software provider.','["Workflow software"]','Subscription pricing.','Integrated workflow.','New hospital pilot.','MEDIUM','Potential adjacent competitor.','["Demo media"]'),
('10000000-0000-0000-0000-000000000001','Demo Clinical E','示例临床戊','Guangzhou','Clinical services','Fictional service provider.','["Clinical service"]','Project pricing.','Specialist access.','New partnership.','LOW','Track partner overlap.','["Demo announcement"]');

insert into public.partners(organization_id,company_name,chinese_name,partner_type,location,contact_person,contact_role,english_ability,interest_level,status,last_contact,notes,source) values
('10000000-0000-0000-0000-000000000001','Example North Distributor','示例北方经销商','Distributor','Beijing','Li Wei','Commercial Director','Professional','Unconfirmed','IDENTIFIED',null,'Hospital coverage; qualification pending.','Demo research'),
('10000000-0000-0000-0000-000000000001','Example East Healthcare','示例华东医疗','Strategic Partner','Shanghai','Chen Yu','International Lead','Fluent','Medium','QUALIFIED',current_date-10,'Strong segment fit.','Demo research'),
('10000000-0000-0000-0000-000000000001','Example South Medical','示例南方医疗','Distributor','Shenzhen','Wang Lin','General Manager','Professional','Medium','CONTACTED',current_date-6,'Introductory email sent.','Demo outreach'),
('10000000-0000-0000-0000-000000000001','Example Clinical Group','示例临床集团','Customer','Guangzhou','Zhao Min','Procurement Lead','Professional','High','INTERESTED',current_date-3,'Requested localized information.','Demo outreach'),
('10000000-0000-0000-0000-000000000001','Example Service Partner','示例服务伙伴','Agency','Hangzhou','Sun Jie','Partner','Fluent','High','ACTIVE',current_date-1,'Working session scheduled.','Demo relationship'),
('10000000-0000-0000-0000-000000000001','Example Supplier One','示例供应商一','Supplier','Suzhou',null,null,'Basic','Unconfirmed','IDENTIFIED',null,'Capabilities under review.','Demo sourcing'),
('10000000-0000-0000-0000-000000000001','Example West Distributor','示例西部经销商','Distributor','Chengdu',null,null,'Professional','Low','NOT_A_FIT',current_date-30,'Coverage does not match priorities.','Demo research'),
('10000000-0000-0000-0000-000000000001','Example Market Agency','示例市场机构','Agency','Shanghai',null,null,'Fluent','Medium','QUALIFIED',null,'Localization experience.','Demo referral'),
('10000000-0000-0000-0000-000000000001','Example Broker Two','示例顾问二','Broker','Nanjing',null,null,'Professional','Unconfirmed','IDENTIFIED',null,'Requires background check.','Demo referral'),
('10000000-0000-0000-0000-000000000001','Example Hospital Network','示例医院网络','Customer','Wuhan',null,null,'Basic','Medium','CONTACTED',current_date-8,'Initial introduction made.','Demo outreach');

insert into public.research_reports(organization_id,title,category,summary,status,full_content,sources) values
('10000000-0000-0000-0000-000000000001','China Market Overview','Market','Fictional market structure and priority questions.','COMPLETED','Demo report content for product development only.','["Demo source A"]'),
('10000000-0000-0000-0000-000000000001','Competitor Landscape','Competitors','Illustrative competitor positioning.','COMPLETED','Demo competitor analysis content.','["Demo source B"]'),
('10000000-0000-0000-0000-000000000001','Distributor Shortlist','Partners','Qualification of fictional regional distributors.','IN_PROGRESS','Working notes for a fictional shortlist.','[]');

insert into public.requests(organization_id,title,description,request_type,priority,status,updates) values
('10000000-0000-0000-0000-000000000001','Validate distributor shortlist','Review the current fictional shortlist.','Find partners','HIGH','IN_PROGRESS','[{"message":"Initial screening complete.","created_at":"2026-08-28"}]'),
('10000000-0000-0000-0000-000000000001','Check pricing assumption','Validate an illustrative market assumption.','Validate an assumption','MEDIUM','REVIEWING','[]'),
('10000000-0000-0000-0000-000000000001','Research Demo Medical A','Prepare a fictional company brief.','Research a company','MEDIUM','COMPLETED','[{"message":"Brief published.","created_at":"2026-08-22"}]'),
('10000000-0000-0000-0000-000000000001','Contact example partner','Illustrative outreach request.','Contact someone','LOW','SUBMITTED','[]');

insert into public.knowledge_items(organization_id,title,category,content,tags,source) values
('10000000-0000-0000-0000-000000000001','Company context','Company','Fictional international medical technology company evaluating China.','{"demo","company"}','Demo onboarding'),
('10000000-0000-0000-0000-000000000001','Core platforms','Products','Core and compact product platforms.','{"demo","products"}','Demo onboarding'),
('10000000-0000-0000-0000-000000000001','Priority customers','Target Customers','Tier-two hospitals and specialist clinical groups.','{"demo","customers"}','Demo workshop'),
('10000000-0000-0000-0000-000000000001','Commercial direction','Commercial Strategy','Validate mid-market positioning before partner outreach.','{"demo","strategy"}','Demo decision log'),
('10000000-0000-0000-0000-000000000001','Province focus','Important Decisions','Prioritize two fictional provinces for validation.','{"demo","decision"}','Demo working session');
