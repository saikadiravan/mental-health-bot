import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useOnboarding } from "@/lib/onboarding-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useVoice } from "@/lib/voice-context";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, PenLine, Brain, Timer, ExternalLink, BookOpen, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResourceCard {
  title: string;
  description: string;
  icon: React.ElementType;
  category: "mindfulness" | "journaling" | "cbt" | "dbt" | "external" | "cultural";
  content?: string;
  link?: string;
  tags?: string[];
  teenNote?: string;
  seniorNote?: string;
}

const resourceCards: ResourceCard[] = [
  {
    title: "CBT Thought Challenge (Woebot-style)",
    description: "Challenge anxious thoughts with evidence-based CBT",
    icon: Zap,
    category: "cbt",
    tags: ["cbt", "anxiety"],
    teenNote: "🧠 Train your brain like a boss!",
    content: "Woebot-Inspired Thought Challenge:\n\n1. CATCH the thought: What negative thought popped up?\n2. CHECK it: What evidence supports it? What contradicts it?\n3. CHANGE it: What's a more balanced way to see this?\n\nExample:\nThought: 'I'll fail the exam'\nEvidence for: 'I haven't studied much'\nEvidence against: 'I passed last time, I know some material'\nBalanced: 'I may not ace it, but I can prepare and do my best'\n\nPractice daily — this is how CBT rewires thinking patterns.",
  },
  {
    title: "DBT Distress Tolerance (Wysa-inspired)",
    description: "TIPP skills for overwhelming emotions",
    icon: Zap,
    category: "dbt",
    tags: ["dbt", "stress"],
    seniorNote: "Gentle body-based calming technique",
    content: "DBT TIPP Skills (Wysa-inspired):\n\nT — Temperature: Splash cold water on face (activates dive reflex)\nI — Intense Exercise: 10 jumping jacks or brisk walk\nP — Paced Breathing: Exhale longer than inhale (4-in, 6-out)\nP — Paired Muscle Relaxation: Tense muscles while breathing in, relax while breathing out\n\nUse when emotions hit 7+/10. These work in minutes by changing body chemistry.",
  },
  {
    title: "5-Minute Breathing Guide",
    description: "Calm your nervous system with the 4-7-8 technique",
    icon: Wind, category: "mindfulness", tags: ["breathing", "anxiety", "stress"],
    teenNote: "🎧 Try with your fave lo-fi playlist!",
    seniorNote: "Audio-guided version coming soon",
    content: "4-7-8 Breathing Technique:\n\n1. Breathe in through your nose for 4 seconds\n2. Hold your breath for 7 seconds\n3. Exhale slowly through your mouth for 8 seconds\n4. Repeat 3-4 times",
  },
  {
    title: "Pranayama for Calm",
    description: "Ancient Indian breathing practice for stress relief",
    icon: Sparkles, category: "cultural", tags: ["pranayama", "breathing", "stress"],
    seniorNote: "A gentle practice — sit comfortably",
    content: "Nadi Shodhana (Alternate Nostril Breathing):\n\n1. Sit comfortably. Close right nostril with thumb.\n2. Inhale through left nostril for 4 seconds.\n3. Close left nostril, release right. Exhale 4 seconds.\n4. Inhale through right nostril.\n5. Close right, release left. Exhale.\n6. Repeat 5-10 rounds.",
  },
  {
    title: "Yoga Nidra Guide",
    description: "Deep relaxation through yogic sleep meditation",
    icon: Sparkles, category: "cultural", tags: ["yoga", "yoga-nidra", "sleep"],
    content: "Yoga Nidra (20 min):\n\n1. Lie down in Savasana.\n2. Set a Sankalpa (positive intention).\n3. Body scan: Rotate awareness through each body part.\n4. Observe your breath naturally.\n5. Visualize a peaceful place.\n6. Reaffirm your Sankalpa.",
  },
  {
    title: "Box Breathing Exercise",
    description: "Used by Navy SEALs to stay calm under pressure",
    icon: Wind, category: "mindfulness", tags: ["breathing", "stress"],
    teenNote: "💪 Level up your calm skills!",
    content: "Box Breathing:\n\n1. Inhale for 4 seconds\n2. Hold for 4 seconds\n3. Exhale for 4 seconds\n4. Hold for 4 seconds\n5. Repeat for 4 rounds",
  },
  {
    title: "Gratitude Journal Prompt",
    description: "What made you smile today?",
    icon: PenLine, category: "journaling", tags: ["journaling"],
    content: "Gratitude Check-In:\n\nWrite down 3 things you're grateful for today.\n\nReflect:\n- Why do these things matter?\n- How do they make you feel?",
  },
  {
    title: "Thought Record (CBT)",
    description: "Challenge unhelpful thinking patterns",
    icon: Brain, category: "cbt", tags: ["cbt"],
    content: "CBT Thought Record:\n\n1. Describe the triggering situation\n2. What automatic thought came to mind?\n3. What emotion? (rate 0-100)\n4. Evidence supporting this thought?\n5. Evidence against it?\n6. More balanced perspective?\n7. Re-rate emotion (0-100)",
  },
  {
    title: "Cognitive Distortions",
    description: "Identify common thinking traps",
    icon: Brain, category: "cbt", tags: ["cbt"],
    content: "Common Distortions:\n\n• All-or-nothing thinking – Black & white\n• Catastrophizing – Assuming the worst\n• Mind reading – Guessing others' thoughts\n• Emotional reasoning – Feelings = facts\n• \"Should\" statements – Rigid expectations",
  },
  {
    title: "NIMHANS Anxiety Guide",
    description: "India's premier mental health institute resources",
    icon: ExternalLink, category: "external", tags: ["anxiety", "stress"],
    link: "https://nimhans.ac.in",
  },
  {
    title: "WHO Mental Health Guide",
    description: "Evidence-based global mental health resources",
    icon: ExternalLink, category: "external", tags: ["stress", "anxiety"],
    link: "https://www.who.int/health-topics/mental-health",
  },
  {
    title: "Lancet India Mental Health",
    description: "Research on India's 230M+ mental health burden",
    icon: ExternalLink, category: "external", tags: ["stress"],
    link: "https://www.thelancet.com/series/mental-health-in-india",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "cbt", label: "🧠 CBT" },
  { id: "dbt", label: "⚡ DBT" },
  { id: "mindfulness", label: "🧘 Mindfulness" },
  { id: "cultural", label: "🕉️ Cultural" },
  { id: "journaling", label: "📝 Journaling" },
  { id: "external", label: "🔗 Articles" },
];

