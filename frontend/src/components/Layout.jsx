import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ title, notificationCount, children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} notificationCount={notificationCount} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}