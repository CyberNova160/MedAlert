import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { calculatePriority, Severity } from "@/lib/priority";

export const dynamic = "force-dynamic";
const demo: any[] = [];

export async function GET() {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json({ incidents: demo, mode: "demo" });
  const { data, error } = await supabase.from("incidents").select("*").order("priority_score",{ascending:false}).order("created_at",{ascending:false}).limit(100);
  if (error) return NextResponse.json({ error: "Unable to load incidents." }, { status: 500 });
  return NextResponse.json({ incidents: data, mode: "database" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const category = String(body.category || "General medical help").slice(0,80);
    const description = String(body.description || "").trim();
    const severity = String(body.severity || "medium") as Severity;
    if (!name || name.length > 100 || !contact || contact.length > 30 || !description || description.length > 1000)
      return NextResponse.json({ error: "Please provide a valid name, contact number and description." }, { status: 400 });
    if (!["critical","high","medium","low"].includes(severity))
      return NextResponse.json({ error: "Invalid urgency level." }, { status: 400 });
    const lat = Number(body.latitude), lon = Number(body.longitude);
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat)<=90 && Math.abs(lon)<=180;
    const p = calculatePriority(severity, category);
    const incident = {
      student_name:name, contact, category, description, severity,
      priority:p.priority, priority_score:p.score,
      latitude:hasLocation?lat:null, longitude:hasLocation?lon:null, status:"Open"
    };
    let saved:any;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("incidents").insert(incident).select("*").single();
      if (error) return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
      saved = data;
    } else {
      saved = { ...incident, id:`DEMO-${Date.now()}`, created_at:new Date().toISOString() };
      demo.unshift(saved);
    }
    if (process.env.NOTIFICATION_WEBHOOK_URL) {
      try { await fetch(process.env.NOTIFICATION_WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"new_incident",incident:saved})}); } catch {}
    }
    return NextResponse.json({ incident:saved, mode:isSupabaseConfigured?"database":"demo" }, { status:201 });
  } catch {
    return NextResponse.json({ error:"Invalid request." }, { status:400 });
  }
}
