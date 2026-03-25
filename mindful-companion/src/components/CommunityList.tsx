import { CommunityRoom } from "@/lib/community-data";
import { Users, Hash, Star, Loader2 } from "lucide-react";

interface CommunityRoomExtended extends CommunityRoom {
  memberCount?: number;     // made optional if not always present
  isFeatured?: boolean;     // optional highlight flag
}

interface Props {
  rooms: CommunityRoomExtended[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  loading?: boolean;        // optional prop for loading state
  error?: string | null;    // optional error message
}

export default function CommunityList({
  rooms,
  selectedRoomId,
  onSelect,
  loading = false,
  error = null,
}: Props) {
  return (
    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r bg-card/50 md:bg-card overflow-hidden flex flex-col">
      {/* Sticky Header */}
      <div className="p-4 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-primary flex-shrink-0" />
          <h2 className="text-lg font-semibold text-foreground">
            Community Groups
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Join conversations and connect with others
        </p>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading groups...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-destructive">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-medium">Something went wrong</p>
            <p className="text-xs mt-2 max-w-xs">{error}</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground text-center">
            <Hash className="h-10 w-10 mx-auto mb-4 opacity-70" />
            <p className="font-medium text-base">No groups available yet</p>
            <p className="text-xs mt-2 max-w-xs">
              New community groups will appear here soon
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {rooms.map((room) => {
              const isActive = room.id === selectedRoomId;
              const isHighlighted = room.isFeatured || (room.memberCount ?? 0) > 50;

              return (
                <button
                  key={room.id} // ← critical: stable key
                  type="button"
                  onClick={() => onSelect(room.id)}
                  className={`
                    w-full text-left rounded-xl p-3.5 transition-all duration-200
                    border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
                    ${isActive
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-card hover:bg-muted/70 border-border hover:border-primary/40"
                    }
                  `}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Select group: ${room.name}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {room.name || "Unnamed Group"}
                        </p>
                        {isHighlighted && (
                          <Star
                            className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {room.description || "No description available"}
                      </p>
                    </div>

                    {(room.memberCount ?? 0) > 0 && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}