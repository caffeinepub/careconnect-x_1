import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Loader2,
  Moon,
  Pill,
  Stethoscope,
  UserRound,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import { appointments, prescriptions, recentActivity } from "../data/dummyData";
import { useBluetoothHealth } from "../hooks/useBluetoothHealth";

const activityIcons: Record<string, React.ReactNode> = {
  consultation: <Stethoscope size={14} />,
  record: <FileText size={14} />,
  prescription: <Pill size={14} />,
  checkup: <CheckCircle2 size={14} />,
  community: <Users size={14} />,
};

function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 mr-1.5">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function HeartRateTile({ value }: { value: number | null }) {
  const prevRef = useRef<number | null>(null);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (value !== null && value !== prevRef.current) {
      prevRef.current = value;
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div
      className="rounded-xl p-3 text-center relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center justify-center mb-1">
        {value !== null && <PulsingDot color="#FF6B6B" />}
        <Heart
          size={18}
          style={{ color: "#FF6B6B", opacity: value !== null ? 1 : 0.5 }}
        />
      </div>
      <p
        className="text-sm font-bold transition-all duration-200"
        style={{
          color: value !== null ? "#FF6B6B" : "#888888",
          transform: bump ? "scale(1.2)" : "scale(1)",
          display: "inline-block",
        }}
      >
        {value !== null ? value : "--"}
      </p>
      <p className="text-[10px] text-[#888888] mt-0.5">Heart Rate</p>
      <p className="text-[9px] text-[#4A5568] mt-0.5">
        {value !== null ? "bpm" : "No data"}
      </p>
    </div>
  );
}

function BloodPressureTile({
  systolic,
  diastolic,
}: { systolic: number | null; diastolic: number | null }) {
  const hasData = systolic !== null && diastolic !== null;
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <Activity
        size={18}
        className="mx-auto mb-1"
        style={{ color: "#f9a8c9", opacity: hasData ? 1 : 0.5 }}
      />
      <p
        className="text-sm font-bold"
        style={{ color: hasData ? "#f9a8c9" : "#888888" }}
      >
        {hasData ? `${systolic}/${diastolic}` : "--"}
      </p>
      <p className="text-[10px] text-[#888888] mt-0.5">Blood Pressure</p>
      <p className="text-[9px] text-[#4A5568] mt-0.5">
        {hasData ? "mmHg" : "No data"}
      </p>
    </div>
  );
}

