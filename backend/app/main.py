from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from . import models, schemas, database, auth
from .database import engine
from .live_news import sync_live_news

models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SentinelAI Core API",
    description="API for crisis intelligence platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Background Scheduler
scheduler = BackgroundScheduler()

def scheduled_sync_job():
    print("Running scheduled live news sync...")
    # Create a fresh database session for the background job
    db = database.SessionLocal()
    try:
        count = sync_live_news(db)
        print(f"Scheduled sync complete. Synced {count} records.")
    except Exception as e:
        print(f"Error in scheduled sync: {e}")
    finally:
        db.close()

@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(
        scheduled_sync_job,
        trigger=IntervalTrigger(hours=6),
        id="live_news_sync",
        name="Sync Live News from RSS every 6 hours",
        replace_existing=True,
    )
    scheduler.start()
    print("Background scheduler started. Next sync scheduled.")

@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"status": "ok", "message": "SentinelAI Backend running"}

@app.get("/incidents", response_model=List[schemas.IncidentResponse])
def get_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    incidents = db.query(models.Incident).offset(skip).limit(limit).all()
    return incidents

from fastapi import HTTPException
from .ai import augment_incident_with_ai, generate_playbook

@app.get("/incidents/{incident_id}/playbook", response_model=schemas.PlaybookResponse)
def get_incident_playbook(incident_id: int, db: Session = Depends(database.get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    playbook_md = generate_playbook(
        title=incident.title, 
        description=incident.description, 
        category=incident.category, 
        severity=incident.severity
    )
    
    return {"markdown_content": playbook_md}

@app.post("/incidents", response_model=schemas.IncidentResponse)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(database.get_db)):
    # 1. Ask Gemini to augment the incident
    ai_data = augment_incident_with_ai(incident.title, incident.description)
    
    # 2. Merge AI data into the incident creation
    incident_dict = incident.model_dump()
    incident_dict["ai_summary"] = ai_data["ai_summary"]
    incident_dict["severity"] = ai_data["severity"]
    incident_dict["confidence"] = ai_data["confidence"]
    incident_dict["news_headline"] = ai_data["news_headline"]
    incident_dict["image_keywords"] = ai_data["image_keywords"]
    
    # Optional field that may not come from client directly but could be present
    if "source_link" not in incident_dict:
        incident_dict["source_link"] = None
    
    db_incident = models.Incident(**incident_dict)
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

is_sync_running = False

def background_sync_task():
    global is_sync_running
    db = database.SessionLocal()
    try:
        from .live_news import sync_live_news
        count = sync_live_news(db)
        print(f"Background sync complete. Added {count} new incidents.")
    finally:
        is_sync_running = False
        db.close()

@app.post("/sync-news")
def trigger_news_sync(background_tasks: BackgroundTasks):
    global is_sync_running
    if is_sync_running:
        return {"message": "A sync is already in progress. Please wait."}
        
    is_sync_running = True
    background_tasks.add_task(background_sync_task)
    return {"message": "News sync started in the background. It may take up to 2-3 minutes due to AI processing."}
