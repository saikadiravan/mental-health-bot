from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import uuid

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/moods", tags=["Moods"])


@router.post("/", response_model=schemas.MoodResponse)
def create_mood(mood: schemas.MoodCreate, user_id: str, db: Session = Depends(get_db)):
    
    mood_id = str(uuid.uuid4())

    new_mood = models.Mood(
        id=mood_id,
        mood=mood.mood,
        note=mood.note,
        date=mood.date,
        user_id=user_id
    )

    try:
        db.add(new_mood)
        db.commit()
        db.refresh(new_mood)
        return new_mood

    except IntegrityError:
        db.rollback()

        existing = db.query(models.Mood).filter(
            models.Mood.user_id == user_id,
            models.Mood.mood == mood.mood,
            models.Mood.note == mood.note,
            models.Mood.date == mood.date
        ).first()

        return existing


@router.get("/", response_model=list[schemas.MoodResponse])
def get_moods(user_id: str, page: int = 1, limit: int = 5, db: Session = Depends(get_db)):
    
    skip = (page - 1) * limit

    moods = db.query(models.Mood)\
        .filter(models.Mood.user_id == user_id)\
        .order_by(models.Mood.date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    return moods