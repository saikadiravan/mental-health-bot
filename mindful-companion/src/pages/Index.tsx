import { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useOnboarding } from "@/lib/onboarding-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useVoice } from "@/lib/voice-context";
import { motion } from "framer-motion";
import { Heart, Shield, Brain, BarChart3, BookOpen, PenLine, MessageCircle, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import ViewModeSelector from "@/components/ViewModeSelector";
import AvatarManager from "@/components/avatars/AvatarManager";

const features = [
  { icon: BarChart3, title: "Mood Dashboard & Trends", description: "Log daily moods with NIMHANS-aligned scales, visualize patterns, build streaks, and gain Wysa-inspired resilience insights." },
  { icon: PenLine, title: "Guided Journaling", description: "Evidence-based prompts help you reflect, process emotions, and discover recurring themes in a non-judgmental safe space." },
  { icon: BookOpen, title: "CBT & DBT Resources", description: "Woebot-style thought challenges, breathing exercises, pranayama, and culturally relevant wellness tools." },
  { icon: Shield, title: "Crisis Safety Net", description: "Immediate professional resources (NIMHANS, iCall) and hotline links. Meta-analysis backed immediacy when you need it." },
];

export default function Index() {
  const { isAuthenticated } = useAuth();
  const { hasCompleted } = useOnboarding();
  const { mode, modeConfig } = useViewMode();
  const { speak } = useVoice();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";

  useEffect(() => {
    if (!hasCompleted) {
      const timer = setTimeout(() => setShowOnboarding(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted]);

  const heroText = "1 in 8 Indians face mental health challenges. Your safe space starts here.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-green-light via-background to-accent/30">
      {showOnboarding && !hasCompleted && <OnboardingQuiz onComplete={() => setShowOnboarding(false)} />}

      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <Heart className={`${isSeniors ? "w-8 h-8" : "w-6 h-6"} text-primary`} fill="currentColor" />
          <span className={`${isSeniors ? "text-xl" : "text-lg"} font-semibold text-foreground`}>MindCompanion {isTeens && "✨"}</span>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeSelector />
          {isAuthenticated ? (
            <Button asChild size={isSeniors ? "lg" : "default"}><Link to="/mood">Open Dashboard</Link></Button>
          ) : (
            <>
              <Button variant="ghost" asChild size={isSeniors ? "lg" : "default"}><Link to="/login">Sign In</Link></Button>
              <Button asChild size={isSeniors ? "lg" : "default"}><Link to="/register">Get Started</Link></Button>
            </>
          )}
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-28">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* 3D Avatar */}
          <motion.div
            initial={modeConfig.reduceAnimations ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="shrink-0"
          >
            <Suspense fallback={<div className="w-48 h-48 rounded-2xl bg-primary/10 animate-pulse" />}>
              <AvatarManager mood="good" size="lg" />
            </Suspense>
          </motion.div>

          <motion.div
            initial={modeConfig.reduceAnimations ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5 text-center md:text-left"
          >
            {/* NIMHANS stat badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary ${isSeniors ? "text-base" : "text-sm"} font-medium`}>
              <Users className={isSeniors ? "w-5 h-5" : "w-4 h-4"} />
              230M+ Indians need mental health support (Lancet)
            </div>

            <h1 className={`${isSeniors ? "text-3xl md:text-4xl" : "text-3xl md:text-5xl"} font-bold text-foreground leading-tight text-balance`}>
              Your Safe Space for{" "}
              <span className="text-primary">Wellbeing</span>
              {isTeens && " 💫"}
            </h1>

            <p
              className={`${modeConfig.textSize} text-muted-foreground max-w-xl text-balance cursor-pointer`}
              onClick={() => speak(heroText)}
              title="Click to hear aloud"
            >
              Track moods, get CBT tips, build resilience (Wysa-inspired), guided journaling—24/7 access, no judgment.{" "}
              <span className="text-primary font-medium">NIMHANS-aligned approach.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              {!hasCompleted ? (
                <Button size="lg" className={`${isSeniors ? "text-lg px-10 py-7" : "text-base px-8 py-6"} rounded-xl shadow-soft`} onClick={() => setShowOnboarding(true)}>
                  <Brain className="w-5 h-5 mr-2" /> Start Onboarding Quiz
                </Button>
              ) : (
                <Button size="lg" className={`${isSeniors ? "text-lg px-10 py-7" : "text-base px-8 py-6"} rounded-xl shadow-soft`} asChild>
                  <Link to={isAuthenticated ? "/mood" : "/register"}><BarChart3 className="w-5 h-5 mr-2" /> Explore Dashboard</Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className={`${isSeniors ? "text-lg px-10 py-7" : "text-base px-8 py-6"} rounded-xl`} asChild>
                <Link to="/resources">CBT Resources</Link>
              </Button>
            </div>

            <Link to="/chat" className={`inline-flex items-center gap-2 ${modeConfig.textSize} text-muted-foreground hover:text-foreground transition-colors`}>
              <MessageCircle className="w-4 h-4" /> AI Chat — Coming Soon {isTeens && "🤖"}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={modeConfig.reduceAnimations ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * i }}
              className={`glass-card rounded-2xl ${modeConfig.cardPadding} flex gap-4`}>
              <div className={`${isSeniors ? "w-14 h-14" : "w-12 h-12"} rounded-xl bg-primary/10 flex items-center justify-center shrink-0`}>
                <feature.icon className={`${isSeniors ? "w-7 h-7" : "w-6 h-6"} text-primary`} />
              </div>
              <div>
                <h3 className={`font-semibold text-foreground mb-1 ${isSeniors ? "text-xl" : ""}`}>{feature.title}</h3>
                <p className={`${modeConfig.textSize} text-muted-foreground leading-relaxed`}>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ethical disclaimer */}
      <section className="max-w-3xl mx-auto px-6 pb-12 text-center">
        <p className={`${modeConfig.textSize} text-muted-foreground italic`}>
          ⚕️ MindCompanion is not a replacement for professional therapy. It is an evidence-informed self-help tool inspired by research from Woebot, Wysa, and NIMHANS. Always consult a professional for clinical needs.
        </p>
      </section>

      <footer className="border-t border-border bg-card/50 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`flex flex-col sm:flex-row items-center gap-4 ${modeConfig.textSize} text-muted-foreground`}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Private & secure (end-to-end local). Not a therapist replacement.
            </div>
            <a href="tel:9152987821" className={`flex items-center gap-2 text-primary font-medium hover:underline ${isSeniors ? "text-xl" : ""}`}>
              <Phone className={isSeniors ? "w-6 h-6" : "w-4 h-4"} />
              Crisis? Call 9152987821 (NIMHANS)
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" fill="currentColor" />
            <span className={`${modeConfig.textSize} text-muted-foreground`}>MindCompanion © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
