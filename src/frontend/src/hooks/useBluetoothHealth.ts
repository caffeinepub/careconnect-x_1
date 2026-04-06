import { useCallback, useRef, useState } from "react";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type DeviceType = "phone" | "tracker" | "unknown";

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export interface ActivityData {
  steps: number | null;
  calories: number | null;
  lastSync: Date | null;
}

export interface BluetoothHealthState {
  heartRate: number | null;
  bloodPressure: BloodPressure | null;
  sleep: number | null;
  steps: number | null;
  calories: number | null;
  connectionStatus: ConnectionStatus;
  deviceName: string | null;
  deviceType: DeviceType;
  connectedApps: string[];
  activityData: ActivityData;
  isSupported: boolean;
  errorMessage: string | null;
}

function decodeSFLOAT(bytes: DataView, offset: number): number {
  const raw = bytes.getUint16(offset, true);
  const exponent = raw >> 12;
  const mantissa = raw & 0x0fff;
  const signedExp = exponent >= 8 ? exponent - 16 : exponent;
  const signedMantissa = mantissa >= 0x800 ? mantissa - 0x1000 : mantissa;
  return signedMantissa * 10 ** signedExp;
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

// Phone manufacturers used for device type detection
const PHONE_MANUFACTURERS = [
  "samsung",
  "google",
  "apple",
  "xiaomi",
  "huawei",
  "oneplus",
  "oppo",
  "vivo",
  "motorola",
  "lg",
  "nokia",
  "sony",
  "realme",
];

export function useBluetoothHealth() {
  const [state, setState] = useState<BluetoothHealthState>({
    heartRate: null,
    bloodPressure: null,
    sleep: null,
    steps: null,
    calories: null,
    connectionStatus: "disconnected",
    deviceName: null,
    deviceType: "unknown",
    connectedApps: [],
    activityData: { steps: null, calories: null, lastSync: null },
    isSupported:
      typeof navigator !== "undefined" && "bluetooth" in navigator && !isIOS(),
    errorMessage: null,
  });

  const gattServerRef = useRef<any>(null);
  const deviceRef = useRef<any>(null);

  const setSleep = useCallback((hours: number | null) => {
    setState((prev) => ({ ...prev, sleep: hours }));
  }, []);

  const disconnect = useCallback(() => {
    try {
      if (gattServerRef.current?.connected) {
        gattServerRef.current.disconnect();
      }
    } catch {
      // ignore
    }
    gattServerRef.current = null;
    deviceRef.current = null;
    setState((prev) => ({
      ...prev,
      connectionStatus: "disconnected",
      deviceName: null,
      deviceType: "unknown",
      connectedApps: [],
      heartRate: null,
      bloodPressure: null,
      steps: null,
      calories: null,
      activityData: { steps: null, calories: null, lastSync: null },
    }));
  }, []);

  const connect = useCallback(async () => {
    if (isIOS()) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    if (!("bluetooth" in navigator)) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({
      ...prev,
      connectionStatus: "connecting",
      errorMessage: null,
    }));

    try {
      // Use acceptAllDevices: true so phones appear (phones don't always advertise
      // specific health services). We add optional services so GATT reads work
      // after connecting to the chosen device.
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "heart_rate",
          "blood_pressure",
          "health_thermometer",
          "battery_service",
          0x180d, // Heart Rate
          0x1810, // Blood Pressure
          0x1809, // Health Thermometer
          0x180f, // Battery Service
          0x181c, // User Data
          0x1822, // PLX (Pulse Oximeter)
          0x1814, // Running Speed & Cadence (steps proxy)
          0x1816, // Cycling Speed and Cadence
          0x180a, // Device Information (phones expose this)
          0x1800, // Generic Access
          0x1801, // Generic Attribute
          0x181a, // Environmental Sensing
          0x1813, // Scan Parameters
        ],
      });

      deviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        gattServerRef.current = null;
        setState((prev) => ({
          ...prev,
          connectionStatus: "disconnected",
          heartRate: null,
          bloodPressure: null,
          steps: null,
          calories: null,
          deviceType: "unknown",
          connectedApps: [],
          activityData: { steps: null, calories: null, lastSync: null },
        }));
      });

      const server = await device.gatt.connect();
      gattServerRef.current = server;

      setState((prev) => ({
        ...prev,
        connectionStatus: "connected",
        deviceName: device.name ?? "Unknown Device",
      }));

      // --- Detect device type via Device Information service ---
      let detectedType: DeviceType = "unknown";
      let manufacturer = "";

      try {
        const devInfoService = await server.getPrimaryService(0x180a);
        try {
          const manufacturerChar =
            await devInfoService.getCharacteristic(0x2a29);
          const val: DataView = await manufacturerChar.readValue();
          manufacturer = new TextDecoder().decode(val).toLowerCase().trim();
        } catch {
          // char not available
        }
        if (PHONE_MANUFACTURERS.some((m) => manufacturer.includes(m))) {
          detectedType = "phone";
        }
      } catch {
        // Device Info service not available
      }

      // --- Read services in parallel for faster connection ---
      let hasHeartRate = false;
      let hasRunningSpeed = false;
      let steps: number | null = null;

      const [hrResult, bpResult, rscResult, _battResult] =
        await Promise.allSettled([
          // 1. Heart Rate
          (async () => {
            const hrService = await server.getPrimaryService("heart_rate");
            const hrChar = await hrService.getCharacteristic(
              "heart_rate_measurement",
            );
            await hrChar.startNotifications();
            hrChar.addEventListener(
              "characteristicvaluechanged",
              (event: Event) => {
                const value = (event.target as any).value as DataView | null;
                if (!value) return;
                const flags = value.getUint8(0);
                const hr =
                  flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1);
                setState((prev) => ({ ...prev, heartRate: hr }));
              },
            );
            return true;
          })(),
          // 2. Blood Pressure
          (async () => {
            const bpService = await server.getPrimaryService("blood_pressure");
            const bpChar = await bpService.getCharacteristic(0x2a35);
            const value: DataView = await bpChar.readValue();
            const systolic = Math.round(decodeSFLOAT(value, 1));
            const diastolic = Math.round(decodeSFLOAT(value, 3));
            if (systolic > 0 && diastolic > 0) {
              setState((prev) => ({
                ...prev,
                bloodPressure: { systolic, diastolic },
              }));
            }
            return true;
          })(),
          // 3. Running Speed & Cadence (steps proxy)
          (async () => {
            const rscService = await server.getPrimaryService(0x1814);
            const rscChar = await rscService.getCharacteristic(0x2a53);
            await rscChar.startNotifications();
            rscChar.addEventListener(
              "characteristicvaluechanged",
              (event: Event) => {
                const value = (event.target as any).value as DataView | null;
                if (!value) return;
                // Cumulative Running Strides Distance field = 32-bit at offset 2
                // Each stride is roughly 2 steps, multiply by 2 as approximation
                if (value.byteLength >= 6) {
                  const cumulativeStrides = value.getUint32(2, true);
                  const estimatedSteps = cumulativeStrides * 2;
                  setState((prev) => ({
                    ...prev,
                    steps: estimatedSteps,
                    activityData: {
                      ...prev.activityData,
                      steps: estimatedSteps,
                      lastSync: new Date(),
                    },
                  }));
                }
              },
            );
            return true;
          })(),
          // 4. Battery service
          (async () => {
            const batService =
              await server.getPrimaryService("battery_service");
            const batChar = await batService.getCharacteristic("battery_level");
            await batChar.readValue();
            return true;
          })(),
        ]);

      hasHeartRate = hrResult.status === "fulfilled" && hrResult.value === true;
      hasRunningSpeed =
        rscResult.status === "fulfilled" && rscResult.value === true;

      // If RSC gave us steps already
      if (hasRunningSpeed) {
        steps = state.steps;
      }

      // Determine device type from services if not already detected via manufacturer
      if (detectedType === "unknown") {
        if (hasHeartRate && hasRunningSpeed) {
          detectedType = "tracker";
        } else if (hasHeartRate) {
          // Could be tracker or phone — leave as unknown, name may hint at phone
          const nameLower = (device.name ?? "").toLowerCase();
          if (PHONE_MANUFACTURERS.some((m) => nameLower.includes(m))) {
            detectedType = "phone";
          }
        }
      }

      // Build connected apps list based on available services
      const connectedApps: string[] = [];
      const bpOk = bpResult.status === "fulfilled";

      if (hasHeartRate || bpOk) {
        if (
          manufacturer.includes("samsung") ||
          (device.name ?? "").toLowerCase().includes("samsung")
        ) {
          connectedApps.push("Samsung Health");
        } else if (
          manufacturer.includes("google") ||
          (device.name ?? "").toLowerCase().includes("pixel")
        ) {
          connectedApps.push("Google Fit");
        } else {
          connectedApps.push("Google Fit", "Samsung Health");
        }
      }
      if (hasRunningSpeed) {
        if (!connectedApps.includes("Samsung Health")) {
          connectedApps.push("Samsung Health");
        }
        if (!connectedApps.includes("Fitbit")) {
          connectedApps.push("Fitbit");
        }
      }

      setState((prev) => ({
        ...prev,
        deviceType: detectedType,
        connectedApps,
        activityData: {
          steps: steps,
          calories: null,
          lastSync: steps !== null ? new Date() : null,
        },
      }));
    } catch (err: any) {
      const isUserCancelled =
        err?.name === "NotFoundError" || err?.message?.includes("cancelled");
      setState((prev) => ({
        ...prev,
        connectionStatus: isUserCancelled ? "disconnected" : "error",
        errorMessage: isUserCancelled
          ? null
          : (err?.message ?? "Connection failed"),
      }));
    }
  }, [state.steps]);

  return { ...state, connect, disconnect, setSleep };
}
