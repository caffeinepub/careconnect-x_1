import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! I'm CareConnect AI. How can I assist you today?",
    sender: "bot",
  },
];

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("appointment") || lower.includes("book"))
    return "I can help you book an appointment! Head to the Doctors section or click 'Book Doctor' on your dashboard.";
  if (
    lower.includes("symptom") ||
    lower.includes("sick") ||
    lower.includes("pain")
  )
    return "Please describe your symptoms in detail. You can also use our AI Symptom Checker for a more accurate analysis.";
  if (lower.includes("emergency") || lower.includes("urgent"))
    return "For emergencies, please call 112 immediately or visit the Emergency section for nearby hospitals.";
  if (lower.includes("record") || lower.includes("report"))
    return "You can view and upload medical records in the Records section. I can help you interpret results too!";
  if (lower.includes("doctor") || lower.includes("specialist"))
    return "We have 89 doctors across all specialties. Visit the Doctors section to find the right one for you!";
  if (
    lower.includes("cost") ||
    lower.includes("price") ||
    lower.includes("fee")
  )
    return "Check our Cost Comparison section to see pricing across government, private, and online consultations.";
  return "I'm here to help with your healthcare needs! You can ask me about appointments, symptoms, doctors, or records.";
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    const botMsg: Message = {
      id: Date.now() + 1,
      text: getBotResponse(input),
      sender: "bot",
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          data-ocid="chatbot.panel"
          className="absolute bottom-16 right-0 w-80 h-[420px] glass-card flex flex-col overflow-hidden animate-slideUp"
          style={{ border: "1px solid rgba(56,230,208,0.3)" }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{
              borderBottom: "1px solid rgba(56,230,208,0.15)",
              background: "rgba(56,230,208,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f9a8c9] animate-pulse" />
              <span className="text-sm font-semibold text-[#F2F6FF]">
                CareConnect AI
              </span>
            </div>
            <button
              type="button"
              data-ocid="chatbot.close_button"
              onClick={() => setOpen(false)}
              className="text-[#7F8A9B] hover:text-[#F2F6FF] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#f9a8c9] to-[#f9a8c9] text-[#000000] font-medium"
                      : "bg-[rgba(255,255,255,0.08)] text-[#cccccc]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div
            className="p-3 flex gap-2"
            style={{ borderTop: "1px solid rgba(56,230,208,0.15)" }}
          >
            <input
              data-ocid="chatbot.input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(160,190,210,0.15)] rounded-full px-4 py-2 text-xs text-[#F2F6FF] placeholder-[#7F8A9B] outline-none focus:border-[rgba(56,230,208,0.4)]"
            />
            <button
              type="button"
              data-ocid="chatbot.submit_button"
              onClick={sendMessage}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#f9a8c9] to-[#f9a8c9] flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Send size={12} className="text-[#000000]" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        data-ocid="chatbot.open_modal_button"
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#f9a8c9] to-[#f9a8c9] flex items-center justify-center shadow-lg glow-teal hover:scale-110 transition-all duration-200"
      >
        {open ? (
          <X size={22} className="text-[#000000]" />
        ) : (
          <MessageCircle size={22} className="text-[#000000]" />
        )}
      </button>
    </div>
  );
}
