const HIGH_RISK_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "self-harm", "self harm", "cutting myself", "hurt myself",
  "no reason to live", "better off dead", "can't go on",
  "overdose", "ending it all", "not worth living",
];

export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return HIGH_RISK_KEYWORDS.some(keyword => lower.includes(keyword));
}

export const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", region: "US" },
  { name: "Crisis Text Line", contact: "Text HOME to 741741", region: "US" },
  { name: "SAMHSA Helpline", contact: "1-800-662-4357", region: "US" },
  { name: "International Association for Suicide Prevention", contact: "https://www.iasp.info/resources/Crisis_Centres/", region: "International" },
];

export const CRISIS_DISCLAIMER = "I'm an AI companion and not a licensed mental health professional. If you're in crisis or experiencing thoughts of self-harm, please reach out to a trained professional immediately. You are not alone, and help is available 24/7.";
