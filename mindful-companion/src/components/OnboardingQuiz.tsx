import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding, type OnboardingPrefs } from "@/lib/onboarding-context";
import { useViewMode } from "@/lib/viewmode-context";
import { Heart, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: { label: string; value: string }[];
  multi: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: "ageGroup",
    question: "What's your age range? This helps set defaults.",
    options: [
      { label: "🧑‍🎓 13-19 (Teen)", value: "teen" },
      { label: "👩‍💼 20-55 (Adult)", value: "adult" },
      { label: "👴 55+ (Senior)", value: "senior" },
    ],
    multi: false,
  },
  {
    id: "exercises",
    question: "Which approaches interest you most?",
    options: [
      { label: "🧘 Breathing / Pranayama", value: "breathing" },
      { label: "📝 Journaling", value: "journaling" },
      { label: "🧠 CBT Thought Challenges (Woebot-style)", value: "cbt" },
      { label: "⚡ DBT Skills (Wysa-style)", value: "dbt" },
    ],
    multi: true,
  },
  {
    id: "stressLevel",
    question: "How would you rate your current stress level?",
    options: [
      { label: "😌 Low – I'm doing well", value: "low" },
      { label: "😐 Moderate – Some pressure", value: "moderate" },
      { label: "😰 High – Feeling overwhelmed", value: "high" },
      { label: "🆘 Very High – Need support", value: "very-high" },
    ],
    multi: false,
  },
  {
    id: "stressSource",
    question: "What's your primary source of stress?",
    options: [
      { label: "📚 Studies / Exams", value: "studies" },
      { label: "💼 Work / Career", value: "work" },
      { label: "👨‍👩‍👧 Family / Relationships", value: "family" },
      { label: "💰 Financial pressure", value: "financial" },
    ],
    multi: false,
  },
  {
    id: "goals",
    question: "What are your wellbeing goals?",
    options: [
      { label: "💆 Manage anxiety", value: "anxiety" },
      { label: "😴 Better sleep", value: "sleep" },
      { label: "🌟 Build resilience", value: "resilience" },
      { label: "📊 Track my mood", value: "tracking" },
    ],
    multi: true,
  },
  {
    id: "culturalPrefs",
    question: "Any cultural wellness practices you'd like?",
    options: [
      { label: "🕉️ Pranayama & Meditation", value: "pranayama" },
      { label: "🧘 Yoga Nidra", value: "yoga-nidra" },
      { label: "📿 Mindfulness / Vipassana", value: "vipassana" },
      { label: "🌿 No preference", value: "none" },
    ],
    multi: true,
  },
  {
    id: "frequency",
    question: "How often would you like check-in reminders?",
    options: [
      { label: "📅 Daily", value: "daily" },
      { label: "📆 A few times a week", value: "few-times" },
      { label: "🗓️ Weekly", value: "weekly" },
      { label: "🚫 No reminders", value: "none" },
    ],
    multi: false,
  },
];

export default function OnboardingQuiz({ onComplete }: { onComplete: () => void }) {
  const { setPrefs } = useOnboarding();
  const { setMode } = useViewMode();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const current = QUESTIONS[step];
  const selectedValues = answers[current.id] || (current.multi ? [] : "");

  const toggleOption = (value: string) => {
    if (current.multi) {
      const arr = selectedValues as string[];
      setAnswers(prev => ({ ...prev, [current.id]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }));
    } else {
      setAnswers(prev => ({ ...prev, [current.id]: value }));
    }
  };

  const isSelected = (value: string) => current.multi ? (selectedValues as string[]).includes(value) : selectedValues === value;
  const canContinue = current.multi ? (selectedValues as string[]).length > 0 : !!selectedValues;

  const handleFinish = () => {
    const ageGroup = answers.ageGroup as string || "adult";
    // Auto-set view mode based on age
    if (ageGroup === "teen") setMode("teens");
    else if (ageGroup === "senior") setMode("seniors");
    else setMode("adults");

    const prefs: OnboardingPrefs = {
      ageGroup,
      exercises: (answers.exercises as string[]) || [],
      stressLevel: (answers.stressLevel as string) || "moderate",
      goals: (answers.goals as string[]) || [],
      culturalPrefs: (answers.culturalPrefs as string[]) || [],
      frequency: (answers.frequency as string) || "daily",
      stressSource: (answers.stressSource as string) || "work",
    };
    setPrefs(prefs);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Heart className="w-5 h-5" fill="currentColor" />
            <span className="text-sm font-semibold">Personalize Your Experience</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {QUESTIONS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Question {step + 1} of {QUESTIONS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{current.question}</h2>
            {current.multi && <p className="text-xs text-muted-foreground mb-3">Select all that apply</p>}
            <div className="grid grid-cols-1 gap-2">
              {current.options.map(opt => (
                <button key={opt.value} onClick={() => toggleOption(opt.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium text-left transition-all ${isSelected(opt.value) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected(opt.value) ? "border-primary bg-primary" : "border-border"}`}>
                    {isSelected(opt.value) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="px-6 pb-6 flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < QUESTIONS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canContinue}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button size="sm" onClick={handleFinish} disabled={!canContinue}><CheckCircle className="w-4 h-4 mr-1" /> Finish</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
