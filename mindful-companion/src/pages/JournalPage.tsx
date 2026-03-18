import { useState, useMemo, useCallback } from "react";
import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useJournal } from "@/lib/journal-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useVoice } from "@/lib/voice-context";
import { useLanguage } from "@/lib/language-context"; 
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  Shuffle,
  Download,
  Bold,
  Italic,
  List,
  ListOrdered,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { exportJournalPDF } from "@/lib/pdf-export";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const PROMPTS_BY_LANG = {
  en: [
    "What challenged you today, and how did you handle it?",
    "What made you smile today?",
    "What are 3 things you're grateful for right now?",
    "Describe your current emotional state in one paragraph.",
    "What's one thing you'd like to improve about tomorrow?",
  ],
  hi: [
    "आज आपके सामने क्या चुनौती आई, और आपने उसका सामना कैसे किया?",
    "आज किस बात ने आपको मुस्कुराने पर मजबूर किया?",
    "अभी आप किन 3 चीजों के लिए आभारी हैं?",
    "अपनी वर्तमान भावनात्मक स्थिति का एक पैराग्राफ में वर्णन करें।",
    "कल के बारे में आप कौन सी एक चीज़ सुधारना चाहेंगे?",
  ],
  ta: [
    "இன்று உங்களுக்கு என்ன சவால் ஏற்பட்டது, அதை எப்படி கையாண்டீர்கள்?",
    "இன்று உங்களை சிரிக்க வைத்தது எது?",
    "தற்போது நீங்கள் நன்றி சொல்ல விரும்பும் 3 விஷயங்கள் என்ன?",
    "உங்கள் தற்போதைய மனநிலையை ஒரு பத்தியில் விவரிக்கவும்.",
    "நாளைய தினத்தில் நீங்கள் மேம்படுத்த விரும்பும் ஒரு விஷயம் என்ன?",
  ],
  kn: [
    "ಇಂದು ನಿಮಗೆ ಎದುರಾದ ಸವಾಲು ಏನು, ಮತ್ತು ನೀವು ಅದನ್ನು ಹೇಗೆ ನಿಭಾಯಿಸಿದಿರಿ?",
    "ಇಂದು ನಿಮ್ಮ ಮುಖದಲ್ಲಿ ನಗು ತರಿಸಿದ ವಿಷಯ ಯಾವುದು?",
    "ಈ ಕ್ಷಣದಲ್ಲಿ ನೀವು ಕೃತಜ್ಞರಾಗಿರುವ 3 ವಿಷಯಗಳು ಯಾವುವು?",
    "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಭಾವನಾತ್ಮಕ ಸ್ಥಿತಿಯನ್ನು ಒಂದು ಪ್ಯಾರಾಗ್ರಾಫ್‌ನಲ್ಲಿ ವಿವರಿಸಿ.",
    "ನಾಳೆಯ ಬಗ್ಗೆ ನೀವು ಸುಧಾರಿಸಲು ಬಯಸುವ ಒಂದು ವಿಷಯ ಯಾವುದು?",
  ]
};


export default function JournalPage() {
  const { entries, addEntry } = useJournal();
  const { mode, modeConfig } = useViewMode();
  const { speak } = useVoice();
  const { language, setLanguage, speechLangCode } = useLanguage();// <-- Hook into language
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";

  // When language changes, update the prompt to the new language instantly
  useEffect(() => {
  const prompts = PROMPTS_BY_LANG[language] || PROMPTS_BY_LANG["en"];
  const randomPrompt =
    prompts[Math.floor(Math.random() * prompts.length)];
  setPrompt(randomPrompt);
}, [language]);


  // ✅ SAFE DATE FORMATTER (FIXES CRASH)
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return format(date, "MMM d, yyyy");
  };

  // ✅ EDITOR
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-ul:list-disc prose-ol:list-decimal dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3 text-sm bg-background",
      },
    },
  });

  // 🔀 Prompt
  const shufflePrompt = () => {
    const prompts = PROMPTS_BY_LANG[language];
    const next = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(next);
    speak(next, speechLangCode); // <-- Speaks in correct regional accent!
  };

  // 💾 Save
  const handleSave = () => {
    if (!editor || editor.getText().trim().length === 0) return;

    addEntry(prompt, content);

    editor.commands.clearContent();
    setContent("");

    shufflePrompt();

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 🔍 Filter
  const filteredEntries = useMemo(() => {
    let data = Array.isArray(entries) ? [...entries] : [];

    if (search) {
      data = data.filter(
        (e) =>
          e.prompt?.toLowerCase().includes(search.toLowerCase()) ||
          e.content?.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return sort === "latest" ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [entries, search, sort]);

  const isDisabled =
    !editor || editor.getText().trim().length === 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h1 className={`${modeConfig.headingSize} font-semibold`}>
              Journal
            </h1>
            <p className="text-muted-foreground">
              Reflect and grow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "ta" | "kn")}
              className="
              bg-card text-foreground 
              border border-border 
              rounded-md px-3 py-1.5 
              text-sm 
              focus:outline-none focus:ring-2 focus:ring-primary
              " >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
            
          </div>

          {entries?.length > 0 && (
            <button onClick={() => exportJournalPDF(entries)}>
              <Download />
            </button>
          )}
        </div>

        {/* PROMPT */}
        <div className="bg-card border rounded-xl p-5">
          <p className="font-medium mb-2">{prompt}</p>
          <button
            onClick={shufflePrompt}
            className="text-primary text-sm flex items-center gap-1"
          >
            <Shuffle className="w-4 h-4" /> New prompt
          </button>
        </div>

        {/* EDITOR */}
        <div className="border rounded-xl overflow-hidden">

          {/* Toolbar */}
          <div className="flex gap-2 p-2 border-b">
            <Button
              onClick={() =>
                editor?.chain().focus().toggleBold().run()
              }
            >
              <Bold />
            </Button>

            <Button
              onClick={() =>
                editor?.chain().focus().toggleItalic().run()
              }
            >
              <Italic />
            </Button>

            <Button
              onClick={() =>
                editor?.chain().focus().toggleBulletList().run()
              }
            >
              <List />
            </Button>

            <Button
              onClick={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered />
            </Button>
          </div>

          <EditorContent editor={editor} />
        </div>

        <Button onClick={handleSave} disabled={isDisabled}>
          {saved ? "Saved ✅" : "Save Entry"}
        </Button>

        {/* SEARCH */}
        <div className="flex gap-2 items-center">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search journal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* HISTORY */}
        <div className="space-y-4">
          <h2 className="font-semibold">Journal History</h2>

          {filteredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No entries found
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-4"
              >
                <div className="text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </div>

                <p className="font-medium mt-1">
                  {entry.prompt}
                </p>

                <div
                  className="prose dark:prose-invert mt-2"
                  dangerouslySetInnerHTML={{
                    __html: entry.content,
                  }}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}