import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { allocateTokens, circuitDecision, costStatus, researchEconomics, tierTokens } from "../src/lib/tokens/economics.ts";

const migration=await readFile(new URL("../supabase/migrations/202609030008_meridian_token_economics.sql",import.meta.url),"utf8");
const lot=(id,kind,available,expiresAt=null)=>({id,kind,available,reserved:0,expiresAt});
const future="2099-01-01T00:00:00Z",soon="2098-01-01T00:00:00Z",past="2020-01-01T00:00:00Z";

test("1. promotional grant is idempotent",()=>{assert.match(migration,/source_type='BETA_ACTIVATION'/);assert.match(migration,/if lot is null then/);});
test("2. promotion expires after 14 days",()=>assert.match(migration,/now\(\)\+interval '14 days'/));
test("3. purchased lot does not require expiry",()=>assert.match(migration,/\(kind='PROMOTIONAL' and expires_at is not null\) or kind<>'PROMOTIONAL'/));
test("4. promotional Tokens spend before purchased",()=>assert.deepEqual(allocateTokens([lot("paid","PURCHASED",20),lot("promo","PROMOTIONAL",5,future)],5).map(x=>x.lotId),["promo"]));
test("5. sooner-expiring promo lot spends first",()=>assert.deepEqual(allocateTokens([lot("later","PROMOTIONAL",5,future),lot("soon","PROMOTIONAL",5,soon)],5).map(x=>x.lotId),["soon"]));
test("6. Standard reserves 15",()=>assert.equal(tierTokens("STANDARD"),15));
test("7. Quick reserves 5",()=>assert.equal(tierTokens("QUICK"),5));
test("8. Deep reserves 40",()=>assert.equal(tierTokens("DEEP"),40));
test("9. Intensive reserves 100",()=>assert.equal(tierTokens("INTENSIVE"),100));
test("10. insufficient balance blocks",()=>assert.throws(()=>allocateTokens([lot("one","PURCHASED",4)],5),/INSUFFICIENT_TOKENS/));
test("11. reservation uses an organization-scoped advisory lock",()=>assert.match(migration,/pg_advisory_xact_lock\(hashtext\(target_org::text\|\|'\:'\|\|idempotency\)\)/));
test("12. duplicate request returns the existing reservation",()=>{assert.match(migration,/j\.idempotency_key=idempotency/);assert.match(migration,/'idempotent',true/);});
test("13. successful settlement is idempotent",()=>assert.match(migration,/reservation\.status='SETTLED'.*'idempotent',true/s));
test("14. technical refund is idempotent",()=>assert.match(migration,/reservation\.status='REFUNDED'.*'idempotent',true/s));
test("15. refund restores the original lot allocation",()=>assert.match(migration,/available_tokens=available_tokens\+spendable/));
test("16. expired promotional refund creates no spendable value",()=>assert.match(migration,/kind'\)='PROMOTIONAL' and expiry<=now\(\) then 0/));
test("17. settlement after refund is rejected",()=>assert.match(migration,/Cannot settle a refunded reservation/));
test("18. refund after settlement is rejected",()=>assert.match(migration,/Cannot refund a settled reservation/));
test("19. cost events sum known provider costs",()=>assert.match(migration,/sum\(cost_usd\).*research_cost_events/s));
test("20. promo-only research is not paid revenue",()=>assert.deepEqual(researchEconomics({tier:"STANDARD",promo:15,purchased:0,cogs:1,usefulFindings:5}),{retailEquivalentUsd:15,promotionalValueConsumedUsd:15,paidTokenValueConsumedUsd:0,researchCogsUsd:1,contributionBeforePaymentFeesUsd:-1,betaAcquisitionCostUsd:1,costPerUsefulFindingUsd:.2}));
test("21. mixed promo and purchased economics remain separate",()=>{const value=researchEconomics({tier:"STANDARD",promo:8,purchased:7,cogs:1,usefulFindings:2});assert.equal(value.promotionalValueConsumedUsd,8);assert.equal(value.paidTokenValueConsumedUsd,7);assert.equal(value.contributionBeforePaymentFeesUsd,6);});
test("22. cost warning bands are deterministic",()=>{assert.equal(costStatus(1.6,"STANDARD"),"WARNING");assert.equal(costStatus(1.8,"STANDARD"),"NEAR_LIMIT");assert.equal(costStatus(1.95,"STANDARD"),"LIMIT_REACHED");assert.equal(costStatus(null,"STANDARD",true),"UNKNOWN_COST");});
test("23. hard ceiling prevents new provider spend",()=>{assert.equal(circuitDecision(1.9,.1,"STANDARD","ESSENTIAL").allowed,false);assert.equal(circuitDecision(1.5,.01,"STANDARD","OPTIONAL").allowed,false);});
test("24. organization RLS isolates token data",()=>{for(const table of ["token_wallets","token_lots","token_ledger","research_jobs","token_reservations"])assert.match(migration,new RegExp(`create policy ${table}.*organization_id in\\(select private\\.user_organization_ids\\(\\)\\)`,`s`));});
test("25. clients cannot grant Tokens",()=>{assert.match(migration,/grant_beta_promotion[\s\S]*Admin authorization required/);assert.match(migration,/revoke all on function public\.get_token_balance/);});

test("expired promos are excluded from allocation",()=>assert.throws(()=>allocateTokens([lot("expired","PROMOTIONAL",20,past)],5,new Date("2026-01-01")),/INSUFFICIENT_TOKENS/));
test("mixed allocation consumes 8 promo then 7 purchased",()=>assert.deepEqual(allocateTokens([lot("paid","PURCHASED",50),lot("promo","PROMOTIONAL",8,future)],15).map(({kind,tokens})=>({kind,tokens})),[{kind:"PROMOTIONAL",tokens:8},{kind:"PURCHASED",tokens:7}]));
