import { useState } from "react";
import Layout from "../components/Layout";
import ResourceCalendar from "../components/ResourceCalendar";
import StatusBadge from "../components/StatusBadge";

const RESOURCES = ["Room B2","Room A1","Company Vehicle - Innova","Projector Cart"];
const ICONS = {
  "Room B2":                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  "Room A1":                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  "Company Vehicle - Innova":  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  "Projector Cart":            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></svg>,
};

const INITIAL_BOOKINGS = {
  "Room B2":                   [{ id:1, title:"Team Standup",  start:"2026-07-13T09:00", end:"2026-07-13T10:00", bookedBy:"Priya Sharma" }],
  "Room A1":                   [],
  "Company Vehicle - Innova":  [{ id:2, title:"Client Visit",  start:"2026-07-13T13:00", end:"2026-07-13T15:00", bookedBy:"Arjun Mehta"  }],
  "Projector Cart":            [],
};

export default function ResourceBooking() {
  const [resource,           setResource]           = useState(RESOURCES[0]);
  const [bookingsByResource, setBookingsByResource] = useState(INITIAL_BOOKINGS);
  const [confirmed,          setConfirmed]          = useState(null);

  function handleCreateBooking({ start, end }) {
    const nb = { id:Date.now(), title:"New Booking", start, end, bookedBy:"You" };
    setBookingsByResource(p => ({ ...p, [resource]:[...p[resource], nb] }));
    setConfirmed(nb);
  }

  const bookings = bookingsByResource[resource] || [];
  const bookedCount = bookings.length;

  return (
    <Layout title="Resource Booking">
      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:20 }}>

        {/* Resource list */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(15,23,42,0.06)", overflow:"hidden", height:"fit-content" }}>
          <div style={{ padding:"16px 18px", borderBottom:"1px solid #E2E8F0" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>Resources</p>
            <p style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Select to view schedule</p>
          </div>
          <div style={{ padding:"10px 10px" }}>
            {RESOURCES.map(r => {
              const active = resource === r;
              const count  = (bookingsByResource[r]||[]).length;
              return (
                <button key={r} onClick={()=>{ setResource(r); setConfirmed(null); }}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", gap:10,
                    padding:"10px 12px", borderRadius:10, marginBottom:2,
                    background: active ? "#EFF6FF" : "transparent",
                    border: active ? "1px solid #BFDBFE" : "1px solid transparent",
                    cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                    color: active ? "#2563EB" : "#475569",
                  }}
                  onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="#F8FAFC"; e.currentTarget.style.borderColor="#E2E8F0"; }}}
                  onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}}
                >
                  <span style={{ opacity: active ? 1 : 0.5, flexShrink:0 }}>{ICONS[r]}</span>
                  <span style={{ fontSize:12, fontWeight: active ? 700 : 500, flex:1, lineHeight:1.3 }}>{r}</span>
                  {count > 0 && (
                    <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:99, background: active?"#BFDBFE":"#F1F5F9", color: active?"#1D4ED8":"#64748B", flexShrink:0 }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar area */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Resource header */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(15,23,42,0.06)", padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", color:"#2563EB" }}>
                {ICONS[resource]}
              </div>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:"#0F172A", letterSpacing:"-0.01em" }}>{resource}</p>
                <p style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{bookedCount} booking{bookedCount!==1?"s":""} today</p>
              </div>
            </div>
            <StatusBadge status={bookedCount > 0 ? "Allocated" : "Available"} />
          </div>

          {/* Confirmation */}
          {confirmed && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#15803D" }}>Booking confirmed</p>
                  <p style={{ fontSize:12, color:"#16A34A", marginTop:1 }}>
                    {resource} · {new Date(confirmed.start).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} – {new Date(confirmed.end).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                  </p>
                </div>
              </div>
              <StatusBadge status="Upcoming" />
            </div>
          )}

          <ResourceCalendar date="2026-07-13" bookings={bookings} onCreateBooking={handleCreateBooking} />
        </div>
      </div>
    </Layout>
  );
}
