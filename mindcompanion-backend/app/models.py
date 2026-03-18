from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
from sqlalchemy import Column, String, UniqueConstraint
from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint

class Journal(Base):
    __tablename__ = "journals"

    id = Column(String, primary_key=True, index=True)
    prompt = Column(String)
    content = Column(Text)
    date = Column(String)  # Stored as ISO string
    user_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="journals")

    # ADD THIS (VERY IMPORTANT)
    __table_args__ = (
        UniqueConstraint("user_id", "prompt", "content", "date", name="unique_journal"),
    )
class User(Base):
    __tablename__ = "users"

    # In auth-context.tsx, id is a crypto.randomUUID() string
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String) # Required for real authentication

    # Relationships to link a user to their data
    moods = relationship("Mood", back_populates="owner")
    journals = relationship("Journal", back_populates="owner")

from sqlalchemy import UniqueConstraint

class Mood(Base):
    __tablename__ = "moods"

    id = Column(String, primary_key=True, index=True)
    mood = Column(String, index=True)
    note = Column(Text, nullable=True)
    date = Column(String)
    user_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="moods")

    #  ADD THIS
    __table_args__ = (
        UniqueConstraint("user_id", "mood", "note", "date", name="unique_mood"),
    )

