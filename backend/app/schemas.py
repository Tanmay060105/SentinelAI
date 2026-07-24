from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .models import RoleEnum, IncidentStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    created_at: datetime
    
    class Config:
        from_attributes = True

# Incident Schemas
class IncidentBase(BaseModel):
    title: str
    category: str
    description: str
    latitude: float
    longitude: float
    severity: float = 1.0
    confidence: float = 0.0
    
    # New AI Fields
    news_headline: Optional[str] = None
    image_keywords: Optional[str] = None
    source_link: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentResponse(IncidentBase):
    id: int
    ai_summary: Optional[str] = None
    status: IncidentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
