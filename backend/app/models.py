from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    guest = "guest"
    user = "user"
    moderator = "moderator"
    admin = "admin"

class IncidentStatus(str, enum.Enum):
    active = "active"
    investigating = "investigating"
    contained = "contained"
    resolved = "resolved"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String) # e.g., 'government', 'weather', 'news'
    reliability_score = Column(Float, default=1.0)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(String)
    ai_summary = Column(String, nullable=True)
    severity = Column(Float, default=1.0)
    confidence = Column(Float, default=0.0)
    
    # New AI fields
    news_headline = Column(String, nullable=True)
    image_keywords = Column(String, nullable=True)
    source_link = Column(String, nullable=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Many-to-many or one-to-many with sources can be added later
