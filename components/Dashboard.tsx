"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Ambulance, Bell, CheckCircle2, Clock3, HeartPulse, Hospital, MapPin, Phone, ShieldCheck, Siren, Users, Plus, ArrowUpRight } from "lucide-react";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });
type Incident = { id:string; student_name:string; contact:string; category:string; description:string; severity:"critical"|"high"|"medium"|"low"; priority:string; priority_score:number; latitude:number|null; longitude:number|null; status:string; created_at:string };
const places = [
  {name:"Campus Health Centre",type:"Medical centre",lat:30.3549,lon:76.3634,address:"Sample campus location"},
  {name:"Civil Hospital Patiala",type:"Hospital",lat:30.3398,lon:76.3869,address:"Patiala, Punjab"},
  {name:"Emergency Pharmacy",type:"Pharmacy",lat:30.3605,lon:76.3702,address:"Sample nearby pharmacy"}
];
const demoIncidents: Incident[] = [
  {id:"DEMO-1042",student_name:"Aarav Sharma",contact:"98XXXXXX21",category:"Injury / fall",description:"Needs assistance near the library.",severity:"high",priority:"HIGH",priority_score:75,latitude:30.356,longitude:76.364,status:"Open",created_at:new Date(Date.now()-8*60000).toISOString()},
  {id:"DEMO-1041",student_name:"Meera K.",contact:"98XXXXXX64",category:"General medical help",description:"Feeling dizzy near the academic block.",severity:"medium",priority:"MEDIUM",priority_score:45,latitude:30.352,longitude:76.360,status:"Assigned",created_at:new Date(Date.now()-25*60000).toISOString()}
];

