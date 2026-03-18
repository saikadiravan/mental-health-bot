from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import auth, mood, journal, chat
# Initialize the FastAPI app
app = FastAPI(
    title="MindCompanion API",
    description="Backend API for the MindCompanion AI frontend",
    version="1.0.0"
)



models.Base.metadata.create_all(bind=engine)

# Set up CORS so the React frontend can communicate with this backend
# The Vite frontend runs on port 8080 by default
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",  # Adding standard Vite port just in case
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers
)

# Root health-check endpoint
@app.get("/")
def read_root():
    return {"message": "MindCompanion API is running successfully!"}

# We will include our routers (auth, mood, journal, chat) here later
app.include_router(auth.router)
app.include_router(mood.router)
app.include_router(journal.router)
app.include_router(chat.router)
# Create all tables in the database
