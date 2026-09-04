export const tokenPacks={5:{tokens:5,usd:5,label:"Quick top-up",autoRefill:false},20:{tokens:20,usd:20,label:"Top-up",autoRefill:true},50:{tokens:50,usd:50,label:"Popular",autoRefill:true},100:{tokens:100,usd:100,label:"Extended research",autoRefill:true},250:{tokens:250,usd:250,label:"Larger program",autoRefill:true},500:{tokens:500,usd:500,label:"Manual purchase",autoRefill:false}} as const;
export const activationOffer={productName:"Meridian Pay-as-you-go",tokenGrant:20,promoDays:14,recurringPriceUsd:0,autoRefillEnabled:false} as const;
export type TokenPack=keyof typeof tokenPacks;
export const autoRefillTriggers=[5,10,20] as const;
export const autoRefillPacks=[20,50,100,250] as const;
export const autoRefillCaps=[50,100,250,500] as const;
export const autoRefillDefaults={triggerTokens:10,refillTokens:50,monthlyCapUsd:100,enabled:false,consentVersion:"2026-09-04"} as const;
export function isTokenPack(value:number):value is TokenPack{return value in tokenPacks;}
