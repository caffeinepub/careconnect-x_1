# CareConnect X

## Current State
CostComparisonPage has 3 cards: Government Hospital, Online Consultation, Private Hospital. The "Book Online Now" button on the Online Consultation card has no action (onCtaClick is undefined). The Government and Private cards open Google Maps.

## Requested Changes (Diff)

### Add
- Multi-step booking modal triggered by "Book Online Now" on the Online Consultation card
- Also add "Book Online Now" CTA to Government and Private hospital cards
- Step 1: Select disease/condition (dropdown) and select a doctor from a filtered list based on condition
- Step 2: Select appointment date (date picker) and time slot
- Step 3: Confirmation screen showing doctor name, specialization, disease, date, time, estimated price, and a simulated tablet prescription from the doctor

### Modify
- CostComparisonPage.tsx: wire up "Book Online Now" modal for all three cards (price range varies by hospital type)

### Remove
- Nothing

## Implementation Plan
1. Add booking modal state and multi-step flow to CostComparisonPage.tsx
2. Step 1: condition dropdown (common conditions) + doctor list filtered by condition
3. Step 2: date picker + time slot grid
4. Step 3: summary with doctor, disease, date/time, estimated price, and prescription table
5. Style consistent with existing black/white/pink theme
