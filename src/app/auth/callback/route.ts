import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { provisionClientWorkspace } from "@/lib/china-desk/provision";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") || "/meridian/app";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/meridian/app";
      if(destination.startsWith("/meridian/app")){
        try{await provisionClientWorkspace(supabase);}catch{return NextResponse.redirect(new URL("/meridian/signup?error=workspace",request.url));}
      }
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL("/meridian/signup?error=verification", request.url));
}
