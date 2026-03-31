import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import NotificationDropdown from "../ui/NotificationDropdown";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/symptoms": "AI Symptom Checker",
  "/doctors": "Find & Book Doctors",
  "/costs": "Cost Comparison",
  "/community": "Community Health Network",
  "/emergency": "Emergency",
  "/records": "Medical Records",
};

export default function TopBar() {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const pathname = routerState.location.pathname;
  const title = pageTitles[pathname] || "CareConnect X";

  const userName = localStorage.getItem("ccx_user_name") || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="h-16 flex items-center gap-4 px-6 flex-shrink-0"
      style={{
        background: "rgba(8, 8, 8, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h1 className="text-lg font-bold text-white flex-1">{title}</h1>

      <div className="relative hidden md:flex items-center">
        <Search size={14} className="absolute left-3 text-[#888888]" />
        <input
          data-ocid="topbar.search_input"
          placeholder="Find doctors, services…"
          className="pl-9 pr-4 py-2 rounded-full text-xs bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#cccccc] placeholder-[#888888] outline-none focus:border-[rgba(249,168,201,0.4)] w-52 transition-all"
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => navigate({ to: "/doctors" })}
          title="Book an Appointment"
          className="p-2 rounded-xl text-[#cccccc] hover:text-pink-300 hover:bg-[rgba(249,168,201,0.1)] transition-all"
        >
          <Calendar size={18} />
        </button>
        <NotificationDropdown />
        <button
          type="button"
          data-ocid="topbar.theme.toggle"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#cccccc] hover:text-pink-300 hover:bg-[rgba(249,168,201,0.1)] transition-all"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div
        className="flex items-center gap-2.5 pl-3"
        style={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-black text-xs font-bold">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-pink-300 border-2 border-[#080808]" />
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-white">{userName}</p>
          <p className="text-[10px] text-pink-300">Online</p>
        </div>
      </div>
    </header>
  );
}
