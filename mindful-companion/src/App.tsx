import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { MoodProvider } from "@/lib/mood-context";
import { JournalProvider } from "@/lib/journal-context";
import { OnboardingProvider } from "@/lib/onboarding-context";
import { ViewModeProvider } from "@/lib/viewmode-context";
import { VoiceProvider } from "@/lib/voice-context";
import { ThemeProvider } from "next-themes"; // <-- NEW IMPORT
import { LanguageProvider } from "@/lib/language-context";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import MoodPage from "./pages/MoodPage";
import ResourcesPage from "./pages/ResourcesPage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import CommunityPage from "./pages/CommunityPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MoodProvider>
        <JournalProvider>
          <OnboardingProvider>
            <ViewModeProvider>
              <VoiceProvider>
                <LanguageProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />

                    <ThemeProvider
                      attribute="class"
                      defaultTheme="system"
                      enableSystem
                    >
                      <BrowserRouter>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/chat" element={<ChatPage />} />
                          <Route path="/mood" element={<MoodPage />} />
                          <Route path="/resources" element={<ResourcesPage />} />
                          <Route path="/journal" element={<JournalPage />} />
                          <Route path="/community" element={<CommunityPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </ThemeProvider>

                  </TooltipProvider>
                </LanguageProvider>
              </VoiceProvider>
            </ViewModeProvider>
          </OnboardingProvider>
        </JournalProvider>
      </MoodProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;