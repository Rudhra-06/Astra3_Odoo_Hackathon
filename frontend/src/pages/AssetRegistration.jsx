import { useState } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";

const CATEGORIES = ["Electronics","Furniture","Vehicles","Equipment"];
const LOCATIONS   = ["HQ - Floor 1","HQ - Floor 2","Warehouse A","Remote"];
const STATUSES    = ["Available","Allocated","Reserved","Under Maintenance","Lost","Retired","Disposed"];

const MOCK_ASSETS = [
  { tag:"AF-0114", name:"Dell Latitude 5420",  category:"Electronics", status:"Allocated",         department:"Engineering", location:"HQ - Floor 2" },
  { tag:"AF-0209", name:"Toyota Innova",        category:"Vehicles",    status:"Reserved",          department:"Admin",       location:"Warehouse A"  },
  { tag:"AF-0031", name:"Ergo Chair",           category:"Furniture",   status:"Available",         department:"-",           location:"HQ - Floor 1" },
  { tag:"AF-0087", name:"Projector EPX200",     category:"Electronics", status:"Under Maintenance", department:"Sales",       location:"HQ - Floor 1" },
];

const card = { background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(15,23,42,0.06)" };

export default function AssetRegistration() {
  const [assets,   setAssets]   = useState(MOCK_ASSETS);
  const [showForm, setShowForm] = useState(false);
  const [filters,  setFilters]  = useState({ query:"", category:"", status:"" });

  const filtered = assets.filter(a => {
    const q = filters.query.toLowerCase();
    return (!q || a.tag.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      && (!filters.category || a.category === filters.category)
      && (!filters.status   || a.status   === filters.status);
  });

  return (
    <Layout title="Asset Registration & Directory">
      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <SearchInput value={filters.query} onChange={v => setFilters(f=>({...f,query:v}))} placeholder="Search tag or name…" width={220} />
          <Select value={filters.category} onChange={v => setFilters(f=>({...f,category:v}))} width={150}>
            <option value="">All categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </Select>
          <Select value={filters.status} onChange={v => setFilters(f=>({...f,status:v}))} width={170}>
            <option value="">All statuses</option>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </Select>
        </div>
        <PrimaryBtn onClick={() => setShowForm(true)}>+ Register Asset</PrimaryBtn>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E2E8F0" }}>
              {["Tag","Asset Name","Category","Department","Location","Status"].map(h=>(
                <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a,i)=>(
              <tr key={a.tag} style={{ borderTop: i>0?"1px solid #F8FAFC":"none", transition:"background 0.1s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"13px 18px" }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600, color:"#2563EB", background:"#EFF6FF", padding:"3px 8px", borderRadius:6 }}>{a.tag}</span>
                </td>
                <td style={{ padding:"13px 18px", fontSize:13, fontWeight:600, color:"#0F172A" }}>{a.name}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:"#64748B" }}>{a.category}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:"#64748B" }}>{a.department}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:"#64748B" }}>{a.location}</td>
                <td style={{ padding:"13px 18px" }}><StatusBadge status={a.status} /></td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={6} style={{ padding:"60px 18px", textAlign:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <p style={{ fontSize:13, color:"#94A3B8", fontWeight:500 }}>No assets match those filters.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && <RegisterModal onClose={()=>setShowForm(false)} onSubmit={a=>{setAssets(p=>[a,...p]);setShowForm(false);}} />}
    </Layout>
  );
}

function RegisterModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name:"", category:CATEGORIES[0], serialNumber:"", acquisitionDate:"", acquisitionCost:"", condition:"Good", location:LOCATIONS[0], bookable:false });
  const [saving, setSaving] = useState(false);
  const u = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true);
    try {
      const created = await api.registerAsset(form).catch(()=>({ tag:`AF-${Math.floor(1000+Math.random()*8999)}`, ...form, status:"Available", department:"-" }));
      onSubmit(created);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(15,23,42,0.45)", backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(15,23,42,0.22)", animation:"scaleIn 0.15s ease-out both" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 26px", borderBottom:"1px solid #E2E8F0" }}>
          <div>
            <p style={{ fontSize:16, fontWeight:800, color:"#0F172A", letterSpacing:"-0.02em" }}>Register Asset</p>
            <p style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Add a new asset to the directory</p>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748B", fontSize:16 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:16 }}>
          <MField label="Asset name"><MInput required value={form.name} onChange={e=>u("name",e.target.value)} placeholder="e.g. Dell Latitude 5420" /></MField>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <MField label="Category"><MSelect value={form.category} onChange={e=>u("category",e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</MSelect></MField>
            <MField label="Serial number"><MInput value={form.serialNumber} onChange={e=>u("serialNumber",e.target.value)} placeholder="Optional" /></MField>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <MField label="Acquisition date"><MInput type="date" value={form.acquisitionDate} onChange={e=>u("acquisitionDate",e.target.value)} /></MField>
            <MField label="Acquisition cost"><MInput type="number" value={form.acquisitionCost} onChange={e=>u("acquisitionCost",e.target.value)} placeholder="For reports only" /></MField>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <MField label="Condition"><MSelect value={form.condition} onChange={e=>u("condition",e.target.value)}>{["New","Good","Fair","Poor"].map(c=><option key={c}>{c}</option>)}</MSelect></MField>
            <MField label="Location"><MSelect value={form.location} onChange={e=>u("location",e.target.value)}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</MSelect></MField>
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", background:"#F8FAFC", borderRadius:10, border:"1px solid #E2E8F0" }}>
            <input type="checkbox" checked={form.bookable} onChange={e=>u("bookable",e.target.checked)} style={{ width:16, height:16, accentColor:"#2563EB" }} />
            <span style={{ fontSize:13, color:"#475569", fontWeight:500 }}>Shared / bookable resource</span>
          </label>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid #F1F5F9" }}>
            <button type="button" onClick={onClose} style={{ height:40, padding:"0 18px", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, fontSize:13, fontWeight:600, color:"#64748B", cursor:"pointer" }}>Cancel</button>
            <button disabled={saving} style={{ height:40, padding:"0 20px", background: saving?"#93C5FD":"#2563EB", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", cursor: saving?"not-allowed":"pointer", boxShadow:"0 2px 8px rgba(37,99,235,0.25)" }}>
              {saving ? "Saving…" : "Register Asset"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

const iStyle = { width:"100%", height:40, padding:"0 12px", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:9, fontSize:13, color:"#0F172A", outline:"none", boxSizing:"border-box", transition:"all 0.15s" };
const iFocus = e => { e.target.style.borderColor="#2563EB"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.12)"; };
const iBlur  = e => { e.target.style.borderColor="#E2E8F0"; e.target.style.background="#F8FAFC"; e.target.style.boxShadow="none"; };

function MInput({ type="text", value, onChange, placeholder, required }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={iStyle} onFocus={iFocus} onBlur={iBlur} />;
}
function MSelect({ value, onChange, children }) {
  return <select value={value} onChange={onChange} style={{ ...iStyle, appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 }} onFocus={iFocus} onBlur={iBlur}>{children}</select>;
}
function MField({ label, children }) {
  return <div style={{ display:"flex", flexDirection:"column", gap:6 }}><label style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>{children}</div>;
}
function SearchInput({ value, onChange, placeholder, width }) {
  return (
    <div style={{ position:"relative" }}>
      <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...iStyle, width, paddingLeft:30 }} onFocus={iFocus} onBlur={iBlur} />
    </div>
  );
}
function Select({ value, onChange, width, children }) {
  return <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...iStyle, width, appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 }} onFocus={iFocus} onBlur={iBlur}>{children}</select>;
}
function PrimaryBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ height:40, padding:"0 18px", background:"#2563EB", border:"none", borderRadius:10, fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer", whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(37,99,235,0.25)", transition:"all 0.15s" }} onMouseEnter={e=>e.currentTarget.style.background="#1D4ED8"} onMouseLeave={e=>e.currentTarget.style.background="#2563EB"}>{children}</button>;
}
