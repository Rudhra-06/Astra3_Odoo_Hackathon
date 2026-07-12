import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ title, notificationCount, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1F5F9" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar title={title} notificationCount={notificationCount} />
        <main style={{ flex: 1, padding: "28px 28px", animation: "fadeUp 0.2s ease-out both" }}>
          {children}
        </main>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
