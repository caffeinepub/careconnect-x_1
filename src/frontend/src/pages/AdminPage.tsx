import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Check,
  CheckCircle,
  ChevronLeft,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  adminStats,
  pendingVolunteers,
  specialtyData,
  systemLogs,
  userRegistrationData,
} from "../data/dummyData";

type VolunteerStatus = "pending" | "approved" | "rejected";

export default function AdminPage() {
  const navigate = useNavigate();
  const [volunteerStatuses, setVolunteerStatuses] = useState<
    Record<number, VolunteerStatus>
  >(Object.fromEntries(pendingVolunteers.map((v) => [v.id, "pending"])));

  const maxUserCount = Math.max(...userRegistrationData.map((d) => d.count));
  const maxSpecialtyCount = Math.max(...specialtyData.map((d) => d.count));

  const logColors: Record<string, string> = {
    info: "#f9a8c9",
    update: "#f9a8c9",
    alert: "#FF4D5A",
    success: "#f9a8c9",
  };

  const statValues = [
    {
      icon: Users,
      label: "Total Users",
      value: adminStats.totalUsers.toLocaleString(),
      color: "#f9a8c9",
      bg: "rgba(249,168,201,0.1)",
    },
    {
      icon: UserRound,
      label: "Doctors",
      value: adminStats.doctors,
      color: "#f9a8c9",
      bg: "rgba(249,168,201,0.1)",
    },
    {
      icon: Activity,
      label: "Active Requests",
      value: adminStats.activeRequests,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      icon: CheckCircle,
      label: "Resolved Cases",
      value: adminStats.resolvedCases.toLocaleString(),
      color: "#f9a8c9",
      bg: "rgba(249,168,201,0.1)",
    },
  ];

  const specialtyColors = [
    "#f9a8c9",
    "#f9a8c9",
    "#f9a8c9",
    "#A78BFA",
    "#F97316",
    "#EC4899",
  ];
  const volunteerColors = [
    "#f9a8c9",
    "#f9a8c9",
    "#f9a8c9",
    "#A78BFA",
    "#F97316",
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #050810 0%, #080E1A 100%)",
      }}
    >
      <header
        className="flex items-center justify-between px-6 h-16"
        style={{
          background: "rgba(8,14,26,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(160,190,210,0.08)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            data-ocid="admin.back.button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#f9a8c9] transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f9a8c9] to-[#f9a8c9] flex items-center justify-center">
              <HeartPulse size={16} className="text-[#0d0d0d]" />
            </div>
            <p className="text-sm font-bold text-[#ffffff]">
              CareConnect <span className="text-[#f9a8c9]">X</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#f9a8c9]" />
          <span className="text-sm font-semibold text-[#ffffff]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-[#ffffff]">
            System Dashboard
          </h2>
          <p className="text-sm text-[#888888] mt-1">
            Monitor platform activity and manage users
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statValues.map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-5 hover:scale-[1.02] transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: stat.bg }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-[#ffffff]">{stat.value}</p>
              <p className="text-xs text-[#888888] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <LayoutDashboard size={16} className="text-[#f9a8c9]" />
              <p className="text-sm font-semibold text-[#ffffff]">
                User Registrations
              </p>
              <span className="text-xs text-[#888888] ml-auto">
                Last 6 months
              </span>
            </div>
            <div className="flex items-end gap-2 h-32">
              {userRegistrationData.map((d) => (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[9px] text-[#888888]">{d.count}</span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(d.count / maxUserCount) * 96}px`,
                      background:
                        "linear-gradient(180deg, #f9a8c9, rgba(249,168,201,0.3))",
                      boxShadow: "0 -2px 8px rgba(249,168,201,0.3)",
                    }}
                  />
                  <span className="text-[9px] text-[#888888]">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-[#ffffff] mb-5">
              Doctor Specialties
            </p>
            <div className="space-y-3">
              {specialtyData.map((d, i) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#cccccc]">{d.name}</span>
                    <span className="text-[#888888]">{d.count}</span>
                  </div>
                  <div
                    className="h-2 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.count / maxSpecialtyCount) * 100}%`,
                        background: specialtyColors[i % specialtyColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-[#ffffff] mb-4">
            Pending Volunteer Approvals
          </p>
          <div className="space-y-3">
            {pendingVolunteers.map((v, idx) => (
              <div
                key={v.id}
                data-ocid={`admin.volunteer.item.${idx + 1}`}
                className="flex items-center gap-4 p-3 rounded-xl"
                style={{
                  border: "1px solid rgba(160,190,210,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#0d0d0d] text-xs font-bold flex-shrink-0"
                  style={{
                    background: volunteerColors[idx % volunteerColors.length],
                  }}
                >
                  {v.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#ffffff] truncate">
                    {v.name}
                  </p>
                  <p className="text-xs text-[#888888]">
                    {v.skill} · {v.location} · {v.applied}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {volunteerStatuses[v.id] === "pending" ? (
                    <>
                      <button
                        type="button"
                        data-ocid={`admin.volunteer.confirm_button.${idx + 1}`}
                        onClick={() =>
                          setVolunteerStatuses((p) => ({
                            ...p,
                            [v.id]: "approved",
                          }))
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{
                          background: "rgba(249,168,201,0.15)",
                          color: "#f9a8c9",
                          border: "1px solid rgba(249,168,201,0.3)",
                        }}
                      >
                        <Check size={12} />
                        Approve
                      </button>
                      <button
                        type="button"
                        data-ocid={`admin.volunteer.delete_button.${idx + 1}`}
                        onClick={() =>
                          setVolunteerStatuses((p) => ({
                            ...p,
                            [v.id]: "rejected",
                          }))
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{
                          background: "rgba(255,77,90,0.15)",
                          color: "#FF4D5A",
                          border: "1px solid rgba(255,77,90,0.3)",
                        }}
                      >
                        <X size={12} />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{
                        background:
                          volunteerStatuses[v.id] === "approved"
                            ? "rgba(249,168,201,0.15)"
                            : "rgba(255,77,90,0.15)",
                        color:
                          volunteerStatuses[v.id] === "approved"
                            ? "#f9a8c9"
                            : "#FF4D5A",
                      }}
                    >
                      {volunteerStatuses[v.id] === "approved"
                        ? "✓ Approved"
                        : "✕ Rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-[#ffffff] mb-4">
            Recent System Logs
          </p>
          <div className="space-y-2">
            {systemLogs.map((log, idx) => (
              <div
                key={log.id}
                data-ocid={`admin.log.item.${idx + 1}`}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ background: logColors[log.type] }}
                />
                <p className="flex-1 text-xs text-[#cccccc]">{log.event}</p>
                <span className="text-[10px] text-[#888888] flex-shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center py-4">
          <p className="text-xs text-[#888888]">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-[#f9a8c9] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
