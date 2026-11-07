import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function PATCH(req: NextRequest, context: { params: Promise<{id:string}> }) {
  const key = process.env.ADMIN_ACCESS_KEY;
  if (!key || req.headers.get("x-admin-key") !== key)
    return NextResponse.json({ error:"Unauthorized. Configure and provide the admin access key." }, {status:401});
  const { id } = await context.params;
  const { status } = await req.json();
  if (!["Open","Assigned","Resolved"].includes(status))
    return NextResponse.json({error:"Invalid status."},{status:400});
  if (!isSupabaseConfigured || !supabase)
    return NextResponse.json({error:"Status management requires Supabase configuration."},{status:503});
  const {data,error}=await supabase.from("incidents").update({status,updated_at:new Date().toISOString()}).eq("id",id).select("*").single();
  if(error) return NextResponse.json({error:"Unable to update incident."},{status:500});
  return NextResponse.json({incident:data});
}
