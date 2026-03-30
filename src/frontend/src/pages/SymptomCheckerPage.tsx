import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import AnimatedLoader from "../components/ui/AnimatedLoader";
import GlassCard from "../components/ui/GlassCard";
import RippleButton from "../components/ui/RippleButton";

interface SymptomResult {
  disease: string;
  severity: "mild" | "moderate" | "severe";
  action: string;
  details: string;
}

function analyzeSymptoms(input: string): SymptomResult {
  const lower = input.toLowerCase();
  if (
    lower.includes("chest pain") ||
    lower.includes("heart") ||
    lower.includes("cardiac")
  ) {
    return {
      disease: "Possible Cardiac Issue",
      severity: "severe",
      action: "Seek Emergency Care Immediately",
      details:
        "Chest pain may indicate a serious cardiac condition. Please call emergency services or go to the nearest hospital immediately.",
    };
  }
  if (
    lower.includes("cough") ||
    lower.includes("sore throat") ||
    lower.includes("throat")
  ) {
    return {
      disease: "Upper Respiratory Infection",
      severity: "moderate",
      action: "Consult a Doctor",
      details:
        "Your symptoms suggest a respiratory infection. Schedule an appointment with a general physician for proper diagnosis and treatment.",
    };
  }
  if (
    lower.includes("fever") ||
    lower.includes("headache") ||
    lower.includes("cold") ||
    lower.includes("flu")
  ) {
    return {
      disease: "Influenza (Flu)",
      severity: "mild",
      action: "Home Care & Rest",
      details:
        "These symptoms are consistent with flu. Rest well, stay hydrated, and take OTC medication. Monitor for worsening symptoms.",
    };
  }
  if (
    lower.includes("rash") ||
    lower.includes("itching") ||
    lower.includes("skin")
  ) {
    return {
      disease: "Allergic Reaction / Dermatitis",
      severity: "moderate",
      action: "Consult a Dermatologist",
      details:
        "Skin symptoms may indicate allergic reaction or dermatitis. Avoid known allergens and consult a dermatologist.",
    };
  }
  if (
    lower.includes("stomach") ||
    lower.includes("nausea") ||
    lower.includes("vomit") ||
    lower.includes("diarrhea")
  ) {
    return {
      disease: "Gastrointestinal Illness",
      severity: "mild",
      action: "Home Care & Hydration",
      details:
        "Symptoms suggest a GI issue. Stay hydrated, eat light foods, and rest. If symptoms persist beyond 2 days, see a doctor.",
    };
  }
  return {
    disease: "General Illness",
    severity: "mild",
    action: "Rest & Monitor",
    details:
      "Your symptoms don't match a specific condition. Rest, stay hydrated, and monitor closely. Consult a doctor if symptoms persist.",
  };
}

const severityConfig = {
  mild: {
    color: "#f9a8c9",
    bg: "rgba(249,168,201,0.12)",
    border: "rgba(249,168,201,0.3)",
    icon: CheckCircle,
    label: "Mild",
  },
  moderate: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    icon: AlertTriangle,
    label: "Moderate",
  },
  severe: {
    color: "#FF4D5A",
    bg: "rgba(255,77,90,0.12)",
    border: "rgba(255,77,90,0.3)",
    icon: AlertCircle,
    label: "Severe",
  },
};

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);

  const handleAnalyze = () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(analyzeSymptoms(symptoms));
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeInUp">
      <div>
        <h2 className="text-2xl font-bold text-[#ffffff]">
          AI Symptom Checker
        </h2>
        <p className="text-sm text-[#888888] mt-1">
          Describe your symptoms and get instant AI-powered insights
        </p>
      </div>

      <GlassCard className="p-6" glowColor="teal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[rgba(249,168,201,0.15)] flex items-center justify-center">
            <Stethoscope size={18} className="text-[#f9a8c9]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#ffffff]">
              Describe Your Symptoms
            </p>
            <p className="text-xs text-[#888888]">
              Be as specific as possible for accurate results
            </p>
          </div>
        </div>

        <textarea
          data-ocid="symptoms.textarea"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g., I have a high fever of 102°F, headache, and body aches for the past 2 days..."
          rows={5}
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(160,190,210,0.15)] rounded-xl p-4 text-sm text-[#ffffff] placeholder-[#888888] outline-none focus:border-[rgba(249,168,201,0.4)] resize-none transition-all"
        />

        <div className="flex justify-end mt-4">
          <RippleButton
            data-ocid="symptoms.analyze.primary_button"
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className="px-6 py-2.5"
          >
            <span className="flex items-center gap-2">
              Run Analysis <ArrowRight size={14} />
            </span>
          </RippleButton>
        </div>
      </GlassCard>

      {/* Loading */}
      {loading && (
        <GlassCard
          className="p-10 flex items-center justify-center"
          data-ocid="symptoms.loading_state"
        >
          <AnimatedLoader text="Analyzing symptoms..." size="lg" />
        </GlassCard>
      )}

      {/* Results */}
      {result && !loading && (
        <div
          className="space-y-4 animate-fadeInUp"
          data-ocid="symptoms.success_state"
        >
          <p className="text-sm font-semibold text-[#ffffff]">
            Analysis Results
          </p>

          {/* Disease card */}
          <GlassCard
            className="p-6"
            glowColor={
              result.severity === "severe"
                ? "red"
                : result.severity === "moderate"
                  ? "none"
                  : "green"
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">
                  Possible Condition
                </p>
                <h3 className="text-lg font-bold text-[#ffffff]">
                  {result.disease}
                </h3>
                <p className="text-sm text-[#cccccc] mt-2 leading-relaxed">
                  {result.details}
                </p>
              </div>
              <div
                className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl"
                style={{
                  background: severityConfig[result.severity].bg,
                  border: `1px solid ${severityConfig[result.severity].border}`,
                }}
              >
                {(() => {
                  const Icon = severityConfig[result.severity].icon;
                  return (
                    <Icon
                      size={20}
                      style={{ color: severityConfig[result.severity].color }}
                    />
                  );
                })()}
                <p
                  className="text-xs font-bold"
                  style={{ color: severityConfig[result.severity].color }}
                >
                  {severityConfig[result.severity].label}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Action card */}
          <GlassCard className="p-5">
            <p className="text-xs text-[#888888] uppercase tracking-wider mb-2">
              Recommended Action
            </p>
            <p
              className="text-base font-semibold"
              style={{ color: severityConfig[result.severity].color }}
            >
              {result.action}
            </p>
          </GlassCard>

          {/* Disclaimer */}
          <div
            className="p-4 rounded-xl text-xs text-[#888888] leading-relaxed"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <strong className="text-[#F59E0B]">Disclaimer:</strong> This is an
            AI-generated analysis for informational purposes only. Always
            consult a qualified healthcare professional for medical advice and
            diagnosis.
          </div>
        </div>
      )}
    </div>
  );
}
