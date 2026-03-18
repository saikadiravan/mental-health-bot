from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Define the request and response schemas directly here for simplicity
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

KEYWORD_RESPONSES = {
    "stressed": "I hear you—stress can feel overwhelming. Would you like to try a **quick breathing exercise**? Breathe in for 4 seconds, hold for 7, and exhale for 8. Let's do it together. 🌿",
    "anxious": "Anxiety can be really tough. Let's ground you: Name **5 things you can see**, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This can help bring you back to the present moment. 💙",
    "sad": "I'm sorry you're feeling sad. It's okay to feel this way. Would you like to talk about what's making you feel down, or would a **journaling prompt** help you process your thoughts? 💛",
    "angry": "Anger is a valid emotion. Try this: take a **slow, deep breath** and count to 10. Sometimes acknowledging anger without acting on it can help. Want to explore what's behind the anger? 🔥",
    "lonely": "Feeling lonely is more common than you might think. You're not alone right now—I'm here with you. Would you like to talk about it, or try a **mindfulness exercise** to feel more connected? 🤝",
    "tired": "Being tired—mentally or physically—is exhausting. Make sure you're being kind to yourself. Would you like some tips for **better rest**, or just want to vent? I'm here either way. 😴",
    "happy": "That's wonderful to hear! 🎉 What's been bringing you joy? Celebrating the good moments helps build resilience for harder days.",
    "depressed": "Thank you for sharing something so personal. Depression can make everything feel heavy. Remember: **you don't have to face this alone**. Would you like me to suggest some coping strategies, or would talking help more? 💜",
}

FALLBACK_RESPONSES = [
    "Thank you for sharing that with me. It takes courage to express how you feel. Can you tell me more about what's been on your mind?",
    "I hear you, and your feelings are completely valid. What do you think has been contributing to how you're feeling lately?",
    "That sounds like it's been weighing on you. Remember, it's okay to not be okay. Would you like to explore some **coping strategies** together?",
    "I appreciate you opening up. Sometimes just putting our thoughts into words can help. What would feel most supportive for you right now?",
    "It sounds like you're going through a lot. Let's take this one step at a time. What feels most pressing to you?",
    "Your feelings matter, and I'm glad you're here. Would you like to try a quick **grounding exercise**, or would you prefer to keep talking?",
]

CRISIS_KEYWORDS = ["suicide", "kill myself", "want to die", "end my life"]

@router.post("/", response_model=ChatResponse)
def get_ai_response(request: ChatRequest):
    lower_message = request.message.lower()

    # 🚨 Crisis detection (VERY IMPORTANT)
    for word in CRISIS_KEYWORDS:
        if word in lower_message:
            return ChatResponse(
                response="I'm really sorry you're feeling this way. You're not alone. Please reach out to someone you trust or a professional. 💙"
            )

    # Feature triggers
    if "track" in lower_message and "mood" in lower_message:
        return ChatResponse(response="Go to Mood Tracker 📊")

    if any(word in lower_message for word in ["resource", "help", "exercise"]):
        return ChatResponse(response="Check Resources section 📚")

    # Keyword match
    for keyword, response in KEYWORD_RESPONSES.items():
        if keyword in lower_message:
            return ChatResponse(response=response)

    return ChatResponse(response=random.choice(FALLBACK_RESPONSES))