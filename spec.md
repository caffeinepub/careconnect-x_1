# CareConnect X

## Current State
Bluetooth connect button uses `acceptAllDevices: true` which shows all BT devices including audio/headphones. Phones don't advertise standard BT health services unless a health companion app is open and broadcasting. After connecting, only heart rate and blood pressure GATT services are read — no general phone activity access.

## Requested Changes (Diff)

### Add
- Smart Bluetooth device filter: prefer phone/health devices by filtering using known phone health service UUIDs and user agent hints; include a "Phone / Health App" connection mode
- After phone connects, show a "Phone Connected" state with a step-by-step guide to open the health app (Google Fit, Samsung Health, Apple Health via intermediary) so GATT services broadcast
- Activity monitoring panel: once connected, show a live activity feed of steps, calories (if available via GATT), and fallback manual input prompts
- Phone-type detection: try to detect if connected device is a phone/health tracker vs. audio device by checking available GATT services after connection
- Clear instructions panel showing how to make a phone discoverable for health data (open Google Fit/Samsung Health, enable BT health sharing)
- Fallback manual input for all metrics when device doesn't expose the GATT service

### Modify
- `useBluetoothHealth.ts`: Change BT requestDevice to use two modes — (1) health-focused filter list with known phone health service UUIDs, (2) acceptAllDevices as fallback; try reading steps/activity from GATT 0x1814 (Running Speed), 0x181A (Environmental Sensing), 0x1816 (Cycling Speed) as proxies; improve error messages to explain phone pairing steps
- `DashboardPage.tsx`: Update the Bluetooth panel (user-selected element) to show phone connection flow, connection guide, and post-connection activity summary
- Bluetooth panel UI: Add a two-mode connect button ("Connect Phone" primary, "Other Device" secondary); show step-by-step instructions when connecting; show activity data after connection

### Remove
- Nothing removed — only enhancing existing Bluetooth flow

## Implementation Plan
1. Rewrite `useBluetoothHealth.ts` to support phone-focused BT pairing with health service UUIDs and a comprehensive optional services list; add step/activity reading attempts; improve error/guidance messages
2. Update `DashboardPage.tsx` Bluetooth panel to have "Connect Phone" button, connection instructions, and post-connection activity display with steps/calories tiles
3. Add clear in-UI guide: "Open Google Fit or Samsung Health on your phone, ensure Bluetooth is on, then tap Connect Phone here"