export default function ResourcesPage() {
  const [filter, setFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { prefs } = useOnboarding();
  const { mode, modeConfig } = useViewMode();
  const { speak } = useVoice();
  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";

  const filtered = (() => {
    let cards = filter === "all" ? resourceCards : resourceCards.filter(r => r.category === filter);
    if (prefs && filter === "all") {
      const prefTags = [...(prefs.exercises || []), ...(prefs.culturalPrefs || [])];
      cards = [...cards].sort((a, b) => {
        const aScore = a.tags?.filter(t => prefTags.includes(t)).length || 0;
        const bScore = b.tags?.filter(t => prefTags.includes(t)).length || 0;
        return bScore - aScore;
      });
    }
    return cards;
  })();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div>
          <h1 className={`${modeConfig.headingSize} font-semibold text-foreground`}>Resources Hub {isTeens && "📚🌈"}</h1>
          <p className={`${modeConfig.textSize} text-muted-foreground mt-1`}>
            {prefs ? "Personalized CBT/DBT tools based on your preferences" : "Evidence-based self-help tools (Woebot & Wysa-inspired)"}
          </p>
        </div>

        <BreathingWidget />

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              className={`${isSeniors ? "px-5 py-3 text-base" : "px-4 py-2 text-sm"} rounded-xl font-medium transition-colors ${filter === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((resource, i) => (
            <motion.div key={resource.title} initial={modeConfig.reduceAnimations ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full hover:shadow-soft transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`${isSeniors ? "w-14 h-14" : "w-10 h-10"} rounded-xl bg-primary/10 flex items-center justify-center shrink-0`}>
                      <resource.icon className={`${isSeniors ? "w-7 h-7" : "w-5 h-5"} text-primary`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className={isSeniors ? "text-xl" : "text-base"}>{resource.title}</CardTitle>
                      <CardDescription className={`${isSeniors ? "text-base" : "text-xs"} mt-1`}>{resource.description}</CardDescription>
                      {isTeens && resource.teenNote && <p className="text-xs text-primary mt-1">{resource.teenNote}</p>}
                      {isSeniors && resource.seniorNote && <p className="text-sm text-muted-foreground mt-1 italic">{resource.seniorNote}</p>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {resource.link ? (
                    <a href={resource.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size={isSeniors ? "lg" : "sm"} className="w-full">
                        <ExternalLink className={`${modeConfig.iconSize} mr-2`} /> Visit Resource
                      </Button>
                    </a>
                  ) : (
                    <>
                      <Button variant="outline" size={isSeniors ? "lg" : "sm"} className="w-full"
                        onClick={() => {
                          const isOpen = expandedCard === resource.title;
                          setExpandedCard(isOpen ? null : resource.title);
                          if (!isOpen && resource.content) speak(resource.content.slice(0, 300));
                        }}>
                        <BookOpen className={`${modeConfig.iconSize} mr-2`} />
                        {expandedCard === resource.title ? "Close" : isTeens ? "Try Now 🚀" : "Try Now"}
                      </Button>
                      <AnimatePresence>
                        {expandedCard === resource.title && resource.content && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className={`mt-3 p-3 rounded-lg bg-secondary/50 ${isSeniors ? "text-lg leading-loose" : "text-sm leading-relaxed"} text-foreground whitespace-pre-line`}>
                              {resource.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function BreathingWidget() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [seconds, setSeconds] = useState(0);
  const { mode, modeConfig } = useViewMode();
  const isSeniors = mode === "seniors";

  const startBreathing = () => {
    setActive(true); setPhase("in"); setSeconds(4);
    let currentPhase: "in" | "hold" | "out" = "in"; let count = 4;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        if (currentPhase === "in") { currentPhase = "hold"; count = 7; }
        else if (currentPhase === "hold") { currentPhase = "out"; count = 8; }
        else { currentPhase = "in"; count = 4; }
        setPhase(currentPhase);
      }
      setSeconds(count);
    }, 1000);
    setTimeout(() => { clearInterval(interval); setActive(false); }, 60000);
  };

  return (
    <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} flex flex-col items-center gap-4`}>
      <div className={`flex items-center gap-2 ${isSeniors ? "text-base" : "text-sm"} font-semibold text-foreground`}>
        <Timer className={modeConfig.iconSize} /> Quick Breathing Exercise
      </div>
      {active ? (
        <div className="flex flex-col items-center gap-3">
          <div className={`${isSeniors ? "w-28 h-28" : "w-20 h-20"} rounded-full bg-primary/20 flex items-center justify-center ${!modeConfig.reduceAnimations && phase === "in" ? "animate-breathe" : ""}`}>
            <span className={`${isSeniors ? "text-4xl" : "text-2xl"} font-semibold text-primary`}>{seconds}</span>
          </div>
          <p className={`${modeConfig.textSize} text-muted-foreground capitalize`}>{phase === "in" ? "Breathe in..." : phase === "hold" ? "Hold..." : "Breathe out..."}</p>
          <button onClick={() => setActive(false)} className={`${modeConfig.textSize} text-muted-foreground hover:text-foreground`}>Stop</button>
        </div>
      ) : (
        <button onClick={startBreathing} className={`${isSeniors ? "px-8 py-4 text-lg" : "px-6 py-2 text-sm"} rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors`}>
          Start 4-7-8 breathing
        </button>
      )}
    </div>
  );
}
