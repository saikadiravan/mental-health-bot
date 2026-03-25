import { useState, useRef, useEffect } from "react";
import { Message, CommunityRoom } from "@/lib/community-data";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  room: CommunityRoom | null;
  messages: Message[];
  onSend: (text: string) => void;
  isSending?: boolean;
  currentUserId?: string;
}

export default function ChatWindow({
  room,
  messages,
  onSend,
  isSending = false,
  currentUserId = "current-user",
}: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (room) inputRef.current?.focus();
  }, [room]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center">
        <div className="text-5xl mb-4 opacity-70">💬</div>
        <p className="font-medium">Select a group to start chatting</p>
        <p className="text-xs mt-2 opacity-80">
          Join conversations and connect with others
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3.5 border-b bg-muted/40">
        <h3 className="text-base font-semibold text-foreground truncate">
          {room.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {room.description}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <div className="text-5xl mb-4 opacity-70">🌱</div>
            <p className="font-medium">No messages yet</p>
            <p className="text-xs mt-2 max-w-xs text-center">
              Be the first to say hello 🙂
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user === currentUserId;
            let displayTime = "just now";

            if (msg.time) {
              try {
                const date = new Date(msg.time);
                if (!isNaN(date.getTime())) {
                  displayTime = formatDistanceToNow(date, { addSuffix: true });
                } else {
                  displayTime = msg.time;
                }
              } catch {
                displayTime = msg.time;
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
              >
                <div
                  className={`
                    max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm
                    ${isOwn
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"}
                  `}
                >
                  {!isOwn && (
                    <div className="font-medium text-xs mb-1 opacity-90">
                      {msg.user}
                    </div>
                  )}
                  <p className="break-words">{msg.text}</p>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {displayTime}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isSending}
          className="flex-1 px-4 py-2.5 rounded-full bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className={`
            px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-1.5
            ${input.trim() && !isSending
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed"}
          `}
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}