"use server";

import { createClient } from "@/lib/supabase/server";
import { getTrustedSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { provisionClientWorkspace } from "@/lib/china-desk/provision";

export type SignupState={message:string;success?:boolean;awaitingVerification?:boolean;email?:string;destination?:string};
const value=(form:FormData,key:string,max=500)=>String(form.get(key)||"").trim().slice(0,max);
function destination(website:string){return `/meridian/app/onboarding${website?`?website=${encodeURIComponent(website)}`:""}`;}
function messageFor(error:string){const text=error.toLowerCase();if(text.includes("already")||text.includes("registered"))return"An account already uses this email. Sign in instead.";if(text.includes("password"))return"Use a stronger password with at least 10 characters.";if(text.includes("rate")||text.includes("network")||text.includes("fetch"))return"Meridian could not reach the account service. Please try again shortly.";return"Your account could not be created. Please check the details and try again.";}

export async function signUp(_:SignupState,form:FormData):Promise<SignupState>{
  if(!isSupabaseConfigured())return{message:"Meridian account creation is not configured yet."};
  const email=value(form,"email",320).toLowerCase(),password=value(form,"password",200),confirmation=value(form,"confirm_password",200),website=value(form,"website",500);
  if(!/^\S+@\S+\.\S+$/.test(email))return{message:"Enter a valid email address."};
  if(password.length<10)return{message:"Use a password with at least 10 characters."};
  if(password!==confirmation)return{message:"The two passwords do not match."};
  const next=destination(website);const callback=new URL("/auth/callback",getTrustedSiteUrl());callback.searchParams.set("next",next);
  const supabase=await createClient();
  const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:callback.toString()}});
  if(error||!data.user)return{message:messageFor(error?.message||"")};
  if(data.user.identities?.length===0)return{message:"An account already uses this email. Sign in instead."};
  if(data.session){try{await provisionClientWorkspace(supabase);}catch{return{message:"Your account exists, but Meridian could not prepare the private workspace. Sign in and try again."};}return{message:"Your Meridian workspace is ready.",success:true,destination:next,email};}
  return{message:`We sent a verification link to ${email}.`,success:true,awaitingVerification:true,email};
}

export async function resendVerification(_:SignupState,form:FormData):Promise<SignupState>{
  const email=value(form,"email",320).toLowerCase(),website=value(form,"website",500);if(!/^\S+@\S+\.\S+$/.test(email))return{message:"Enter the email used to create your account."};
  const callback=new URL("/auth/callback",getTrustedSiteUrl());callback.searchParams.set("next",destination(website));
  const supabase=await createClient();const {error}=await supabase.auth.resend({type:"signup",email,options:{emailRedirectTo:callback.toString()}});
  if(error)return{message:"We could not resend the verification email. Please wait a moment and try again."};
  return{message:"A new verification email is on its way.",success:true,awaitingVerification:true,email};
}
