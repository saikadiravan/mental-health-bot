import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Bell,
  Trash2,
  Phone,
  Eye,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useOnboarding } from "@/lib/onboarding-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useVoice } from "@/lib/voice-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";

import OnboardingQuiz from "@/components/OnboardingQuiz";
import ViewModeSelector from "@/components/ViewModeSelector";

const CRISIS_HOTLINES = [
  { name: "NIMHANS Helpline (India)", number: "080-46110007" },
  { name: "iCall (India)", number: "9152987821" },
  { name: "Vandrevala Foundation", number: "1860-2662-345" },
  { name: "National Suicide Prevention", number: "988 (US)" },
  { name: "Crisis Text Line", number: "Text HOME to 741741" },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false); // ✅ FIX
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [shareData, setShareData] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const { mode, modeConfig } = useViewMode();
  const { voiceEnabled, toggleVoice } = useVoice();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true); // ✅ FIX
  }, []);

  if (!mounted) return null; // ✅ Prevent hydration issues

  const clearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";

  const sectionTitle = `${isSeniors ? "text-base" : "text-sm"} font-semibold`;
  const labelSize = `${isSeniors ? "text-base" : "text-sm"} font-medium text-foreground`;
  const descSize = `${isSeniors ? "text-sm" : "text-xs"} text-muted-foreground`;

  return (
    <AppLayout>
      {showQuiz && <OnboardingQuiz onComplete={() => setShowQuiz(false)} />}

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div>
          <h1 className={`${modeConfig.headingSize} font-semibold text-foreground`}>
            Settings {isTeens && "⚙️"}
          </h1>
          <p className={`${modeConfig.textSize} text-muted-foreground mt-1`}>
            Manage privacy, preferences, voice, and crisis contacts
          </p>
        </div>

        <motion.div
          className="space-y-4"
          initial={modeConfig.reduceAnimations ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Theme */}
          <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-5`}>
            <div className={`flex items-center gap-2 ${sectionTitle}`}>
               Theme
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className={labelSize}>Dark Mode</Label>
                <p className={descSize}>
                  Switch between light and dark theme
                </p>
              </div>

              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked: boolean) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </div>

          {/* Voice */}
          <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-5`}>
            <div className={`flex items-center gap-2 ${sectionTitle}`}>
              <Volume2 className={modeConfig.iconSize} /> Voice & Accessibility
            </div>

            <div className="flex items-center justify-between">
              <Label className={labelSize}>Voice Narration</Label>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={(checked: boolean) => toggleVoice()}
              />
            </div>
          </div>

          {/* Privacy */}
          <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-5`}>
            <div className={`flex items-center gap-2 ${sectionTitle}`}>
              <Shield className={modeConfig.iconSize} /> Privacy
            </div>

            <div className="flex items-center justify-between">
              <Label className={labelSize}>Anonymous Mode</Label>
              <Switch
                checked={anonymousMode}
                onCheckedChange={(checked: boolean) => setAnonymousMode(checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className={labelSize}>Share Data</Label>
              <Switch
                checked={shareData}
                onCheckedChange={(checked: boolean) => setShareData(checked)}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-5`}>
            <div className={`flex items-center gap-2 ${sectionTitle}`}>
              <Bell className={modeConfig.iconSize} /> Notifications
            </div>

            <div className="flex items-center justify-between">
              <Label className={labelSize}>Daily Reminder</Label>
              <Switch
                checked={notifications}
                onCheckedChange={(checked: boolean) => setNotifications(checked)}
              />
            </div>
          </div>

          {/* Crisis Contacts */}
          <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-4`}>
            <div className={`flex items-center gap-2 ${sectionTitle}`}>
              <Phone className={modeConfig.iconSize} /> Crisis Contacts
            </div>

            {CRISIS_HOTLINES.map((h) => (
              <div key={h.name} className="flex justify-between">
                <span>{h.name}</span>
                <a href={`tel:${h.number}`}>{h.number}</a>
              </div>
            ))}
          </div>

          {/* Data */}
          <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-4`}>
            <div className={`flex items-center gap-2 ${sectionTitle}`}>
              <Trash2 className={modeConfig.iconSize} /> Data Management
            </div>

            <Button variant="destructive" onClick={clearData}>
              Erase All Data
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}