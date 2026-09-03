import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function provisionClientWorkspace(supabase:SupabaseClient,workspaceName?:string){
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user)throw new Error("Your authenticated session could not be verified.");
  const {data:profile,error:profileError}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(profileError)throw new Error("Your Meridian profile could not be prepared.");
  if(profile?.role==="ADMIN")return null;
  const {data:membership,error:membershipError}=await supabase.from("organization_members").select("organization_id").eq("user_id",user.id).limit(1).maybeSingle();
  if(membershipError)throw new Error("Your Meridian workspace could not be checked.");
  if(membership?.organization_id)return String(membership.organization_id);
  const {data,error}=await supabase.rpc("provision_client_workspace",{workspace_name:workspaceName||null});
  if(error||!data)throw new Error("Your private Meridian workspace could not be prepared.");
  return String(data);
}
