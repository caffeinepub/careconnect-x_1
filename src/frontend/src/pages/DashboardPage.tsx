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

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

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

// --- Status badge helper ---
type MetricStatusType = "good" | "fair" | "low" | "elevated" | "high";

const STATUS_COLORS: Record<
  MetricStatusType,
  { bg: string; text: string; border: string }
> = {
  good: {
    bg: "rgba(34,197,94,0.15)",
    text: "#22C55E",
    border: "rgba(34,197,94,0.3)",
  },
  fair: {
    bg: "rgba(245,158,11,0.15)",
    text: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
  },
  low: {
    bg: "rgba(239,68,68,0.15)",
    text: "#EF4444",
    border: "rgba(239,68,68,0.3)",
  },
  elevated: {
    bg: "rgba(245,158,11,0.15)",
    text: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
  },
  high: {
    bg: "rgba(239,68,68,0.15)",
    text: "#EF4444",
    border: "rgba(239,68,68,0.3)",
  },
};

function StatusBadge({
  label,
  type,
}: { label: string; type: MetricStatusType }) {
  const c = STATUS_COLORS[type];
  return (
    <span
      className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1"
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
}

function getHeartRateStatus(hr: number): {
  label: string;
  type: MetricStatusType;
} {
  if (hr >= 60 && hr <= 100) return { label: "Good", type: "good" };
  if ((hr >= 50 && hr < 60) || (hr > 100 && hr <= 110))
    return { label: "Fair", type: "fair" };
  return { label: "Low", type: "low" };
}

function getBPStatus(
  systolic: number,
  diastolic: number,
): { label: string; type: MetricStatusType } {
  if (systolic < 120 && diastolic < 80) return { label: "Good", type: "good" };
  if (systolic < 130) return { label: "Elevated", type: "elevated" };
  return { label: "High", type: "high" };
}

function getSleepStatus(hrs: number): {
  label: string;
  type: MetricStatusType;
} {
  if (hrs >= 7 && hrs <= 9) return { label: "Good", type: "good" };
  if ((hrs >= 6 && hrs < 7) || (hrs > 9 && hrs <= 10))
    return { label: "Fair", type: "fair" };
  return { label: "Low", type: "low" };
}

// --- Metric tiles ---

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

  const status = value !== null ? getHeartRateStatus(value) : null;

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
      {status && <StatusBadge label={status.label} type={status.type} />}
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
  const status = hasData ? getBPStatus(systolic!, diastolic!) : null;

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
      {status && <StatusBadge label={status.label} type={status.type} />}
      <p className="text-[9px] text-[#4A5568] mt-0.5">
        {hasData ? "mmHg" : "No data"}
      </p>
    </div>
  );
}

function SleepTile({
  value,
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

  const status = value !== null ? getSleepStatus(value) : null;

  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <Moon
        size={18}
        className="mx-auto mb-1"
        style={{ color: "#A78BFA", opacity: 1 }}
      />
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
      <p className="text-[10px] text-[#888888] mt-0.5">Sleep</p>
      {status && <StatusBadge label={status.label} type={status.type} />}
      <p className="text-[9px] text-[#4A5568] mt-0.5">
        {value !== null ? "hrs" : "Log manually"}
      </p>
    </div>
  );
}

// --- Health score computation ---

interface MetricScore {
  label: string;
  points: number;
  status: "good" | "fair" | "low" | "missing";
  statusLabel: string;
  weight: number;
  icon: React.ReactNode;
}

