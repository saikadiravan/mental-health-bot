import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useViewMode } from "@/lib/viewmode-context";
import { detectCrisis, CRISIS_DISCLAIMER } from "@/lib/crisis-detection";
import AppLayout from "@/components/AppLayout";
import { Send, AlertTriangle, Bot, User, History, MessageSquarePlus, Check, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import CrisisModal from "@/components/CrisisModal";

interface Message {
  id: string;
  role: "user" | "assistant" | "crisis";
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const WELCOME_MESSAGES: Record<string, any> = {
  teens: {
    normal: "Hey friend 💚 I'm here to listen — how are you feeling today?",
    custom: "Hey bestie! 🌸 What's been on your mind?",
  },
  adults: {
    normal: "Hello, I'm here to support you. What's on your mind today?",
    custom: "Good to see you. Let's focus on what matters most right now.",
  },
  seniors: {
    normal: "Hello dear, I'm right here with you. How have you been feeling?",
    custom: "Hello my dear... come sit with me. Tell me what's been on your heart.",
  },
};

const QUICK_REPLIES_CONFIG: Record<string, any> = {
  teens: {
    normal: [
      { label: "😰 I'm feeling anxious", message: "I'm feeling anxious" },
      { label: "📊 Track my mood", message: "Track my mood" },
      { label: "📚 Need resources", message: "I need some self-help resources" },
    ],
    custom: [
      { label: "🌸 Feeling overwhelmed", message: "I'm feeling overwhelmed" },
      { label: "⭐ Need encouragement", message: "I need some encouragement" },
      { label: "🎨 Just want to talk", message: "I just want to talk about my day" },
    ],
  },
  adults: {
    normal: [
      { label: "📊 Track my mood", message: "Track my mood" },
      { label: "🔥 Feeling stressed at work", message: "I'm stressed about work" },
    ],
    custom: [
      { label: "📈 Need clarity", message: "I need clarity on my goals" },
      { label: "⚡ Feeling stuck", message: "I'm feeling stuck" },
    ],
  },
  seniors: {
    normal: [
      { label: "📊 Track my mood", message: "Track my mood" },
      { label: "🕰️ Feeling lonely", message: "I'm feeling a bit lonely" },
    ],
    custom: [
      { label: "🕰️ Reminiscing", message: "I miss the old days" },
      { label: "❤️ Need comfort", message: "I need some comfort" },
    ],
  },
};

const ANIME_CHARACTERS = [
  { name: "Tohru Honda", emoji: "🌸", desc: "Warm, nurturing friend" },
  { name: "Ochaco Uraraka", emoji: "⭐", desc: "Cheerful & uplifting" },
  { name: "Hinata Hyuga", emoji: "🌼", desc: "Gentle & encouraging" },
  { name: "Marin Kitagawa", emoji: "🎨", desc: "Bubbly & creative" },
  { name: "Komi Shouko", emoji: "🦋", desc: "Quiet empathetic listener" },
  { name: "Anya Forger", emoji: "🍎", desc: "Playful & adorable" },
];

export default function ChatPage() {
  const { user } = useAuth();
  const { mode } = useViewMode();

  const [specialMode, setSpecialMode] = useState(false);
  const [breakupMode, setBreakupMode] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(ANIME_CHARACTERS[0]);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("mhc_chats");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
      }));
    } catch {
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => crypto.randomUUID());
  const [chatTitle, setChatTitle] = useState("New Conversation");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL = "http://127.0.0.1:8000/api/chat";

  const isCustomMode = specialMode;
  const currentWelcome =
    WELCOME_MESSAGES[mode]?.[isCustomMode ? "custom" : "normal"] || WELCOME_MESSAGES.teens.normal;
  const currentQuickReplies =
    QUICK_REPLIES_CONFIG[mode]?.[isCustomMode ? "custom" : "normal"] || QUICK_REPLIES_CONFIG.teens.normal;

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: currentWelcome,
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
    }
  }, [mode, specialMode, currentWelcome]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-save sessions to localStorage
  useEffect(() => {
    if (messages.length <= 1) return;

    setSessions((prev) => {
      const newSession: ChatSession = {
        id: currentSessionId,
        title: chatTitle,
        messages,
        updatedAt: new Date().toISOString(),
      };
      const existingIndex = prev.findIndex((s) => s.id === currentSessionId);
      const updated = [...prev];
      if (existingIndex >= 0) {
        updated[existingIndex] = newSession;
      } else {
        updated.unshift(newSession);
      }
      localStorage.setItem("mhc_chats", JSON.stringify(updated));
      return updated;
    });
  }, [messages, chatTitle, currentSessionId]);

  const startNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: currentWelcome,
        timestamp: new Date(),
        status: "delivered",
      },
    ]);
    setChatTitle("New Conversation");
    setIsEditingTitle(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setChatTitle(session.title);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem("mhc_chats", JSON.stringify(updated));
      return updated;
    });
    if (currentSessionId === id) startNewChat();
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || !user) return;

    const payload = {
    message: content,
    user_id: user.id,
    view_mode: mode,
    special_mode: specialMode,
    breakup_mode: breakupMode, // <-- ADD THIS LINE
    character: isCustomMode ? selectedCharacter.name : undefined,
    history: messages.map(m => ({ role: m.role, content: m.content }))
  };


    if (messages.length === 1 && chatTitle === "New Conversation") {
      setChatTitle(content.slice(0, 30) + (content.length > 30 ? "..." : ""));
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (detectCrisis(content)) {
      setShowCrisisModal(true);
      const crisisMsg: Message = {
        id: crypto.randomUUID(),
        role: "crisis",
        content: CRISIS_DISCLAIMER,
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, crisisMsg]);
      setIsTyping(false);
      return;
    }

    const historyPayload = messages
      .filter((m) => m.id !== "welcome" && m.role !== "crisis")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          user_id: user.id,
          view_mode: mode,
          special_mode: specialMode,
          character: specialMode && mode === "teens" ? selectedCharacter.name : null,
          history: historyPayload,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again later. 🔌",
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full max-h-screen overflow-hidden">

        {/* HEADER */}
        <div className="border-b border-border px-6 py-4 bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                specialMode ? "bg-violet-100 dark:bg-violet-950 shadow-md" : "bg-primary/10"
              }`}
              animate={specialMode ? { scale: [1, 1.05, 1] } : {}}
            >
              <Bot className="w-6 h-6 text-primary" />
            </motion.div>

            <div className="min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    value={chatTitle}
                    onChange={(e) => setChatTitle(e.target.value)}
                    className="font-semibold bg-background border border-input rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-52"
                    autoFocus
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                  />
                  <button onClick={() => setIsEditingTitle(false)} className="text-green-600">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h2 className="font-semibold text-lg flex items-center gap-2 truncate">
                  {chatTitle}
                  {specialMode && mode === "teens" && (
                    <span className="text-xl">{selectedCharacter.emoji}</span>
                  )}
                </h2>
              )}
              <p className="text-xs text-muted-foreground">
                {specialMode
                  ? mode === "teens"
                    ? `Anime Companion • ${selectedCharacter.name}`
                    : mode === "adults"
                    ? "Executive Coach Mode"
                    : "Nostalgic Companion"
                  : "MindCompanion AI • Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Special Mode Toggle */}
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <Switch checked={specialMode} onCheckedChange={setSpecialMode} id="special-mode" />
              <Label htmlFor="special-mode" className="text-sm font-medium cursor-pointer hidden sm:block">
                {mode === "teens" ? "Anime Mode 🌸" : mode === "adults" ? "Coach Mode 📈" : "Nostalgia Mode 🕰️"}
              </Label>
            </div>

            {mode === "teens" && specialMode && (
              <Button variant="outline" size="sm" onClick={() => setShowCharacterPicker(true)} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Companion
              </Button>
            )}

            {mode === "adults" && (
  <div className="flex items-center justify-between space-x-2 py-2">
    <Label htmlFor="breakup-mode" className="text-sm font-medium">
      Breakup Recovery Mode
    </Label>
    <Switch 
      id="breakup-mode" 
      checked={breakupMode} 
      onCheckedChange={setBreakupMode} 
    />
  </div>
)}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96">
                <SheetHeader>
                  <SheetTitle>Conversation History</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No past conversations yet.</p>
                  ) : (
                    sessions
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .map((s) => (
                        <div
                          key={s.id}
                          onClick={() => loadSession(s)}
                          className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-start hover:bg-accent transition-colors ${
                            s.id === currentSessionId ? "bg-primary/10 border-primary" : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{s.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(s.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteSession(s.id, e)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={startNewChat} className="gap-2">
              <MessageSquarePlus className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* CHARACTER PICKER - Fixed for Light Mode */}
        {/* CONSISTENT ANIME CHARACTER PICKER */}
<Sheet open={showCharacterPicker} onOpenChange={setShowCharacterPicker}>
  <SheetContent 
    side="right" 
    className="w-full max-w-md sm:max-w-lg p-0 border-l border-border"
  >
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold">Choose Your Anime Companion</h2>
          <p className="text-muted-foreground text-sm mt-1">Pick someone who feels right for you today 🌸</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowCharacterPicker(false)}
          className="rounded-full hover:bg-muted"
        >
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ANIME_CHARACTERS.map((char) => {
          const isSelected = selectedCharacter.name === char.name;
          return (
            <motion.button
              key={char.name}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedCharacter(char);
                // Optional: auto close after selection
                // setShowCharacterPicker(false);
              }}
              className={`group relative h-full p-5 rounded-3xl border transition-all flex flex-col items-center text-center overflow-hidden
                ${isSelected 
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950 shadow-md" 
                  : "border-border bg-card hover:border-violet-200 hover:shadow-sm dark:hover:border-violet-800"
                }`}
            >
              <div className={`text-5xl mb-4 transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                {char.emoji}
              </div>

              <p className="font-medium text-base mb-1 leading-tight">{char.name}</p>
              <p className="text-xs text-muted-foreground leading-snug min-h-[2.5rem]">{char.desc}</p>

              {isSelected && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-medium px-4 py-1 rounded-full flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3" /> Selected
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={() => setShowCharacterPicker(false)} 
          variant="outline" 
          className="px-10"
        >
          Done
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>

        {/* CHAT MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.role === "crisis"
                      ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                      : "bg-violet-100 dark:bg-violet-950 text-violet-600"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-5 h-5" /> : msg.role === "crisis" ? <AlertTriangle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-[75%] px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : msg.role === "crisis"
                      ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
                      : "bg-card border border-border rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  <div className="text-[10px] mt-2 opacity-70 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-600" />
              </div>
              <div className="px-5 py-3.5 bg-card border border-border rounded-3xl flex items-center gap-1.5">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT BOX - NOW RESTORED */}
        <div className="border-t border-border bg-card p-6">
          {/* Quick Replies */}
          {messages.length <= 3 && !isTyping && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuickReplies.map((reply: any, index: number) => (
                <button
                  key={index}
                  onClick={() => sendMessage(reply.message)}
                  className="px-4 py-2 text-sm rounded-full border bg-white hover:bg-accent dark:bg-gray-900 dark:border-gray-700 transition-colors"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-1 resize-y min-h-[52px] max-h-[160px] rounded-2xl border border-input bg-background px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              rows={1}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-[52px] w-[52px] rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-4">
            MindCompanion AI can make mistakes. For serious concerns, please consult a professional.
          </p>
        </div>
      </div>

      <CrisisModal open={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </AppLayout>
  );
}