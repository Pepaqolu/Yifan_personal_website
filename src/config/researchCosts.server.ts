import "server-only";
function optionalNumber(value:string|undefined){if(!value)return null;const parsed=Number(value);return Number.isFinite(parsed)&&parsed>=0?parsed:null;}
export const providerCostConfig={braveSearch:{provider:"brave",service:"web_search",costPerRequestUsd:optionalNumber(process.env.BRAVE_SEARCH_COST_PER_REQUEST_USD),costType:"ESTIMATED" as const,pricingVersion:process.env.BRAVE_SEARCH_PRICING_VERSION||null,pricingSource:process.env.BRAVE_SEARCH_PRICING_SOURCE||null}};