export default function Dashboard() {
  const [tab,setTab] = useState<"overview"|"request"|"incidents"|"facilities">("overview");
  const [incidents,setIncidents] = useState<Incident[]>(demoIncidents);
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");
  const [isAdmin,setIsAdmin] = useState(false);
  const [adminKey,setAdminKey] = useState("");
  const [form,setForm] = useState({name:"",contact:"",category:"Injury / fall",severity:"medium",description:""});
  const [location,setLocation] = useState<{latitude:number;longitude:number}|null>(null);

  const refresh = async () => {
    try { const r=await fetch("/api/incidents"); const d=await r.json(); if(r.ok && Array.isArray(d.incidents)) setIncidents(d.incidents); } catch {}
  };
  useEffect(()=>{ refresh(); const t=setInterval(refresh,20000); return ()=>clearInterval(t); },[]);
  const counts = useMemo(()=>({open:incidents.filter(x=>x.status==="Open").length,critical:incidents.filter(x=>x.priority==="CRITICAL" && x.status!=="Resolved").length,resolved:incidents.filter(x=>x.status==="Resolved").length}),[incidents]);

  const captureLocation = () => {
    if(!navigator.geolocation){setMessage("Your browser does not support location access.");return;}
    setMessage("Requesting location permission…");
    navigator.geolocation.getCurrentPosition(p=>{setLocation({latitude:p.coords.latitude,longitude:p.coords.longitude});setMessage("Location attached to your request.");},()=>setMessage("Location unavailable. You can still submit without it."),{enableHighAccuracy:true,timeout:10000});
  };
  const submitSOS = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const r=await fetch("/api/incidents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,...location})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Unable to submit request");
      setMessage(`Request ${d.incident.id} submitted. Keep your phone available.`);
      setForm({name:"",contact:"",category:"Injury / fall",severity:"medium",description:""}); setLocation(null); setTab("incidents"); await refresh();
    } catch(err) { setMessage(err instanceof Error?err.message:"Something went wrong."); }
    finally {setLoading(false);}
  };
  const updateStatus = async(id:string,status:string) => {
    try { const r=await fetch(`/api/incidents/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-key":adminKey},body:JSON.stringify({status})}); const d=await r.json(); if(!r.ok) throw new Error(d.error); await refresh(); }
    catch(e){setMessage(e instanceof Error?e.message:"Could not update status.");}
  };
  const nav=[["overview","Overview"],["request","Request help"],["incidents","Incidents"],["facilities","Medical facilities"]] as const;
  return <main className="shell">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><HeartPulse size={25}/></div><div><div className="text-xl font-black tracking-tight">MedAlert<span className="text-red-500">.</span></div><div className="text-xs text-slate-500">Campus Emergency Assistance</div></div></div>
      <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500"/> System operational</div>
    </header>
    <section className="mb-6 rounded-3xl bg-[#172033] p-6 text-white md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-xl"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-red-300"><ShieldCheck size={15}/> Your campus safety companion</div><h1 className="text-3xl font-black leading-tight md:text-4xl">Help is closer<br/>than you think.</h1><p className="mt-3 max-w-md text-sm leading-6 text-slate-300">Request medical assistance, share your location and help campus responders prioritize urgent situations.</p></div>
        <button onClick={()=>setTab("request")} className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[7px] border-red-300/20 bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,.12)] transition hover:scale-105"><Siren size={32}/><span className="mt-2 text-2xl font-black">SOS</span><span className="text-[10px] font-bold uppercase tracking-widest">Get help</span></button>
      </div>
      <p className="mt-7 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">If someone is in immediate danger, call local emergency services (India: 112) first. MedAlert is a campus coordination tool, not an emergency dispatch service.</p>
    </section>

    <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
      {nav.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab===id?"bg-slate-900 text-white":"text-slate-500 hover:bg-slate-100"}`}>{label}</button>)}
    </nav>

    {message && <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
    {tab==="overview" && <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Activity/>} label="Active requests" value={String(incidents.filter(x=>x.status!=="Resolved").length)} note="Currently being tracked"/>
        <Stat icon={<AlertTriangle/>} label="Critical priority" value={String(counts.critical)} note="Requires urgent attention" red/>
        <Stat icon={<Clock3/>} label="Open incidents" value={String(counts.open)} note="Awaiting response"/>
        <Stat icon={<CheckCircle2/>} label="Resolved" value={String(counts.resolved)} note="Marked as completed"/>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.8fr]">
        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold">Nearby medical support</h2><p className="mt-1 text-xs text-slate-500">Sample campus facilities — verify details before relying on them.</p></div><button className="btn btn-light text-xs" onClick={()=>setTab("facilities")}>View map <ArrowUpRight size={14}/></button></div><MapPanel places={places}/></section>
        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold">Recent incidents</h2><button onClick={()=>setTab("incidents")} className="text-xs font-bold text-red-600">View all</button></div><div className="space-y-3">{incidents.slice(0,4).map(i=><IncidentRow key={i.id} incident={i}/>)}</div>{incidents.length===0&&<Empty text="No incidents reported yet."/>}</section>
      </div>
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <Quick icon={<Phone/>} title="Emergency helpline" value="112" detail="India — national emergency number"/>
        <Quick icon={<Hospital/>} title="Medical support" value="Campus health centre" detail="Confirm campus operating hours"/>
        <Quick icon={<Users/>} title="Campus response" value="Contact your security desk" detail="Use your institution's verified number"/>
      </section>
    </>}
    {tab==="request" && <div className="mx-auto max-w-3xl card p-6 md:p-8"><div className="mb-6"><div className="mb-2 inline-flex rounded-full bg-red-50 p-3 text-red-600"><Siren/></div><h2 className="text-2xl font-black">Request medical assistance</h2><p className="mt-1 text-sm text-slate-500">Share accurate details so the campus response team can assess your request.</p></div>
      <form onSubmit={submitSOS} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2"><div><label className="label">Your name *</label><input required className="field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></div><div><label className="label">Contact number *</label><input required className="field" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone number" inputMode="tel" minLength={7}/></div></div>
        <div className="grid gap-4 md:grid-cols-2"><div><label className="label">Type of assistance *</label><select className="field" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Injury / fall</option><option>Breathing difficulty</option><option>Unconsciousness</option><option>Severe bleeding</option><option>Cardiac concern</option><option>Fever / illness</option><option>General medical help</option><option>Other</option></select></div><div><label className="label">Urgency level *</label><select className="field" value={form.severity} onChange={e=>setForm({...form,severity:e.target.value as typeof form.severity})}><option value="low">Low — non-urgent</option><option value="medium">Medium — needs attention</option><option value="high">High — urgent</option><option value="critical">Critical — life-threatening</option></select></div></div>
        <div><label className="label">What happened? *</label><textarea required rows={4} className="field resize-y" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Briefly describe the situation and your exact campus location…"/></div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-bold">Attach your current location</div><div className="mt-1 text-xs text-slate-500">{location?`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`:"Location is optional and only shared when you choose to attach it."}</div></div><button type="button" onClick={captureLocation} className="btn btn-light text-xs"><MapPin size={15}/> {location?"Refresh location":"Share location"}</button></div></div>
        <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">For a life-threatening emergency, call 112 immediately. Submitting this form does not contact an ambulance or guarantee an immediate response.</div>
        <button disabled={loading} className="btn btn-primary w-full py-3.5 disabled:opacity-60">{loading?"Submitting request…": "Submit emergency request"}</button>
      </form>
    </div>}
    {tab==="incidents" && <section className="card p-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Incident management</h2><p className="mt-1 text-sm text-slate-500">Requests are sorted by urgency when retrieved from the database.</p></div><button className="btn btn-light text-xs" onClick={refresh}>Refresh <Activity size={14}/></button></div>
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="mb-2 text-sm font-bold">Responder / admin controls</div><div className="flex flex-wrap gap-2"><input className="field max-w-sm" type="password" placeholder="Admin access key" value={adminKey} onChange={e=>setAdminKey(e.target.value)}/><span className="self-center text-xs text-slate-500">Required to update incident status.</span></div></div>
      <div className="space-y-3">{incidents.map(i=><div key={i.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><b>{i.student_name}</b><Priority value={i.priority}/><span className="text-xs text-slate-400">{i.id}</span></div><p className="mt-1 text-sm text-slate-600">{i.category} · {i.description}</p><p className="mt-2 text-xs text-slate-400">{new Date(i.created_at).toLocaleString()} · Contact: {i.contact}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold">{i.status}</span><select className="field !w-auto !py-2 text-xs" value={i.status} onChange={e=>updateStatus(i.id,e.target.value)}><option>Open</option><option>Assigned</option><option>Resolved</option></select></div></div></div>)}{incidents.length===0&&<Empty text="No incident records found."/ >}</div>
    </section>}
    {tab==="facilities" && <section className="card p-5"><h2 className="mb-1 text-xl font-black">Medical facilities</h2><p className="mb-4 text-sm text-slate-500">Illustrative points around Patiala. Replace these with verified campus and local facility information before launch.</p><MapPanel places={places}/><div className="mt-4 grid gap-3 md:grid-cols-3">{places.map(p=><div className="rounded-xl border border-slate-200 p-4" key={p.name}><div className="font-bold">{p.name}</div><div className="mt-1 text-xs text-slate-500">{p.type}</div><div className="mt-2 text-xs text-slate-400">{p.address}</div></div>)}</div></section>}
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400"><span>© {new Date().getFullYear()} MedAlert · Campus safety coordination</span><span>Prototype — not a substitute for emergency services</span></footer>
  </main>;
}
function Stat({icon,label,value,note,red=false}:{icon:React.ReactNode;label:string;value:string;note:string;red?:boolean}){return <div className="card p-5"><div className={`mb-4 inline-flex rounded-xl p-2.5 ${red?"bg-red-50 text-red-600":"bg-slate-100 text-slate-600"}`}>{icon}</div><div className="text-3xl font-black">{value}</div><div className="mt-1 text-sm font-bold">{label}</div><div className="mt-1 text-xs text-slate-400">{note}</div></div>}
function Priority({value}:{value:string}){const c=value==="CRITICAL"?"bg-red-100 text-red-700":value==="HIGH"?"bg-orange-100 text-orange-700":value==="MEDIUM"?"bg-amber-100 text-amber-700":"bg-emerald-100 text-emerald-700";return <span className={`pill ${c}`}>{value}</span>}
function IncidentRow({incident:i}:{incident:Incident}){return <div className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3"><div><div className="text-sm font-bold">{i.category}</div><div className="mt-1 text-xs text-slate-500">{i.student_name} · {new Date(i.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div></div><Priority value={i.priority}/></div>}
function Quick({icon,title,value,detail}:{icon:React.ReactNode;title:string;value:string;detail:string}){return <div className="card p-4"><div className="mb-3 text-slate-500">{icon}</div><div className="text-xs text-slate-500">{title}</div><div className="mt-1 font-extrabold">{value}</div><div className="mt-1 text-xs text-slate-400">{detail}</div></div>}
function Empty({text}:{text:string}){return <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{text}</div>}
