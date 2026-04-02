import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ShieldPlus,
  ShoppingBag,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import NotificationDropdown from "../ui/NotificationDropdown";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    badge: null,
  },
  { icon: Stethoscope, label: "AI Checker", path: "/symptoms", badge: null },
  { icon: UserRound, label: "Doctors", path: "/doctors", badge: null },
  { icon: BarChart2, label: "Cost Compare", path: "/costs", badge: null },
  { icon: Users, label: "Community", path: "/community", badge: null },
  { icon: AlertTriangle, label: "Emergency", path: "/emergency", badge: null },
  { icon: FileText, label: "Records", path: "/records", badge: null },
  {
    icon: ShieldPlus,
    label: "First Aid AI",
    path: "/first-aid",
    badge: "FREE",
  },
  { icon: ShoppingBag, label: "Medicine", path: "/medicine", badge: null },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 flex-shrink-0"
      style={{
        width: collapsed ? 72 : 240,
        background: "linear-gradient(180deg, #080808 0%, #060606 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex items-center gap-3 p-4 h-16"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-pink-300 to-pink-400">
          <HeartPulse size={18} className="text-black" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-white whitespace-nowrap">
            CareConnect <span className="text-pink-300">X</span>
          </span>
        )}
      </div>

      <div className="flex justify-end px-3 pt-3">
        <button
          type="button"
          data-ocid="sidebar.toggle"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-[#888888] hover:text-pink-300 hover:bg-[rgba(249,168,201,0.1)] transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-ocid={`sidebar.${item.label.toLowerCase().replace(" ", "_")}.link`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "nav-active"
                  : "text-[#888888] hover:text-[#cccccc] hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap flex-1">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(249,168,201,0.15)",
                    color: "#f9a8c9",
                    border: "1px solid rgba(249,168,201,0.3)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Notification row — placed after nav items, near Dashboard */}
        <div
          className={`flex items-center rounded-xl transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] ${
            collapsed ? "justify-center px-0" : "px-0"
          }`}
        >
          {collapsed ? (
            <NotificationDropdown />
          ) : (
            <div className="flex items-center gap-3 w-full">
              <NotificationDropdown />
              <span className="text-sm font-medium text-[#888888] whitespace-nowrap">
                Notifications
              </span>
            </div>
          )}
        </div>
      </nav>

      <div
        className="p-3 space-y-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/admin" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#888888] hover:text-[#cccccc] hover:bg-[rgba(255,255,255,0.04)] transition-all"
        >
          <ShieldCheck size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Admin</span>}
        </button>
        <button
          type="button"
          data-ocid="sidebar.logout.button"
          onClick={() => navigate({ to: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#888888] hover:text-[#FF4D5A] hover:bg-[rgba(255,77,90,0.08)] transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
