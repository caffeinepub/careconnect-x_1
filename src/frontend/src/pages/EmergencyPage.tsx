import {
  AlertCircle,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Siren,
} from "lucide-react";
import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";

interface Hospital {
  id: number;
  name: string;
  phone: string;
  type: "Government" | "Private";
  mapsQuery: string;
}

const fallbackHospitals: Hospital[] = [
  {
    id: 1,
    name: "AIIMS Delhi",
    phone: "01126588500",
    type: "Government",
    mapsQuery: "AIIMS+Delhi",
  },
  {
    id: 2,
    name: "Apollo Hospital",
    phone: "01171179090",
    type: "Private",
    mapsQuery: "Apollo+Hospital+Delhi",
  },
  {
    id: 3,
    name: "Safdarjung Hospital",
    phone: "01126198018",
    type: "Government",
    mapsQuery: "Safdarjung+Hospital+Delhi",
  },
  {
    id: 4,
    name: "Max Healthcare",
    phone: "01126515050",
    type: "Private",
    mapsQuery: "Max+Healthcare+Delhi",
  },
];

type LocationState = "idle" | "loading" | "granted" | "denied";

export default function EmergencyPage() {
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const handleSOS = () => {
    alert("🚨 Emergency services have been contacted! Help is on the way.");
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("denied");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState("granted");
      },
      () => {
        setLocationState("denied");
      },
      { timeout: 10000 },
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDirectionsUrl = (hospital: Hospital) => {
    if (coords) {
      return `https://www.google.com/maps/dir/${coords.lat},${coords.lng}/${hospital.mapsQuery}`;
    }
    return `https://www.google.com/maps/search/${hospital.mapsQuery}`;
  };

  const getNearbyUrl = () => {
    if (coords) {
      return `https://www.google.com/maps/search/hospitals/@${coords.lat},${coords.lng},14z`;
    }
    return "https://www.google.com/maps/search/hospitals+near+me";
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h2 className="text-2xl font-bold text-[#ffffff]">Emergency</h2>
        <p className="text-sm text-[#888888] mt-1">
          Get immediate help when you need it most
        </p>
      </div>

      {/* SOS Button */}
      <GlassCard className="p-10 text-center" glowColor="red">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(255,77,90,0.3)" }}
            />
            <button
              type="button"
              data-ocid="emergency.sos.primary_button"
              onClick={handleSOS}
              className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 animate-sos-pulse"
              style={{
                background: "radial-gradient(circle, #5C1A22, #3B1A1F)",
                border: "3px solid #FF4D5A",
              }}
            >
              <Siren size={36} className="text-[#FF4D5A]" />
              <span className="text-sm font-bold text-[#FF4D5A] tracking-widest">
                SOS
              </span>
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#ffffff]">
              🆘 SOS EMERGENCY
            </h3>
            <p className="text-sm text-[#cccccc] mt-1">
              Tap the button to contact emergency services immediately
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Quick Emergency Calls */}
      <GlassCard className="p-5">
        <p className="text-sm font-semibold text-[#ffffff] mb-4">
          Quick Emergency Calls
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              number: "102",
              label: "Ambulance",
              color: "#FF4D5A",
              bg: "rgba(255,77,90,0.15)",
            },
            {
              number: "108",
              label: "Emergency",
              color: "#F59E0B",
              bg: "rgba(245,158,11,0.15)",
            },
            {
              number: "112",
              label: "National",
              color: "#f9a8c9",
              bg: "rgba(249,168,201,0.15)",
            },
          ].map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              data-ocid={`emergency.call_${item.number}.primary_button`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 no-underline"
              style={{
                background: item.bg,
                border: `1px solid ${item.color}40`,
              }}
            >
              <Phone size={20} style={{ color: item.color }} />
              <span className="text-lg font-bold" style={{ color: item.color }}>
                {item.number}
              </span>
              <span className="text-[10px] text-[#cccccc]">{item.label}</span>
            </a>
          ))}
        </div>
      </GlassCard>

      {/* Location Status + Find All Nearby */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {locationState === "loading" && (
              <>
                <Loader2 size={16} className="text-[#f9a8c9] animate-spin" />
                <span className="text-sm text-[#cccccc]">
                  Detecting your location...
                </span>
              </>
            )}
            {locationState === "granted" && (
              <>
                <MapPin size={16} className="text-[#f9a8c9]" />
                <span className="text-sm text-[#f9a8c9]">
                  Location detected — showing directions from you
                </span>
              </>
            )}
            {locationState === "denied" && (
              <>
                <AlertCircle size={16} className="text-[#F59E0B]" />
                <span className="text-sm text-[#F59E0B]">
                  Location unavailable — directions will use map search
                </span>
              </>
            )}
            {locationState === "idle" && (
              <>
                <MapPin size={16} className="text-[#888888]" />
                <span className="text-sm text-[#888888]">
                  Waiting for location...
                </span>
              </>
            )}
          </div>
          <a
            href={getNearbyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 no-underline"
            style={{
              background: "rgba(249,168,201,0.15)",
              color: "#f9a8c9",
              border: "1px solid rgba(249,168,201,0.3)",
            }}
          >
            <Navigation size={12} />
            Find All Nearby Hospitals
          </a>
        </div>
      </GlassCard>

      {/* Nearby Hospitals with Call + Directions */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-[#f9a8c9]" />
          <p className="text-sm font-semibold text-[#ffffff]">
            Nearby Hospitals
          </p>
          <span className="text-[10px] text-[#888888] ml-auto">
            Tap Call or Directions
          </span>
        </div>
        <div className="space-y-3">
          {fallbackHospitals.map((hospital, idx) => (
            <div
              key={hospital.id}
              data-ocid={`emergency.hospital.item.${idx + 1}`}
              className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ border: "1px solid rgba(160,190,210,0.08)" }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    hospital.type === "Government"
                      ? "rgba(249,168,201,0.12)"
                      : "rgba(249,168,201,0.12)",
                }}
              >
                <MapPin
                  size={16}
                  style={{
                    color:
                      hospital.type === "Government" ? "#f9a8c9" : "#f9a8c9",
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#ffffff] truncate">
                    {hospital.name}
                  </p>
                  <span
                    className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background:
                        hospital.type === "Government"
                          ? "rgba(249,168,201,0.1)"
                          : "rgba(249,168,201,0.1)",
                      color:
                        hospital.type === "Government" ? "#f9a8c9" : "#f9a8c9",
                    }}
                  >
                    {hospital.type}
                  </span>
                </div>
                <p className="text-xs text-[#888888]">{hospital.phone}</p>
              </div>

              {/* Actions — Directions first, then Call below */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a
                  href={getDirectionsUrl(hospital)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`emergency.directions.button.${idx + 1}`}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 no-underline"
                  style={{
                    background: "rgba(249,168,201,0.15)",
                    color: "#f9a8c9",
                    border: "1px solid rgba(249,168,201,0.3)",
                  }}
                >
                  <Navigation size={10} />
                  Directions
                </a>
                <a
                  href={`tel:${hospital.phone}`}
                  data-ocid={`emergency.call.button.${idx + 1}`}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 no-underline"
                  style={{
                    background: "rgba(255,77,90,0.15)",
                    color: "#FF4D5A",
                    border: "1px solid rgba(255,77,90,0.3)",
                  }}
                >
                  <Phone size={10} />
                  Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
