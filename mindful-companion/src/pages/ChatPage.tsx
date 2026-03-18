import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { detectCrisis, CRISIS_RESOURCES, CRISIS_DISCLAIMER } from "@/lib/crisis-detection";
import AppLayout from "@/components/AppLayout";
import { Send, AlertTriangle, Phone, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import CrisisModal from "@/components/CrisisModal";

interface Message {
  id: string;
  role: "user" | "assistant" | "crisis";
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I'm your **MindCompanion**. I'm here to support you. How are you feeling today? 💚",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  { label: "😰 I'm feeling anxious", message: "I'm feeling anxious" },
  { label: "📊 Track my mood", message: "Track my mood" },
  { label: "📚 Need resources", message: "I need some help resources" },
  { label: "🆘 I'm in crisis", message: "I am in crisis" },
];

// ✅ Fallback AI (old logic restored)
const KEYWORD_RESPONSES: Record<string, string> = {
  stressed: "Try a breathing exercise: inhale 4s, hold 7s, exhale 8s 🌿",
  anxious: "Try grounding: 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste 💙",
  sad: "It's okay to feel this way. Want to talk or try journaling? 💛",
  angry: "Take a deep breath and count to 10. Want to explore why you're feeling this? 🔥",
  lonely: "You're not alone. I'm here with you 🤝",
};

function getFallbackResponse(text: string): string {
  const lower = text.toLowerCase();

  for (const [key, value] of Object.entries(KEYWORD_RESPONSES)) {
    if (lower.includes(key)) return value;
  }

  if (lower.includes("track") && lower.includes("mood")) {
    return "Go to Mood Tracker 📊";
  }

  if (lower.includes("resource") || lower.includes("help")) {
    return "Check the Resources section 📚";
  }

  return "I'm here for you. Tell me more 💚";
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = "http://127.0.0.1:8000/api/chat";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 🚨 Crisis Detection
    if (detectCrisis(content)) {
      setShowCrisisModal(true);

      const crisisMsg: Message = {
        id: crypto.randomUUID(),
        role: "crisis",
        content: CRISIS_DISCLAIMER,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, crisisMsg]);
      return;
    }

    setIsTyping(true);

    let aiResponse = "";

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      aiResponse = data.response;

    } catch {
      // ✅ Fallback if backend fails
      aiResponse = getFallbackResponse(content);
    }

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full max-h-screen">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-[70%] p-3 rounded-xl ${
                  msg.role === "user" ? "bg-primary text-white" :
                  msg.role === "crisis" ? "bg-red-100 text-red-700" :
                  "bg-card border"
                }`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && <p className="text-sm text-muted-foreground">Typing...</p>}
          <div ref={bottomRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="flex gap-2 p-2 flex-wrap">
            {QUICK_REPLIES.map(q => (
              <button key={q.label} onClick={() => sendMessage(q.message)} className="text-xs border px-2 py-1 rounded">
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded p-2"
          />
          <Button onClick={() => sendMessage()} disabled={!input.trim()}>
            <Send />
          </Button>
        </div>
      </div>

      <CrisisModal open={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </AppLayout>
  );
}