from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint
from .. import models, schemas
from ..database import get_db
from sqlalchemy.exc import IntegrityError


router = APIRouter(prefix="/api/journals", tags=["Journals"])



@router.post("/", response_model=schemas.JournalResponse)
def create_journal(journal: schemas.JournalCreate, user_id: str, db: Session = Depends(get_db)):
    journal_id = str(uuid.uuid4())

    new_journal = models.Journal(
        id=journal_id,
        prompt=journal.prompt,
        content=journal.content,
        date=journal.date,
        user_id=user_id
    )

    try:
        db.add(new_journal)
        db.commit()
        db.refresh(new_journal)
        return new_journal

    except IntegrityError:
        db.rollback()

        existing = db.query(models.Journal).filter(
            models.Journal.user_id == user_id,
            models.Journal.prompt == journal.prompt,
            models.Journal.content == journal.content,
            models.Journal.date == journal.date
        ).first()

        return existing


@router.get("/", response_model=list[schemas.JournalResponse])
def get_journals(user_id: str, page: int = 1, limit: int = 5, db: Session = Depends(get_db)):
    skip = (page - 1) * limit

    journals = db.query(models.Journal)\
        .filter(models.Journal.user_id == user_id)\
        .order_by(models.Journal.date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    return journals


@router.delete("/{journal_id}")
def delete_journal(journal_id: str, user_id: str, db: Session = Depends(get_db)):
    journal = db.query(models.Journal).filter(
        models.Journal.id == journal_id,
        models.Journal.user_id == user_id
    ).first()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    db.delete(journal)
    db.commit()

    return {"detail": "Journal entry successfully deleted"}

