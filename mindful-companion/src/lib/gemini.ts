export async function analyzeWorkLife(work: string, life: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Add it to .env and restart dev server.");
  }

  const prompt = `Analyze work-life balance based on this input.

Work: ${work || "No details provided"}
Personal Life: ${life || "No details provided"}

Return **ONLY** this exact JSON structure (no extra text):

{
  "score": 68,
  "summary": "One clear sentence about the current balance.",
  "tips": [
    "First practical tip.",
    "Second practical tip.",
    "Third practical tip."
  ]
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
            responseMimeType: "application/json"
          },
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) throw new Error("Empty response from Gemini");

    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed || typeof parsed.score !== "number") {
      throw new Error("Invalid JSON structure");
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      summary: parsed.summary || "Your work-life balance has been analyzed.",
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 5) : []
    };

  } catch (err: any) {
    console.error("analyzeWorkLife Error:", err.message);
    return {
      score: 50,
      summary: "Analysis temporarily unavailable due to high demand. Please try again in a minute.",
      tips: [
        "Try with more detailed descriptions",
        "Wait 30-60 seconds before retrying",
        "Check your Gemini API quota in Google AI Studio"
      ]
    };
  }
}