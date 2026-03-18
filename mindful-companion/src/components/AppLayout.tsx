import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useViewMode } from "@/lib/viewmode-context";
import { MessageCircle, BarChart3, BookOpen, LogOut, Heart, Home, Settings, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import StreakHeader from "@/components/StreakHeader";
import ViewModeSelector from "@/components/ViewModeSelector";
import VoiceOfflineControls from "@/components/VoiceOfflineControls";

const navItems = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/mood", label: "Dashboard", icon: BarChart3 },
  { to: "/journal", label: "Journal", icon: PenLine },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/chat", label: "Chat", icon: MessageCircle, badge: "Soon" },
  { to: "/settings", label: "Settings", icon: Settings },
];

const mobileNavItems = navItems.filter(n => n.to !== "/settings" && n.to !== "/" && n.to !== "/chat");

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { mode, modeConfig } = useViewMode();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";
  const navTextSize = isSeniors ? "text-base" : "text-sm";
  const navIconSize = isSeniors ? "w-6 h-6" : "w-4 h-4";
  const navPadding = isSeniors ? "px-5 py-4" : "px-4 py-3";

  return (
    <div className="flex h-screen bg-background">
      <aside className={`hidden md:flex flex-col ${isSeniors ? "w-72" : "w-64"} border-r border-border bg-card/50 p-6`} role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-2 mb-8">
          <Heart className={`${isSeniors ? "w-8 h-8" : "w-6 h-6"} text-primary`} fill="currentColor" />
          <span className={`${isSeniors ? "text-xl" : "text-lg"} font-semibold text-foreground`}>
            MindCompanion {isTeens && "✨"}
          </span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `flex items-center gap-3 ${navPadding} rounded-lg ${navTextSize} font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <item.icon className={navIconSize} />
              {item.label}
              {item.badge && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border pt-4 mt-4">
          <p className={`${isSeniors ? "text-sm" : "text-xs"} text-muted-foreground mb-2 truncate`}>{user?.name}</p>
          <button onClick={handleLogout} className={`flex items-center gap-2 ${navTextSize} text-muted-foreground hover:text-foreground transition-colors`} aria-label="Sign out">
            <LogOut className={navIconSize} /> Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur border-t border-border" role="navigation" aria-label="Mobile navigation">
        <nav className="flex justify-around py-2">
          {mobileNavItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-2 ${isSeniors ? "text-sm" : "text-xs"} font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className={isSeniors ? "w-7 h-7" : "w-5 h-5"} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 bg-card/30">
          <div className="flex items-center gap-2 md:hidden">
            <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            <span className="text-sm font-semibold text-foreground">MC {isTeens && "✨"}</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <VoiceOfflineControls />
            <ViewModeSelector />
            <StreakHeader />
          </div>
        </header>
        <motion.main className="flex-1 overflow-auto pb-20 md:pb-0" initial={modeConfig.reduceAnimations ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
