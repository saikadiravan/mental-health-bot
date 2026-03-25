import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useViewMode } from "@/lib/viewmode-context";
import { detectCrisis, CRISIS_DISCLAIMER } from "@/lib/crisis-detection";
import AppLayout from "@/components/AppLayout";
import { Send, AlertTriangle, Bot, User, History, MessageSquarePlus, Edit2, Check, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import CrisisModal from "@/components/CrisisModal";

interface Message { id: string; role: "user" | "assistant" | "crisis"; content: string; timestamp: Date; status: "sending" | "sent" | "delivered"; }

interface ChatSession { id: string; title: string; messages: Message[]; updatedAt: string; }

const WELCOME_MESSAGES: Record<string, any> = {
  teens: { normal: "Hey friend 💚 I'm here to listen — how are you feeling today?", custom: "Hey bestie! 🌸 What's been on your mind?" },
  adults: { normal: "Hello, I'm here to support you. What's on your mind today?", custom: "Good to see you. Let's focus on what matters most right now." },
  seniors: { normal: "Hello dear, I'm right here with you. How have you been feeling?", custom: "Hello my dear... come sit with me. Tell me what's been on your heart." }
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
    ]
  },
  adults: {
    normal: [{ label: "📊 Track my mood", message: "Track my mood" }, { label: "🔥 Feeling stressed at work", message: "I'm stressed about work" }],
    custom: [{ label: "📈 Need clarity", message: "I need clarity on my goals" }, { label: "⚡ Feeling stuck", message: "I'm feeling stuck" }]
  },
  seniors: {
    normal: [{ label: "📊 Track my mood", message: "Track my mood" }, { label: "🕰️ Feeling lonely", message: "I'm feeling a bit lonely" }],
    custom: [{ label: "🕰️ Reminiscing", message: "I miss the old days" }, { label: "❤️ Need comfort", message: "I need some comfort" }]
  }
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

  // --- STATES ---
  const [specialMode, setSpecialMode] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(ANIME_CHARACTERS[0]); // default Tohru
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("mhc_chats");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({ ...s, messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) }));
    } catch { return []; }
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

  // Dynamic config
  const isCustomMode = specialMode;
  const currentWelcome = WELCOME_MESSAGES[mode]?.[isCustomMode ? "custom" : "normal"] || WELCOME_MESSAGES.teens.normal;
  const currentQuickReplies = QUICK_REPLIES_CONFIG[mode]?.[isCustomMode ? "custom" : "normal"] || QUICK_REPLIES_CONFIG.teens.normal;

  useEffect(() => {
    // Set initial welcome when mode or specialMode changes
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: currentWelcome,
        timestamp: new Date(),
        status: "delivered"
      }]);
    }
  }, [mode, specialMode]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 1) return;
    setSessions(prev => {
      const newSession: ChatSession = { id: currentSessionId, title: chatTitle, messages, updatedAt: new Date().toISOString() };
      const existingIndex = prev.findIndex(s => s.id === currentSessionId);
      const updated = existingIndex >= 0 ? [...prev] : [newSession, ...prev];
      if (existingIndex >= 0) updated[existingIndex] = newSession;
      localStorage.setItem("mhc_chats", JSON.stringify(updated));
      return updated;
    });
  }, [messages, chatTitle, currentSessionId]);

  const startNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
    setMessages([{ id: "welcome", role: "assistant", content: currentWelcome, timestamp: new Date(), status: "delivered" }]);
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
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem("mhc_chats", JSON.stringify(updated));
      return updated;
    });
    if (currentSessionId === id) startNewChat();
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || !user) return;

    if (messages.length === 1 && chatTitle === "New Conversation") {
      setChatTitle(content.slice(0, 25) + (content.length > 25 ? "..." : ""));
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, timestamp: new Date(), status: "sent" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (detectCrisis(content)) {
      setShowCrisisModal(true);
      const crisisMsg: Message = { id: crypto.randomUUID(), role: "crisis", content: CRISIS_DISCLAIMER, timestamp: new Date(), status: "delivered" };
      setMessages(prev => [...prev, crisisMsg]);
      setIsTyping(false);
      return;
    }

    const historyPayload = messages
      .filter(m => m.id !== "welcome" && m.role !== "crisis")
      .map(m => ({ role: m.role, content: m.content }));

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
          history: historyPayload
        }),
      });

      if (!response.ok) throw new Error("Failed to communicate with AI");

      const data = await response.json();
      const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: data.response, timestamp: new Date(), status: "delivered" };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "I'm having a little trouble connecting right now. Please try again. 🔌", timestamp: new Date(), status: "delivered" };
      setMessages(prev => [...prev, errorMsg]);
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
      <div className="flex flex-col h-full max-h-screen">
        {/* HEADER - IMPROVED */}
        <div className="border-b border-border px-4 md:px-6 py-3 bg-card/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${specialMode ? "bg-violet-100 dark:bg-violet-900 shadow-[0_0_15px_#a855f7]" : "bg-primary/10"}`}
              animate={specialMode ? { boxShadow: "0 0 20px #a855f7" } : {}}
            >
              <Bot className="w-5 h-5 text-primary" />
            </motion.div>

            <div className="flex flex-col">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input value={chatTitle} onChange={(e) => setChatTitle(e.target.value)} className="text-sm font-semibold bg-background border border-input rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary w-[150px] md:w-[200px]" autoFocus onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)} />
                  <button onClick={() => setIsEditingTitle(false)} className="text-green-500 hover:text-green-600"><Check className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-sm font-semibold text-foreground truncate max-w-[150px] md:max-w-[300px]">
                    {chatTitle} {specialMode && mode === "teens" && <span className="ml-1">{selectedCharacter.emoji}</span>}
                  </h2>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {specialMode
                  ? mode === "teens"
                    ? `Anime Mode • ${selectedCharacter.name}`
                    : mode === "adults"
                      ? "Executive Coach Mode 📈"
                      : "Nostalgic Companion Mode 🕰️"
                  : "MindCompanion AI • Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* SPECIAL MODE TOGGLE */}
            <div className="flex items-center gap-2 border-r border-border pr-4">
              <Switch checked={specialMode} onCheckedChange={setSpecialMode} id="special-mode" />
              <Label htmlFor="special-mode" className="text-xs font-semibold cursor-pointer hidden sm:flex items-center gap-1">
                {mode === "teens" ? "Anime Mode" : mode === "adults" ? "Coach Mode" : "Nostalgia Mode"}
                <span className="text-base">{mode === "teens" ? "🌸" : mode === "adults" ? "📈" : "🕰️"}</span>
              </Label>
            </div>

            {/* TEENS CHARACTER PICKER BUTTON (only when custom + teens) */}
            {mode === "teens" && specialMode && (
              <Button variant="ghost" size="sm" onClick={() => setShowCharacterPicker(true)} className="gap-1">
                <Sparkles className="w-4 h-4" />
                {selectedCharacter.emoji}
              </Button>
            )}

            {/* HISTORY + NEW CHAT */}
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                    <History className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2">Conversation History</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center mt-10">No past conversations yet.</p>
                    ) : (
                      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(s => (
                        <div key={s.id} onClick={() => loadSession(s)} className={`p-3 rounded-xl border cursor-pointer group flex justify-between ${s.id === currentSessionId ? 'bg-primary/10 border-primary' : 'hover:bg-secondary'}`}>
                          <div>
                            <h4 className="text-sm font-medium truncate">{s.title}</h4>
                            <p className="text-[10px] text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <button onClick={(e) => deleteSession(s.id, e)} className="opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              <Button onClick={startNewChat} className="h-9 rounded-xl gap-2">
                <MessageSquarePlus className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            </div>
          </div>
        </div>

        {/* CHARACTER PICKER SHEET (only teens + custom) */}
        <Sheet open={showCharacterPicker} onOpenChange={setShowCharacterPicker}>
          <SheetContent side="bottom" className="h-[420px]">
            <SheetHeader>
              <SheetTitle>Choose your Anime Companion 🌸</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {ANIME_CHARACTERS.map(char => (
                <button
                  key={char.name}
                  onClick={() => {
                    setSelectedCharacter(char);
                    setShowCharacterPicker(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-center gap-2 ${selectedCharacter.name === char.name ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "hover:border-border"}`}
                >
                  <span className="text-4xl">{char.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{char.name}</p>
                    <p className="text-xs text-muted-foreground">{char.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* REST OF CHAT (messages, input, etc.) remains exactly the same except dynamic quick replies */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-secondary text-secondary-foreground" : msg.role === "crisis" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : msg.role === "crisis" ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : msg.role === "crisis" ? "bg-destructive/10 text-destructive" : "bg-card border border-border rounded-tl-sm"}`}>
                  <div className="text-sm prose dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className={`text-[10px] mt-2 ${msg.role === "user" ? "text-right text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
              <div className="px-4 py-3 rounded-2xl bg-card border border-border flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 md:p-6 bg-background border-t border-border">
          {messages.length <= 2 && !isTyping && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuickReplies.map((reply: any) => (
                <button key={reply.label} onClick={() => sendMessage(reply.message)} className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:bg-secondary transition-colors">
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm min-h-[50px] max-h-[150px]" rows={1} />
            <Button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} size="icon" className="h-[50px] w-[50px] shrink-0 rounded-xl">
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">MindCompanion AI can make mistakes. For serious concerns, please consult a professional.</p>
        </div>
      </div>
      <CrisisModal open={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </AppLayout>
  );
}