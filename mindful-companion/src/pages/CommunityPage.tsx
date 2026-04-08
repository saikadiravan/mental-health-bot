import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import CommunityList from "@/components/CommunityList";
import ChatWindow from "@/components/ChatWindow";

import { rooms, messagesByRoom, Message, CommunityRoom } from "@/lib/community-data";
import { motion } from "framer-motion";

export default function CommunityPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(messagesByRoom);

  // Auto-select first room if nothing is selected
  useEffect(() => {
    if (selectedRoomId === null && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [selectedRoomId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;

  const handleSendMessage = (text: string) => {
    if (!selectedRoomId) return;

    const now = new Date();

    const newMessage: Message = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user: "You",
      text,
      time: now.toISOString(),          // ← correct format → date-fns will work
    };

    setMessages((prev) => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] ?? []), newMessage],
    }));
  };

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkScreen = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkScreen(); // run once
  window.addEventListener("resize", checkScreen);

  return () => window.removeEventListener("resize", checkScreen);
}, []);
  const showListOnMobile = !selectedRoomId;
  const showChatOnMobile = !!selectedRoomId;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 md:px-6 pt-6 pb-4 border-b bg-card/50">
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span className="text-2xl md:text-3xl">👥</span> Community
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1.5">
            Connect with others, share experiences, and support each other.
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Group list – hidden on mobile when chat is open */}
          {( !isMobile || showListOnMobile ) && (
            <div className="hidden md:block md:w-80 lg:w-96 border-r bg-card/30 overflow-hidden">
              <CommunityList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelect={setSelectedRoomId}
              />
            </div>
          )}

          {/* Chat area */}
          {( !isMobile || showChatOnMobile ) && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Mobile back button */}
              {isMobile && selectedRoomId && (
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="md:hidden p-4 border-b bg-card flex items-center gap-2 text-primary font-medium hover:bg-muted/50"
                  aria-label="Return to group list"
                >
                  ← Back to Groups
                </button>
              )}

              <ChatWindow
                room={selectedRoom}
                messages={selectedRoomId ? messages[selectedRoomId] ?? [] : []}
                onSend={handleSendMessage}
                currentUserId="current-user"
              />
            </div>
          )}

          {/* Mobile placeholder when no room selected */}
          {isMobile && !selectedRoomId && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
              <div>
                <div className="text-6xl mb-4 opacity-70">👥</div>
                <p className="text-lg font-medium">Choose a group</p>
                <p className="text-sm mt-2">Tap a group from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}