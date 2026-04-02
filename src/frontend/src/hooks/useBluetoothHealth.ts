import { useCallback, useRef, useState } from "react";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export interface BluetoothHealthState {
  heartRate: number | null;
  bloodPressure: BloodPressure | null;
  sleep: number | null;
  connectionStatus: ConnectionStatus;
  deviceName: string | null;
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

export function useBluetoothHealth() {
  const [state, setState] = useState<BluetoothHealthState>({
    heartRate: null,
    bloodPressure: null,
    sleep: null,
    connectionStatus: "disconnected",
    deviceName: null,
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
      heartRate: null,
      bloodPressure: null,
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
      // Use acceptAllDevices so mobile phones and fitness apps (Google Fit,
      // Samsung Health, etc.) appear in the picker regardless of advertised services.
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "heart_rate",
          "blood_pressure",
          "health_thermometer",
          0x180d, // Heart Rate
          0x1810, // Blood Pressure
          0x1809, // Health Thermometer
          0x180f, // Battery
          0x181c, // User Data
          0x1822, // PLX (Pulse Oximeter)
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
        }));
      });

      const server = await device.gatt.connect();
      gattServerRef.current = server;

      setState((prev) => ({
        ...prev,
        connectionStatus: "connected",
        deviceName: device.name ?? "Unknown Device",
      }));

      // Subscribe to heart rate
      try {
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
      } catch {
        // heart rate service not available on this device
      }

      // Read blood pressure
      try {
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
      } catch {
        // blood pressure service not available on this device
      }
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
  }, []);

  return { ...state, connect, disconnect, setSleep };
}
