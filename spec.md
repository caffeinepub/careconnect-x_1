# CareConnect X

## Current State

Full-featured healthcare app with 9 screens: Dashboard, AI Symptom Checker, Doctor Booking, Emergency, Admin, First Aid AI, Medicine Delivery, Medical Records, Community. Built in React with TanStack Router, Tailwind, black/white/pink theme. Features include: Web Bluetooth health metrics, OpenStreetMap hospital search, simulated AI chatbot, notification panel with portal rendering, dark/light theme toggle.

Current `index.html` viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` — missing iOS-specific attributes.

Known iOS gaps:
- No `maximum-scale` or `user-scalable` to prevent zoom-on-focus
- No `viewport-fit=cover` for notch/safe area support
- Web Bluetooth not supported on iOS — button fails silently
- `position: fixed` elements (sidebar, topbar, notification panel, chatbot) may misbehave on iOS Safari dynamic toolbar
- No safe-area-inset padding for notch/home indicator
- Touch targets may be under 44px on some buttons
- Hover-only CSS states don't translate to touch
- File inputs for First Aid and Medical Records may lack `capture` attribute for iOS camera
- AppLayout uses `h-screen` which may not account for iOS Safari's dynamic toolbar

## Requested Changes (Diff)

### Add
- iOS detection utility (`isIOS()`) to detect iPhone/iPad
- Safe area inset CSS using `env(safe-area-inset-*)` in index.css
- iOS Bluetooth unsupported message in DashboardPage (detect iOS and show specific message instead of generic Web Bluetooth unsupported message)
- `viewport-fit=cover` to viewport meta tag
- `maximum-scale=1` to prevent zoom on input focus on iOS
- `-webkit-overflow-scrolling: touch` on scrollable containers
- Touch-friendly CSS: `touch-action: manipulation` on all interactive buttons
- `min-h-dvh` / `dvh` units for full-height containers that avoid iOS Safari toolbar issues
- `capture="environment"` on file inputs in FirstAidPage and MedicalRecordsPage for iOS camera
- iOS-compatible font size: ensure all form inputs have `font-size: 16px` minimum to prevent zoom

### Modify
- `index.html`: Update viewport meta to include `viewport-fit=cover` and `maximum-scale=1, user-scalable=no`
- `index.css`: Add safe-area-inset padding to `.bg-app` and `body`, add `-webkit-overflow-scrolling: touch` helpers, add `touch-action: manipulation` to buttons globally
- `AppLayout.tsx`: Change `h-screen` to use `min-h-dvh` / `h-dvh` for iOS Safari toolbar compatibility; ensure sidebar and main content area scroll correctly
- `useBluetoothHealth.ts`: Add iOS detection — if iOS device, set `isSupported: false` immediately with iOS-specific reason
- `DashboardPage.tsx`: Show iOS-specific message ("Bluetooth not available on iPhone/iPad — Apple does not support Web Bluetooth. Use Android or desktop Chrome instead.") when iOS is detected
- `Sidebar.tsx`: Ensure sidebar scroll is `-webkit-overflow-scrolling: touch` compatible; sidebar width on mobile should overlay (not push content)
- `TopBar.tsx`: Ensure header is safe-area-inset-top aware on iPhone notch
- `EmergencyPage.tsx`: Add iOS Safari geolocation permission guidance (iOS requires HTTPS and explicit permission; add friendly message if denied)
- `FloatingChatbot.tsx`: Ensure floating panel does not overlap iOS home indicator by respecting `env(safe-area-inset-bottom)`
- `NotificationDropdown.tsx`: Ensure portal panel works with iOS Safari (no `backdrop-filter` fallback issues)
- All buttons: Add `style={{ touchAction: 'manipulation' }}` or CSS class to prevent 300ms tap delay on iOS

### Remove
- Nothing removed

## Implementation Plan

1. Update `index.html` viewport meta for iOS safe area and zoom prevention
2. Add iOS detection helper inline or as a small utility
3. Update `index.css` with safe-area-inset support, touch-action globally, -webkit-overflow-scrolling
4. Update `AppLayout.tsx` to use dvh units for iOS Safari toolbar fix
5. Update `useBluetoothHealth.ts` to detect iOS and set isSupported false with iOS reason
6. Update `DashboardPage.tsx` to show iOS-specific Bluetooth message
7. Update `FloatingChatbot.tsx` to respect safe-area-inset-bottom
8. Update `TopBar.tsx` to respect safe-area-inset-top
9. Update `FirstAidPage.tsx` and `MedicalRecordsPage.tsx` file inputs with capture attribute and 16px font
10. Ensure all inputs have font-size >= 16px to prevent iOS auto-zoom
11. Validate build passes
