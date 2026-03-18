import jsPDF from "jspdf";
import { format, isValid } from "date-fns";
import type { MoodEntry } from "@/lib/mood-context";
import type { JournalEntry } from "@/lib/journal-context";

const MOOD_VALUE: Record<string, number> = { happy: 10, good: 7, neutral: 5, sad: 3, anxious: 1 };

const THEME_KEYWORDS: Record<string, string[]> = {
  Gratitude: ["grateful", "thankful", "appreciate", "blessed", "thank"],
  Stress: ["stress", "overwhelm", "pressure", "tense", "burden", "anxious", "worry"],
  Growth: ["learn", "grow", "improve", "progress", "better"],
  Joy: ["happy", "joy", "smile", "laugh", "fun", "excited"],
  Relationships: ["friend", "family", "love", "partner", "colleague", "lonely"],
  Work: ["work", "job", "career", "project", "deadline", "boss"],
};

// Helper to safely parse dates so the app never crashes on old data
const safeDate = (dateStr?: string) => {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isValid(d) ? d : new Date();
};

export function exportMoodPDF(entries: MoodEntry[]) {
  if (!Array.isArray(entries)) return; // Prevent React MouseEvent crashes

  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("MindCompanion — Mood Report", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 20, 28);
  doc.setFontSize(8);
  doc.text("Confidential — Not a clinical document", 20, 34);

  let y = 45;
  doc.setFontSize(12);
  doc.text(`Total Entries: ${entries.length}`, 20, y);
  y += 8;

  if (entries.length > 0) {
    const avg = entries.reduce((s, e) => s + (MOOD_VALUE[e.mood] || 5), 0) / entries.length;
    doc.text(`Average Mood: ${avg.toFixed(1)} / 10`, 20, y);
    y += 12;
  }

  doc.setFontSize(10);
  entries.slice(0, 30).forEach((e) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const date = format(safeDate(e.date), "MMM d, h:mm a");
    const emoji = e.mood === "happy" ? "😄" : e.mood === "good" ? "😊" : e.mood === "neutral" ? "😐" : e.mood === "sad" ? "😔" : "😢";
    const safeNote = e.note ? ` — ${e.note.slice(0, 60)}` : "";
    doc.text(`${date} — ${emoji} ${e.mood} (${MOOD_VALUE[e.mood] || 5}/10)${safeNote}`, 20, y);
    y += 7;
  });

  doc.save("mindcompanion-mood-report.pdf");
}

export function exportJournalPDF(entries: JournalEntry[]) {
  if (!Array.isArray(entries)) return; // Prevent React MouseEvent crashes

  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("MindCompanion — Journal Entries", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 20, 28);
  doc.setFontSize(8);
  doc.text("Confidential — Not a clinical document", 20, 34);

  let y = 45;
  doc.setFontSize(12);
  doc.text(`Total Entries: ${entries.length}`, 20, y);
  y += 12;

  entries.slice(0, 50).forEach((e) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(format(safeDate(e.date), "MMM d, yyyy"), 20, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Prompt: "${e.prompt || "Journal Entry"}"`, 20, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
    
    // Safely strip HTML tags from Tiptap rich text
    const plainText = (e.content || "").replace(/<[^>]+>/g, '');
    const lines = doc.splitTextToSize(plainText, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 8;
  });

  doc.save("mindcompanion-journal.pdf");
}

export function exportTherapistSummary(moods: MoodEntry[], journals: JournalEntry[]) {
  if (!Array.isArray(moods) || !Array.isArray(journals)) return;

  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(34, 139, 34); 
  doc.text("MindCompanion — Clinical Summary", 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 20, 28);
  doc.setFontSize(8);
  doc.text("Notice: This is an auto-generated data summary to assist clinical professionals.", 20, 34);

  let y = 50;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("1. Overall Activity Overview", 20, y);
  
  y += 8;
  doc.setFontSize(11);
  const avgMood = moods.length > 0 ? (moods.reduce((s, e) => s + (MOOD_VALUE[e.mood] || 5), 0) / moods.length).toFixed(1) : "N/A";
  doc.text(`• Total Mood Logs: ${moods.length}`, 25, y);
  y += 6;
  doc.text(`• Total Journal Entries: ${journals.length}`, 25, y);
  y += 6;
  doc.text(`• Average Mood Score: ${avgMood} / 10`, 25, y);

  y += 15;
  doc.setFontSize(14);
  doc.text("2. Mood & Theme Correlation Analysis", 20, y);
  
  const lowMoodDates = moods
    .filter(m => (MOOD_VALUE[m.mood] || 5) <= 3)
    .map(m => format(safeDate(m.date), "yyyy-MM-dd"));
    
  const lowMoodJournals = journals.filter(j => lowMoodDates.includes(format(safeDate(j.date), "yyyy-MM-dd")));
  
  y += 8;
  doc.setFontSize(11);
  if (lowMoodJournals.length > 0) {
    const lowMoodText = lowMoodJournals.map(j => (j.content || "").toLowerCase()).join(" ");
    const triggers = Object.entries(THEME_KEYWORDS)
      .map(([theme, keywords]) => ({
        theme,
        count: keywords.reduce((sum, kw) => sum + (lowMoodText.split(kw).length - 1), 0)
      }))
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count);

    doc.text(`When the patient's mood drops to "Sad" or "Anxious", the most frequent topics discussed are:`, 20, y);
    y += 6;
    if (triggers.length > 0) {
      triggers.slice(0, 3).forEach(t => {
        doc.text(`• ${t.theme} (Mentioned ${t.count} times)`, 25, y);
        y += 6;
      });
    } else {
      doc.text(`• No distinct keyword themes detected on low mood days.`, 25, y);
      y += 6;
    }
  } else {
    doc.text("Not enough journal data on low mood days to calculate correlations.", 20, y);
    y += 6;
  }

  y += 10;
  doc.setFontSize(14);
  doc.text("3. Recent Low-Mood Context Notes", 20, y);
  y += 8;
  doc.setFontSize(10);
  
  const recentFlags = moods
    .filter(m => (MOOD_VALUE[m.mood] || 5) <= 3 && (m.note || "").trim() !== "")
    .slice(0, 5);

  if (recentFlags.length > 0) {
    recentFlags.forEach(flag => {
      const flagDate = format(safeDate(flag.date), "MMM d");
      doc.setTextColor(200, 0, 0); 
      doc.text(`[${flagDate} - ${flag.mood.toUpperCase()}]`, 20, y);
      doc.setTextColor(50, 50, 50);
      const wrappedNote = doc.splitTextToSize(`"${flag.note}"`, 160);
      doc.text(wrappedNote, 45, y);
      y += wrappedNote.length * 5 + 4;
    });
  } else {
    doc.setTextColor(50, 50, 50);
    doc.text("No specific notes left during recent low-mood logs.", 20, y);
  }

  doc.save("MindCompanion-Therapist-Report.pdf");
}