# CareConnect X

## Current State

Dashboard already has:
- Web Bluetooth connect/disconnect flow (useBluetoothHealth hook)
- HeartRateTile showing live bpm from Bluetooth characteristic
- BloodPressureTile showing systolic/diastolic from Bluetooth characteristic
- SleepTile with manual input when not connected
- Basic healthScore() function that averages metric scores — but only runs when `isConnected === true`, so sleep score is ignored unless connected
- Score displayed as a raw number (e.g. "87") next to the Health Overview card title
- No visual score breakdown, no per-metric status labels, no badge/tier system

## Requested Changes (Diff)

### Add
- Per-metric status indicator (Good / Fair / Low) on each tile using standard medical thresholds
- Health Score card that shows:
  - Total score out of 100 (weighted: heart rate 35%, blood pressure 35%, sleep 30%)
  - Color-coded tier: Excellent (≥85, green), Good (70–84, amber), Needs Attention (<70, red)
  - Badge label ("Excellent Health", "Good Health", "Needs Attention")
  - Score breakdown showing contribution of each metric
  - Animated progress ring/bar for the total score
- Sleep score included in calculation even when NOT connected (manual entry always counts)
- "Complete your health check" prompt when one or more metrics are missing
- Health score also updates when sleep is entered manually

### Modify
- healthScore() — split into per-metric scoring with labels; sleep score always counted (not gated on isConnected)
- HeartRateTile — add status badge (Good/Fair/Low) based on bpm value
- BloodPressureTile — add status badge based on systolic/diastolic
- SleepTile — add status badge based on hours entered; always allow manual input regardless of connection state
- Health Score display — replace bare number with rich score card with ring, badge, and breakdown

### Remove
- Nothing removed

## Implementation Plan

1. Update healthScore logic: make sleep scoring independent of Bluetooth connection, compute per-metric scores and labels
2. Add status badge to HeartRateTile, BloodPressureTile, SleepTile
3. Replace bare score number with an animated score card: circular progress indicator, color-coded badge, per-metric breakdown list
4. Allow sleep manual input always (not just when disconnected)
5. Show "Enter sleep hours to complete your health check" prompt when sleep is null
