const env = process.env.PADDLE_ENV === "live" ? "live" : "sandbox";
const apiBase = env === "live" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
const expected = [
  ["PADDLE_TOKEN_PRICE_5_ID", 500], ["PADDLE_TOKEN_PRICE_20_ID", 2000],
  ["PADDLE_TOKEN_PRICE_50_ID", 5000], ["PADDLE_TOKEN_PRICE_100_ID", 10000],
  ["PADDLE_TOKEN_PRICE_250_ID", 25000], ["PADDLE_TOKEN_PRICE_500_ID", 50000],
];
const apiKey = process.env.PADDLE_API_KEY;
if (!apiKey) throw new Error("PADDLE_API_KEY is required.");
const activationId = process.env.PADDLE_PAYG_PRICE_ID;
if (!activationId) throw new Error("PADDLE_PAYG_PRICE_ID is required.");

async function price(id) {
  const response = await fetch(`${apiBase}/prices/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!response.ok) throw new Error(`Paddle rejected price ${id} (${response.status}).`);
  return (await response.json()).data;
}

const activation = await price(activationId);
if (Number(activation.unit_price?.amount) !== 0 || !activation.billing_cycle) throw new Error("Payment Profile price must be zero-value and recurring.");
for (const [key, amount] of expected) {
  const id = process.env[key];
  if (!id) throw new Error(`${key} is required.`);
  const item = await price(id);
  if (Number(item.unit_price?.amount) !== amount || item.unit_price?.currency_code !== "USD" || item.billing_cycle) throw new Error(`${key} must be a one-time USD price for $${amount / 100}.`);
}
console.log(`Paddle ${env} catalog verified: Payment Profile + six Token packs.`);
