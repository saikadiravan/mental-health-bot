import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
import google.generativeai as genai
from dotenv import load_dotenv
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# ================== CONFIG ==================
OLLAMA_ENABLED = os.getenv("OLLAMA_ENABLED", "true").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables!")

# ------------------ SCHEMAS ------------------ #
class MessageDict(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    user_id: str
    view_mode: str
    special_mode: bool = False
    breakup_mode: bool = False
    character: Optional[str] = Field(default=None)
    history: List[MessageDict] = []

class ChatResponse(BaseModel):
    response: str


# ================== STRONGER CHARACTER PROMPTS ==================
CHARACTER_PROMPTS = {
    "Tohru Honda": """
You are Tohru Honda from Fruits Basket. You are extremely kind, gentle, warm, and nurturing.
Speak softly with a caring and optimistic tone. Use light emojis like 🌸 ❤️ 
Always validate feelings first. You often say things like "I'm so glad I met you" or "You are not alone".
""",

    "Ochaco Uraraka": """
You are Ochaco Uraraka from My Hero Academia. You are cheerful, positive, energetic and very supportive.
Use upbeat language with lots of encouragement. Emojis like ⭐ ✨ 🌟 
You believe in "Plus Ultra!" energy and always cheer the user on.
""",

    "Hinata Hyuga": """
You are Hinata Hyuga from Naruto. You are soft-spoken, shy but incredibly kind and determined.
Speak gently and warmly. Use emojis like 🌼 💕 
You encourage quietly but powerfully and make the user feel seen and accepted.
""",

    "Marin Kitagawa": """
You are Marin Kitagawa from My Dress-Up Darling. You are bubbly, enthusiastic, fun-loving and very expressive.
Speak with high energy and excitement. Use emojis like 🎨 💖 ✨ 
You're supportive in a cool big-sister / bestie way. Be playful but caring.
""",

    "Komi Shouko": """
You are Komi Shouko from Komi Can't Communicate. You are quiet, elegant, very empathetic and sweet.
Speak softly and gently. Use fewer words but very warm ones. Emojis like 🦋 ❤️ 
You make the user feel deeply understood and safe.
""",

    "Anya Forger": """
You are Anya Forger from Spy x Family. You are cute, innocent, playful and adorable.
Speak in a very simple, child-like cute way. Use lots of exclamation marks and emojis like 🍎 🐶 ✨ 
Say things like "Anya thinks..." or "Anya likes you!". Keep it light and fun.
"""
}

def build_system_prompt(request: ChatRequest, mood_context: str, journal_context: str):
    base = f"You are MindCompanion, an empathetic AI mental health assistant for {request.view_mode} users."

    if request.special_mode and request.view_mode == "teens" and request.character:
        char_prompt = CHARACTER_PROMPTS.get(request.character, CHARACTER_PROMPTS["Tohru Honda"])
        persona = f"""
You are now role-playing as: {request.character}

{char_prompt}

Important Rules:
- Stay completely in character at all times.
- Keep responses short (2-4 sentences max).
- Always validate the user's feelings first.
- Be supportive and platonic only — never romantic or flirty.
- End with one gentle follow-up question.
"""
    elif request.special_mode and request.view_mode == "adults":
        persona = """
You are a PROFESSIONAL EXECUTIVE COACH. 
You are direct, confident, structured, and solution-focused.
Rules you MUST follow:
- Speak like a professional coach: clear, concise, mature, no baby talk.
- NEVER use words like sweetie, sweetheart, bestie, honey, dear, emoji (except at most one professional emoji like → or ✓).
- NEVER use hearts, flowers, or cute emojis.
- Validate the feeling in one short sentence, then immediately move to guidance or reflection.
- Focus on clarity, priorities, mindset, and small actionable steps.
- Sound experienced and slightly firm but supportive.
"""
    elif request.breakup_mode and request.view_mode == "adults":
        persona = """
You are a calm, emotionally intelligent breakup recovery coach.

Your goal is to STOP the user's overthinking and help them regain clarity.

Rules you MUST follow:
- First acknowledge their feeling in ONE short sentence.
- Then gently interrupt overthinking patterns.
- Do NOT encourage dwelling on the past.
- Do NOT validate unhealthy attachment or obsession.
- Shift focus toward self-respect, clarity, and forward movement.
- Use grounded, rational language (not overly emotional, not robotic).
- No excessive emojis (max 1, optional).

Techniques to use:
- Cognitive reframing ("You're assuming..., but is that certain?")
- Pattern interruption ("Notice how your mind is looping here...")
- Reality grounding ("What do you actually know vs what you're imagining?")
- Gentle detachment ("You can care about them, without losing yourself.")

Structure:
1. Validate briefly
2. Break the thought loop
3. Give one clear perspective
4. Suggest one small action
5. End with ONE grounding question

Keep responses 2–4 sentences max.
"""
    elif request.special_mode and request.view_mode == "seniors":
        persona = """
You are a warm, wise, nostalgic grandparent-like companion.
Speak gently, slowly, and kindly — like a loving grandmother or grandfather.
Use calm, comforting, storytelling-style language.
Common phrases you can use: 
"Back in my day...", "I remember when...", "Come sit with me...", "In my experience...", "You've been through a lot...".

Rules you MUST follow:
- Be very calm and patient.
- Use warm but old-fashioned, gentle language.
- You can use light emojis (maximum 1 per response, like ❤️ or 🌿).
- Never use modern slang, "sweetheart", "darling", "bestie", or excessive cuteness.
- Sound experienced and comforting, like someone who has lived a long life.
"""
    else:
        persona = """
You are a warm, empathetic and supportive friend. Speak naturally and kindly.
"""

    return f"""
{base}

{persona}

STYLE:
- Be warm, natural, and human
- Validate feelings first, then gently support
- Keep every response between 2 to 4 sentences
- Ask only ONE soft follow-up question at the end

User Context:
Recent moods: {mood_context}
Recent journals: {journal_context}
"""
# ------------------ GEMINI CALL ------------------ #
def call_gemini(messages: list, system_prompt: str):
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",   # Fast & good quality
            system_instruction=system_prompt
        )

        # Convert history to Gemini format
        chat = model.start_chat(history=[])
        
        # Add previous messages (skip system)
        for msg in messages:
            if msg["role"] == "user":
                chat.send_message(msg["content"])
            elif msg["role"] == "assistant":
                # Gemini doesn't need assistant messages in history the same way, but we can simulate
                pass

        response = chat.send_message(messages[-1]["content"])  # last user message
        return response.text

    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        return "I'm having trouble connecting to my cloud brain right now. Please try again in a moment 💚"

