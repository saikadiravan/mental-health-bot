from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import uuid
import hashlib

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Setup for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#  FIX: Pre-hash password to avoid 72-byte bcrypt limit
def get_password_hash(password: str) -> str:
    sha_password = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(sha_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    sha_password = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(sha_password, hashed_password)


@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if the email is already in the database
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Generate unique user ID
    user_id = str(uuid.uuid4())

    # Hash password safely
    hashed_pw = get_password_hash(user.password)

    new_user = models.User(
        id=user_id,
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=schemas.UserResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    # Validate password
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return db_user