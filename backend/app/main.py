import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.routers import auth, patents, departments, users, analytics
from app.ai.ai_engine import categorizer_engine
from app.seed import seed_database
from app import models

app = FastAPI(
    title="PatentPulse API",
    description="Backend API for AI-Powered Institutional Patent Monitoring, Analytics, and Decision Support System",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite development port or any source locally
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory to serve files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(patents.router)
app.include_router(departments.router)
app.include_router(users.router)
app.include_router(analytics.router)

@app.on_event("startup")
def startup_event():
    # 1. Initialize Database
    Base.metadata.create_all(bind=engine)
    
    # 2. Check if database is empty and auto-seed it if no users exist
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            print("No users found. Seeding database automatically...")
            seed_database()
    except Exception as e:
        print(f"Error checking/seeding database: {e}")
    finally:
        db.close()
        
    # 3. Train the AI classifier on seed data
    print("Training AI Categorizer...")
    try:
        categorizer_engine.train()
    except Exception as e:
        print(f"Error training AI Categorizer: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "PatentPulse Institutional Patent Monitoring and Analytics System API",
        "version": "1.0.0"
    }