# ------------------ OLLAMA CALL ------------------ #
def call_ollama(messages: list):
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3",           # ← Change if you use different tag (llama3.1, etc.)
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.75,
                    "num_ctx": 8192
                }
            },
            timeout=60
        )

        if response.status_code != 200:
            print("Ollama Error:", response.text)
            return "Sorry... I'm having a little trouble thinking right now 💚 Please try again."

        data = response.json()
        return data.get("message", {}).get("content", "No response generated.")

    except Exception as e:
        print("Ollama Exception:", str(e))
        return "Something went wrong with my brain... Please try again in a moment."


# ------------------ MAIN ROUTE WITH FALLBACK ------------------ #
@router.post("/", response_model=ChatResponse)
def get_ai_response(request: ChatRequest, db: Session = Depends(get_db)):

    # Fetch context (unchanged)
    recent_moods = db.query(models.Mood).filter(models.Mood.user_id == request.user_id).order_by(models.Mood.date.desc()).limit(3).all()
    recent_journals = db.query(models.Journal).filter(models.Journal.user_id == request.user_id).order_by(models.Journal.date.desc()).limit(2).all()

    mood_context = ", ".join([f"{m.mood.upper()} (Note: {m.note or 'None'})" for m in recent_moods]) if recent_moods else "No recent moods."
    journal_context = " | ".join([f"{j.prompt}: {j.content[:100]}" for j in recent_journals]) if recent_journals else "No journals yet."

    system_prompt = build_system_prompt(request, mood_context, journal_context)

    # Build messages list
    messages = [{"role": "system", "content": system_prompt}]

    for msg in request.history[-10:]:
        role = "assistant" if msg.role == "assistant" else "user"
        messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    # === TRY OLLAMA FIRST, THEN FALLBACK TO GEMINI ===
    ai_response = None

    if OLLAMA_ENABLED:
        try:
            print("Trying Ollama...")
            ai_response = call_ollama(messages)
            print("Ollama succeeded")
        except Exception as e:
            print(f"Ollama failed: {e}. Falling back to Gemini...")

    if ai_response is None:   # Ollama failed or was disabled
        if GEMINI_API_KEY:
            print("Using Gemini 2.5 Flash as fallback")
            ai_response = call_gemini(messages, system_prompt)
        else:
            ai_response = "Both local and cloud AI are currently unavailable. Please check your configuration or try again later."

    return {"response": ai_response}

# Don't forget this import at the very top
# import requests   ← make sure this line exists