function SleepTile({
  value,
  connected,
  onManualInput,
}: {
  value: number | null;
  connected: boolean;
  onManualInput: (v: number | null) => void;
}) {
  const [inputVal, setInputVal] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputVal(raw);
    const n = Number.parseFloat(raw);
    onManualInput(Number.isFinite(n) && n >= 0 ? n : null);
  };

  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <Moon
        size={18}
        className="mx-auto mb-1"
        style={{
          color: "#A78BFA",
          opacity: value !== null || !connected ? 1 : 0.5,
        }}
      />
      {!connected ? (
        <>
          {value !== null ? (
            <p className="text-sm font-bold" style={{ color: "#A78BFA" }}>
              {value}
            </p>
          ) : (
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={inputVal}
              onChange={handleChange}
              placeholder="hrs"
              className="w-full text-center text-sm font-bold bg-transparent outline-none border-b border-[#A78BFA]/30 focus:border-[#A78BFA] text-[#A78BFA] placeholder:text-[#555] mb-0.5"
              data-ocid="sleep.input"
            />
          )}
        </>
      ) : (
        <p
          className="text-sm font-bold"
          style={{ color: value !== null ? "#A78BFA" : "#888888" }}
        >
          {value !== null ? value : "--"}
        </p>
      )}
      <p className="text-[10px] text-[#888888] mt-0.5">Sleep</p>
      <p className="text-[9px] text-[#4A5568] mt-0.5">
        {value !== null ? "hrs" : connected ? "No data" : "Log manually"}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    heartRate,
    bloodPressure,
    sleep,
    connectionStatus,
    deviceName,
    isSupported,
    errorMessage,
    connect,
    disconnect,
    setSleep,
  } = useBluetoothHealth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  const healthScore = () => {
    if (!isConnected) return null;
    const scores: number[] = [];
    if (heartRate !== null) {
      const hrScore =
        heartRate >= 60 && heartRate <= 100 ? 100 : heartRate < 60 ? 70 : 65;
      scores.push(hrScore);
    }
    if (bloodPressure) {
      const bpScore =
        bloodPressure.systolic < 120 && bloodPressure.diastolic < 80
          ? 100
          : bloodPressure.systolic < 130
            ? 80
            : 60;
      scores.push(bpScore);
    }
    if (sleep !== null) {
      const sleepScore = sleep >= 7 && sleep <= 9 ? 100 : sleep >= 6 ? 80 : 60;
      scores.push(sleepScore);
    }
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const score = healthScore();

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#ffffff]">
            Welcome back, <span className="text-[#f9a8c9]">Alex!</span> 👋
          </h2>
          <p className="text-sm text-[#888888] mt-1">{today}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-6" glowColor="teal">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#888888] font-medium uppercase tracking-wider">
                My Health Overview
              </p>
              <h3 className="text-lg font-bold text-[#ffffff] mt-1">
                Health Score
              </h3>
            </div>
            <span
              className="text-3xl font-bold"
              style={{ color: score !== null ? "#f9a8c9" : "#888888" }}
            >
              {score !== null ? score : "--"}
            </span>
          </div>

          {/* Bluetooth Connection Panel */}
          <div
            className="rounded-xl mb-4 overflow-hidden"
            style={{
              background: "rgba(249,168,201,0.05)",
              border: isConnected
                ? "1px solid rgba(34,197,94,0.25)"
                : connectionStatus === "error"
                  ? "1px solid rgba(239,68,68,0.25)"
                  : "1px solid rgba(249,168,201,0.15)",
            }}
          >
            {!isSupported ? (
              <div className="flex items-start gap-3 p-3">
                <BluetoothOff
                  size={16}
                  className="text-[#EF4444] flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs font-semibold text-[#EF4444]">
                    Web Bluetooth Not Supported
                  </p>
                  <p className="text-[11px] text-[#888888] mt-0.5">
                    Please use Chrome or Edge on Android or desktop to connect a
                    Bluetooth health device.
                  </p>
                </div>
              </div>
            ) : isConnected ? (
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <PulsingDot color="#22C55E" />
                  <BluetoothConnected size={14} className="text-[#22C55E]" />
                  <p className="text-xs font-semibold text-[#22C55E]">
                    {deviceName}
                  </p>
                  <span className="text-[10px] text-[#888888]">
                    · Live data active
                  </span>
                </div>
                <button
                  type="button"
                  data-ocid="bluetooth.disconnect.button"
                  onClick={disconnect}
                  className="flex items-center gap-1 text-[10px] text-[#888888] hover:text-[#EF4444] transition-colors"
                >
                  <X size={12} />
                  Disconnect
                </button>
              </div>
            ) : isConnecting ? (
              <div className="flex items-center gap-3 p-3">
                <Loader2
                  size={16}
                  className="text-[#f9a8c9] animate-spin flex-shrink-0"
                />
                <p className="text-xs text-[#f9a8c9]">Connecting to device…</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3">
                <div className="flex items-start gap-2">
                  <Wifi
                    size={14}
                    className="text-[#f9a8c9] flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs text-[#cccccc] leading-relaxed">
                      Connect a Bluetooth health device to see live heart rate,
                      blood pressure & sleep data.
                    </p>
                    {connectionStatus === "error" && errorMessage && (
                      <p className="text-[10px] text-[#EF4444] mt-0.5">
                        {errorMessage}
                      </p>
                    )}
                    <p className="text-[10px] text-[#555] mt-1">
                      Works in Chrome or Edge on Android and desktop. Open your
                      health app on your phone first, then tap Connect Device.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="bluetooth.connect.button"
                  onClick={connect}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#0d0d0d] flex-shrink-0 transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "#f9a8c9" }}
                >
                  <Bluetooth size={13} />
                  Connect Device
                </button>
              </div>
            )}
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <HeartRateTile value={heartRate} />
            <BloodPressureTile
              systolic={bloodPressure?.systolic ?? null}
              diastolic={bloodPressure?.diastolic ?? null}
            />
            <SleepTile
              value={sleep}
              connected={isConnected}
              onManualInput={setSleep}
            />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <p className="text-xs text-[#888888] font-medium uppercase tracking-wider mb-3">
              Upcoming
            </p>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#0d0d0d] text-xs font-bold flex-shrink-0"
                    style={{ background: apt.color }}
                  >
                    {apt.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#ffffff] truncate">
                      {apt.doctor}
                    </p>
                    <p className="text-[10px] text-[#888888]">
                      {apt.date} · {apt.time}
                    </p>
                  </div>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0"
                    style={{
                      background:
                        apt.status === "confirmed"
                          ? "rgba(249,168,201,0.15)"
                          : "rgba(245,158,11,0.15)",
                      color: apt.status === "confirmed" ? "#f9a8c9" : "#F59E0B",
                    }}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-xs text-[#888888] font-medium uppercase tracking-wider mb-3">
              Prescriptions
            </p>
            <div className="space-y-2.5">
              {prescriptions.slice(0, 2).map((rx) => (
                <div key={rx.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#ffffff]">
                      {rx.name}
                    </p>
                    <p className="text-[10px] text-[#888888]">{rx.dosage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#f9a8c9]">
                      {rx.daysLeft}d
                    </p>
                    <p className="text-[10px] text-[#888888]">left</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-6">
        <p className="text-sm font-semibold text-[#ffffff] mb-4">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Stethoscope,
              label: "AI Symptom Checker",
              desc: "Analyze symptoms instantly",
              path: "/symptoms",
              color: "#f9a8c9",
              bg: "rgba(249,168,201,0.1)",
              border: "rgba(249,168,201,0.25)",
              ocid: "dashboard.symptoms.button",
            },
            {
              icon: UserRound,
              label: "Book Doctor",
              desc: "Find & schedule visits",
              path: "/doctors",
              color: "#f9a8c9",
              bg: "rgba(249,168,201,0.1)",
              border: "rgba(249,168,201,0.25)",
              ocid: "dashboard.doctors.button",
            },
            {
              icon: AlertTriangle,
              label: "Emergency Help",
              desc: "SOS & nearby hospitals",
              path: "/emergency",
              color: "#FF4D5A",
              bg: "rgba(255,77,90,0.1)",
              border: "rgba(255,77,90,0.25)",
              ocid: "dashboard.emergency.button",
            },
          ].map((action) => (
            <button
              key={action.path}
              type="button"
              data-ocid={action.ocid}
              onClick={() => navigate({ to: action.path })}
              className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] text-left"
              style={{
                background: action.bg,
                border: `1px solid ${action.border}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: action.color }}
                >
                  {action.label}
                </p>
                <p className="text-xs text-[#888888]">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#ffffff]">
            Recent Activity
          </p>
          <button
            type="button"
            className="text-xs text-[#f9a8c9] hover:underline"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(249,168,201,0.1)",
                  color: "#f9a8c9",
                }}
              >
                {activityIcons[item.type]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#cccccc]">{item.text}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={10} className="text-[#888888]" />
                  <p className="text-[10px] text-[#888888]">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-4">
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
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#888888]">Help</span>
          <span className="text-xs text-[#888888]">Terms</span>
          <span className="text-xs text-[#888888]">Privacy</span>
          <button
            type="button"
            data-ocid="footer.emergency.button"
            onClick={() => navigate({ to: "/emergency" })}
            className="px-3 py-1 rounded-full text-xs text-[#FF4D5A] font-medium"
            style={{
              background: "rgba(255,77,90,0.1)",
              border: "1px solid rgba(255,77,90,0.3)",
            }}
          >
            Emergency
          </button>
        </div>
      </footer>
    </div>
  );
}