function computeHealthScore(
  heartRate: number | null,
  bloodPressure: { systolic: number; diastolic: number } | null,
  sleep: number | null,
): { total: number | null; metrics: MetricScore[] } {
  const metrics: MetricScore[] = [];

  // Heart rate (35%)
  if (heartRate !== null) {
    let points = 0;
    let status: MetricScore["status"] = "low";
    let statusLabel = "Low";
    if (heartRate >= 60 && heartRate <= 100) {
      points = 100;
      status = "good";
      statusLabel = "Good";
    } else if (
      (heartRate >= 50 && heartRate < 60) ||
      (heartRate > 100 && heartRate <= 110)
    ) {
      points = 70;
      status = "fair";
      statusLabel = "Fair";
    } else {
      points = 40;
      status = "low";
      statusLabel = "Low";
    }
    metrics.push({
      label: "Heart Rate",
      points,
      status,
      statusLabel,
      weight: 0.35,
      icon: <Heart size={13} />,
    });
  } else {
    metrics.push({
      label: "Heart Rate",
      points: 0,
      status: "missing",
      statusLabel: "Not measured",
      weight: 0.35,
      icon: <Heart size={13} />,
    });
  }

  // Blood pressure (35%)
  if (bloodPressure) {
    let points = 0;
    let status: MetricScore["status"] = "low";
    let statusLabel = "High";
    if (bloodPressure.systolic < 120 && bloodPressure.diastolic < 80) {
      points = 100;
      status = "good";
      statusLabel = "Good";
    } else if (bloodPressure.systolic < 130) {
      points = 70;
      status = "fair";
      statusLabel = "Elevated";
    } else {
      points = 40;
      status = "low";
      statusLabel = "High";
    }
    metrics.push({
      label: "Blood Pressure",
      points,
      status,
      statusLabel,
      weight: 0.35,
      icon: <Activity size={13} />,
    });
  } else {
    metrics.push({
      label: "Blood Pressure",
      points: 0,
      status: "missing",
      statusLabel: "Not measured",
      weight: 0.35,
      icon: <Activity size={13} />,
    });
  }

  // Sleep (30%)
  if (sleep !== null) {
    let points = 0;
    let status: MetricScore["status"] = "low";
    let statusLabel = "Low";
    if (sleep >= 7 && sleep <= 9) {
      points = 100;
      status = "good";
      statusLabel = "Good";
    } else if ((sleep >= 6 && sleep < 7) || (sleep > 9 && sleep <= 10)) {
      points = 70;
      status = "fair";
      statusLabel = "Fair";
    } else {
      points = 40;
      status = "low";
      statusLabel = "Low";
    }
    metrics.push({
      label: "Sleep",
      points,
      status,
      statusLabel,
      weight: 0.3,
      icon: <Moon size={13} />,
    });
  } else {
    metrics.push({
      label: "Sleep",
      points: 0,
      status: "missing",
      statusLabel: "Not logged",
      weight: 0.3,
      icon: <Moon size={13} />,
    });
  }

  const realMetrics = metrics.filter((m) => m.status !== "missing");
  if (realMetrics.length === 0) return { total: null, metrics };

  const totalWeight = realMetrics.reduce((s, m) => s + m.weight, 0);
  const total = Math.round(
    realMetrics.reduce((s, m) => s + m.points * m.weight, 0) / totalWeight,
  );
  return { total, metrics };
}

// --- SVG circular ring ---

function ScoreRing({ score }: { score: number | null }) {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const pct = score !== null ? Math.min(Math.max(score, 0), 100) : 0;
  const offset = circumference - (pct / 100) * circumference;

  let ringColor = "#888888";
  if (score !== null) {
    if (score >= 85) ringColor = "#22C55E";
    else if (score >= 70) ringColor = "#F59E0B";
    else ringColor = "#EF4444";
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 100, height: 100 }}
    >
      <svg
        width={100}
        height={100}
        className="-rotate-90"
        aria-label="Health score ring"
        role="img"
      >
        {/* Track */}
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease",
          }}
        />
      </svg>
      {/* Score in center */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span
          className="text-2xl font-bold leading-none"
          style={{ color: score !== null ? ringColor : "#555" }}
        >
          {score !== null ? score : "--"}
        </span>
        {score !== null && (
          <span className="text-[8px] text-[#888888] mt-0.5">/ 100</span>
        )}
      </div>
    </div>
  );
}

// --- Health Score Panel ---

