from pydantic import BaseModel
from typing import Optional

# --- User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

    # This tells Pydantic to read data directly from the SQLAlchemy database models
    model_config = {"from_attributes": True}

# --- Mood Schemas ---
class MoodCreate(BaseModel):
    mood: str
    note: Optional[str] = None
    date: str

class MoodResponse(MoodCreate):
    id: str
    user_id: str

    model_config = {"from_attributes": True}

# --- Journal Schemas ---
class JournalCreate(BaseModel):
    prompt: str
    content: str
    date: str

class JournalResponse(JournalCreate):
    id: str
    user_id: str

    model_config = {"from_attributes": True}