# CareConnect X

## Current State
The floating chatbot (`FloatingChatbot.tsx`) uses a simple keyword-matching `getBotResponse()` function. It opens a panel, shows messages, and responds with hardcoded strings based on keywords like 'appointment', 'symptom', etc. No streaming, no typing indicator, no conversation depth.

## Requested Changes (Diff)

### Add
- Typing indicator (animated dots) while the AI is "thinking"
- Richer simulated AI response engine with contextual multi-turn awareness (remembers prior messages in the session)
- Suggested quick-reply chips at the bottom for common health questions
- Message timestamps on each bubble
- Auto-scroll to latest message
- Conversation history persists while navigating between screens (via module-level state or context)
- "Clear chat" button in the header

### Modify
- Replace `getBotResponse()` with a smarter `getAIResponse()` that handles more medical topics with longer, more natural responses and simulates a 1–2 second async delay
- Panel height increased to 480px for better readability
- Input area supports multi-line (Shift+Enter) and single Enter to send

### Remove
- Nothing removed

## Implementation Plan
1. Upgrade `FloatingChatbot.tsx` with async `getAIResponse()` — 1.2s simulated delay, returns contextual health advice
2. Add typing indicator (three bouncing dots) shown while awaiting response
3. Add quick-reply suggestion chips below the input
4. Auto-scroll to bottom on new messages using `useRef` + `useEffect`
5. Add timestamps to each message bubble
6. Add "Clear chat" button in panel header
7. Persist messages in module-level variable so they survive route changes
