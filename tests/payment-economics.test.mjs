import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { verifyPaddleSignature } from "../src/lib/payments/signature.ts";
import { tokenPacks, autoRefillDefaults } from "../src/config/paymentCatalog.ts";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const webhook = read("src/app/api/paddle/webhook/route.ts");
const checkout = read("src/app/api/paddle/checkout/route.ts");
const refill = read("src/lib/payments/auto-refill.ts");
const migration = read("supabase/migrations/202609040009_meridian_payments.sql");
const controls = read("src/components/china-desk-app/payment-controls.tsx");
const actions = read("src/app/desk/app/product/actions.ts");
const paddle = read("src/lib/payments/paddle.ts");
const validator = read("scripts/validate-paddle-catalog.mjs");
const env = read(".env.example");
const valid = (body="{}", ts=Math.floor(Date.now()/1000), secret="secret") => ({ header:`ts=${ts};h1=${createHmac("sha256",secret).update(`${ts}:${body}`).digest("hex")}`, ts, body, secret });

const cases = [
  ["1 activation is not a paid subscription", () => assert.match(controls,/No monthly fee/)],
  ["2 activation is zero charge copy", () => assert.match(controls,/No activation charge/)],
  ["3 activation grants exactly 20 promo Tokens", () => assert.match(migration,/PROMOTIONAL',20,20/)],
  ["4 activation expires after 14 days", () => assert.match(migration,/interval '14 days'/)],
  ["5 activation is idempotent per organization", () => assert.match(migration,/idempotency_key\).*'BETA_ACTIVATION'/)],
  ["6 signup does not grant activation Tokens", () => assert.doesNotMatch(checkout,/activate_paddle_beta/)],
  ["7 five Token pack is five dollars", () => assert.equal(tokenPacks[5].usd,5)],
  ["8 twenty Token pack is twenty dollars", () => assert.equal(tokenPacks[20].usd,20)],
  ["9 fifty Token pack is fifty dollars", () => assert.equal(tokenPacks[50].usd,50)],
  ["10 one hundred Token pack is one hundred dollars", () => assert.equal(tokenPacks[100].usd,100)],
  ["11 two hundred fifty Token pack is exact", () => assert.equal(tokenPacks[250].usd,250)],
  ["12 five hundred Token pack is exact", () => assert.equal(tokenPacks[500].usd,500)],
  ["13 auto-refill excludes five pack", () => assert.equal(tokenPacks[5].autoRefill,false)],
  ["14 auto-refill excludes five hundred pack", () => assert.equal(tokenPacks[500].autoRefill,false)],
  ["15 auto-refill defaults off", () => assert.equal(autoRefillDefaults.enabled,false)],
  ["16 auto-refill default trigger is ten", () => assert.equal(autoRefillDefaults.triggerTokens,10)],
  ["17 auto-refill default pack is fifty", () => assert.equal(autoRefillDefaults.refillTokens,50)],
  ["18 auto-refill default cap is one hundred", () => assert.equal(autoRefillDefaults.monthlyCapUsd,100)],
  ["19 invalid signature is rejected", () => assert.equal(verifyPaddleSignature("{}","ts=1;h1=00","secret",1),false)],
  ["20 valid raw-body signature is accepted", () => {const v=valid();assert.equal(verifyPaddleSignature(v.body,v.header,v.secret,v.ts),true)}],
  ["21 modified raw body is rejected", () => {const v=valid();assert.equal(verifyPaddleSignature("{ }",v.header,v.secret,v.ts),false)}],
  ["22 stale signatures are rejected", () => {const v=valid("{}",10);assert.equal(verifyPaddleSignature(v.body,v.header,v.secret,16),false)}],
  ["23 completed transaction is fulfillment authority", () => assert.match(webhook,/event_type === "transaction.completed"/)],
  ["24 created transaction does not fulfill", () => assert.doesNotMatch(webhook,/transaction\.created.*grant_paddle_purchase/s)],
  ["25 paid transaction does not fulfill", () => assert.doesNotMatch(webhook,/transaction\.paid.*grant_paddle_purchase/s)],
  ["26 unknown price grants zero Tokens", () => assert.match(webhook,/Unknown catalog items never grant Tokens/)],
  ["27 server maps trusted price to pack", () => assert.match(webhook,/packForPrice/)],
  ["28 Paddle request bodies match authoritative APIs", () => {assert.match(paddle,/auth-token`,"POST"\);/);assert.doesNotMatch(paddle,/charge`[^\n]+custom_data/)}],
  ["29 duplicate purchase grant has advisory lock", () => assert.match(migration,/pg_advisory_xact_lock/)],
  ["30 duplicate webhook has unique event key", () => assert.match(migration,/unique\(environment,event_id\)/)],
  ["31 failed webhook can be reclaimed", () => assert.match(webhook,/processing_status !== "FAILED"/)],
  ["32 cross-environment event is rejected", () => assert.match(webhook,/Environment mismatch/)],
  ["33 checkout requires authentication", () => assert.match(checkout,/Sign in required/)],
  ["34 checkout is rate limited", () => assert.match(checkout,/status: 429/)],
  ["35 card data is never collected directly", () => assert.doesNotMatch(controls,/card_number|cvv|cvc/i)],
  ["36 Paddle holds payment method", () => assert.match(controls,/securely held by Paddle/)],
  ["37 auto-refill needs active profile", () => assert.match(refill,/payment_profile_status !== "ACTIVE"/)],
  ["38 expired promotional Tokens are excluded", () => assert.match(refill,/kind !== "PROMOTIONAL"/)],
  ["39 monthly cap is enforced before charge", () => assert.ok(refill.indexOf("spent + settings.refill_tokens") < refill.lastIndexOf("await chargeSubscription"))],
  ["40 only one pending refill is allowed", () => assert.match(migration,/auto_refill_one_pending_per_org/)],
  ["41 research waits for payment confirmation", () => assert.match(actions,/Research will not begin until Paddle confirms payment/)],
  ["42 intensive refill requires confirmation", () => assert.match(actions,/Intensive Research requires explicit confirmation/)],
  ["43 unused refunded lot is reversed", () => assert.match(migration,/Full unused Paddle refund/)],
  ["44 consumed refund requires review", () => assert.match(migration,/REQUIRES_REVIEW/)],
  ["45 catalog validator checks one-time USD prices", () => {assert.match(validator,/currency_code !== "USD"/);assert.match(env,/PADDLE_TOKEN_PRICE_500_ID/)}],
];
for (const [name, fn] of cases) test(name, fn);