function HealthScorePanel({
  heartRate,
  bloodPressure,
  sleep,
}: {
  heartRate: number | null;
  bloodPressure: { systolic: number; diastolic: number } | null;
  sleep: number | null;
}) {
  const { total, metrics } = computeHealthScore(
    heartRate,
    bloodPressure,
    sleep,
  );

  let overallLabel = "";
  let overallColor = "#888888";
  if (total !== null) {
    if (total >= 85) {
      overallLabel = "Excellent Health";
      overallColor = "#22C55E";
    } else if (total >= 70) {
      overallLabel = "Good Health";
      overallColor = "#F59E0B";
    } else {
      overallLabel = "Needs Attention";
      overallColor = "#EF4444";
    }
  }

  const hasMissing = metrics.some((m) => m.status === "missing");

  const statusChipStyle = (status: MetricScore["status"]) => {
    if (status === "good")
      return {
        bg: "rgba(34,197,94,0.15)",
        color: "#22C55E",
        border: "rgba(34,197,94,0.3)",
      };
    if (status === "fair")
      return {
        bg: "rgba(245,158,11,0.15)",
        color: "#F59E0B",
        border: "rgba(245,158,11,0.3)",
      };
    if (status === "low")
      return {
        bg: "rgba(239,68,68,0.15)",
        color: "#EF4444",
        border: "rgba(239,68,68,0.3)",
      };
    return {
      bg: "rgba(136,136,136,0.1)",
      color: "#888888",
      border: "rgba(136,136,136,0.2)",
    };
  };

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      data-ocid="health.score.panel"
    >
      <div className="flex items-center gap-4">
        {/* Circular ring */}
        <ScoreRing score={total} />

        {/* Label + breakdown */}
        <div className="flex-1 min-w-0">
          {total !== null ? (
            <>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2"
                style={{
                  background: `${overallColor}22`,
                  color: overallColor,
                  border: `1px solid ${overallColor}44`,
                }}
              >
                {overallLabel}
              </div>
            </>
          ) : (
            <p className="text-[11px] text-[#888888] mb-2">
              Connect device or log sleep to see your score
            </p>
          )}

          {/* Per-metric breakdown rows */}
          <div className="space-y-1.5">
            {metrics.map((m) => {
              const chip = statusChipStyle(m.status);
              return (
                <div key={m.label} className="flex items-center gap-2">
                  <span
                    style={{
                      color:
                        m.status === "missing"
                          ? "#555"
                          : overallColor === "#888888"
                            ? "#888"
                            : "#aaa",
                    }}
                  >
                    {m.icon}
                  </span>
                  <span className="text-[10px] text-[#888888] w-24 flex-shrink-0">
                    {m.label}
                  </span>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: chip.bg,
                      color: chip.color,
                      border: `1px solid ${chip.border}`,
                    }}
                  >
                    {m.statusLabel}
                  </span>
                  {m.status !== "missing" && (
                    <span className="text-[9px] text-[#555] ml-auto">
                      {m.points}pts
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Missing metric hint */}
          {hasMissing && (
            <p className="text-[9px] text-[#666] mt-2">
              ⚠ Connect device / enter sleep to get a full score
            </p>
          )}
        </div>
      </div>
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

  const userName = localStorage.getItem("ccx_user_name") || "there";
  const firstName = userName.split(" ")[0];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#ffffff]">
            Welcome back, <span className="text-[#f9a8c9]">{firstName}!</span>{" "}
            👋
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
                    {isIOS()
                      ? "Bluetooth Not Available on iPhone/iPad"
                      : "Web Bluetooth Not Supported"}
                  </p>
                  <p className="text-[11px] text-[#888888] mt-0.5">
                    {isIOS()
                      ? "Apple does not support Web Bluetooth on iOS. To connect a health device, use Chrome or Edge on Android or a desktop computer."
                      : "Please use Chrome or Edge on Android or desktop to connect a Bluetooth health device."}
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

          {/* Health Score Panel — below Bluetooth, above metric tiles */}
          <HealthScorePanel
            heartRate={heartRate}
            bloodPressure={bloodPressure}
            sleep={sleep}
          />

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
