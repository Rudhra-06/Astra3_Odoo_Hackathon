import { useState } from "react";
import Layout from "../components/Layout";
import { formatDate, isOverdue } from "../utils/dateUtils";

const MOCK_ALLOCATIONS = [
  { assetTag:"AF-0114", assetName:"Dell Latitude 5420", holder:"Priya Sharma",    department:"Engineering", expectedReturn:"2026-07-08" },
  { assetTag:"AF-0209", assetName:"Toyota Innova",      holder:"Operations Dept", department:"Operations",  expectedReturn:"2026-08-01" },
];
const EMPLOYEES = ["Priya Sharma","Raj Nair","Arjun Mehta","Sana Iyer"];

const iS = { width:"100%", height:40, padding:"0 12px", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:9, fontSize:13, color:"#0F172A", outline:"none", boxSizing:"border-box", transition:"all 0.15s" };
const onF = e=>{ e.target.style.borderColor="#2563EB"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.12)"; };
const onB = e=>{ e.target.style.borderColor="#E2E8F0"; e.target.style.background="#F8FAFC"; e.target.style.boxShadow="none"; };

function Field({ label, children }) {
  return <div style={{ display:"flex", flexDirection:"column", gap:6 }}><label style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>{children}</div>;
}

export default function AssetAllocation() {
  const [allocations,       setAllocations]       = useState(MOCK_ALLOCATIONS);
  const [form,              setForm]              = useState({ assetTag:"", employee:"", expectedReturn:"" });
  const [conflict,          setConflict]          = useState(null);
  const [transferRequested, setTransferRequested] = useState(false);

  function handleAllocate(e) {
    e.preventDefault(); setTransferRequested(false);
    const existing = allocations.find(a => a.assetTag === form.assetTag.trim().toUpperCase());
    if (existing) { setConflict(existing); return; }
    setConflict(null);
    setAllocations(p => [...p, { assetTag:form.assetTag.trim().toUpperCase(), assetName:"New allocation", holder:form.employee, department:"-", expectedReturn:form.expectedReturn }]);
    setForm({ assetTag:"", employee:"", expectedReturn:"" });
  }

  return (
    <Layout title="Asset Allocation & Transfer">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(15,23,42,0.06)", overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:"#0F172A", letterSpacing:"-0.01em" }}>Current Allocations</p>
              <p style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{allocations.length} active allocation{allocations.length !== 1 ? "s" : ""}</p>
            </div>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:99, background:"#EFF6FF", color:"#2563EB" }}>{allocations.length} active</span>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E2E8F0" }}>
                {["Asset","Held by","Department","Expected Return","Action"].map(h=>(
                  <th key={h} style={{ padding:"11px 18px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allocations.map((a,i)=>{
                const od = isOverdue(a.expectedReturn);
                return (
                  <tr key={a.assetTag} style={{ borderTop:i>0?"1px solid #F8FAFC":"none", transition:"background 0.1s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"13px 18px" }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600, color:"#2563EB", background:"#EFF6FF", padding:"2px 8px", borderRadius:6, display:"inline-block", width:"fit-content" }}>{a.assetTag}</span>
                        <span style={{ fontSize:12, color:"#94A3B8" }}>{a.assetName}</span>
                      </div>
                    </td>
                    <td style={{ padding:"13px 18px", fontSize:13, fontWeight:500, color:"#0F172A" }}>{a.holder}</td>
                    <td style={{ padding:"13px 18px", fontSize:13, color:"#64748B" }}>{a.department}</td>
                    <td style={{ padding:"13px 18px" }}>
                      <span style={{ fontSize:12, fontWeight:600, color: od?"#DC2626":"#64748B", background: od?"#FEF2F2":"transparent", padding: od?"2px 8px":"0", borderRadius: od?99:0 }}>
                        {formatDate(a.expectedReturn)}{od?" · Overdue":""}
                      </span>
                    </td>
                    <td style={{ padding:"13px 18px" }}>
                      <button onClick={()=>setAllocations(p=>p.filter(x=>x.assetTag!==a.assetTag))}
                        style={{ fontSize:12, fontWeight:600, color:"#16A34A", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:7, padding:"4px 12px", cursor:"pointer", transition:"all 0.15s" }}
                        onMouseEnter={e=>{ e.currentTarget.style.background="#DCFCE7"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background="#F0FDF4"; }}>
                        Mark returned
                      </button>
                    </td>
                  </tr>
                );
              })}
              {allocations.length===0 && (
                <tr><td colSpan={5} style={{ padding:"60px 18px", textAlign:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p style={{ fontSize:13, color:"#94A3B8" }}>No active allocations.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <form onSubmit={handleAllocate} style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(15,23,42,0.06)", overflow:"hidden", height:"fit-content" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid #E2E8F0" }}>
            <p style={{ fontSize:15, fontWeight:700, color:"#0F172A", letterSpacing:"-0.01em" }}>Allocate Asset</p>
            <p style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Assign an asset to an employee</p>
          </div>
          <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Asset tag">
              <input required placeholder="AF-0114" value={form.assetTag} onChange={e=>setForm(f=>({...f,assetTag:e.target.value}))}
                style={{ ...iS, fontFamily:"'IBM Plex Mono',monospace" }} onFocus={onF} onBlur={onB} />
            </Field>
            <Field label="Employee">
              <select required value={form.employee} onChange={e=>setForm(f=>({...f,employee:e.target.value}))}
                style={{ ...iS, appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 }}
                onFocus={onF} onBlur={onB}>
                <option value="">Select employee</option>
                {EMPLOYEES.map(e=><option key={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Expected return (optional)">
              <input type="date" value={form.expectedReturn} onChange={e=>setForm(f=>({...f,expectedReturn:e.target.value}))}
                style={iS} onFocus={onF} onBlur={onB} />
            </Field>

            <button type="submit" style={{ height:42, background:"#2563EB", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", boxShadow:"0 2px 8px rgba(37,99,235,0.25)", transition:"all 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#1D4ED8"}
              onMouseLeave={e=>e.currentTarget.style.background="#2563EB"}>
              Allocate Asset
            </button>

            {conflict && (
              <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p style={{ fontSize:12, color:"#92400E", lineHeight:1.5 }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{conflict.assetTag}</span> is held by <strong>{conflict.holder}</strong>.
                  </p>
                </div>
                {transferRequested ? (
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#16A34A", fontWeight:600 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Transfer request sent — awaiting approval.
                  </div>
                ) : (
                  <button type="button" onClick={()=>setTransferRequested(true)}
                    style={{ height:34, padding:"0 14px", background:"#D97706", border:"none", borderRadius:8, fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#B45309"}
                    onMouseLeave={e=>e.currentTarget.style.background="#D97706"}>
                    Request Transfer
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}
