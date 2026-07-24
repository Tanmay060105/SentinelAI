import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from datetime import datetime, timezone

def seed_db():
    print("Creating tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(models.Incident).count() > 0:
        print("Database already seeded!")
        db.close()
        return

    print("Seeding diverse incidents...")
    
    incidents_data = [
        # 1. Protest in Delhi
        models.Incident(
            title="Massive Civil Unrest in New Delhi",
            description="Tens of thousands of protesters have gathered at India Gate. Reports of tear gas being deployed. Several major roads are blocked.",
            category="Civil Unrest",
            latitude=28.6129,
            longitude=77.2295,
            severity=4.5,
            confidence=95.0,
            ai_summary="Large-scale protests at India Gate have escalated, resulting in road closures and police deployment.",
            news_headline="BREAKING: Delhi Brought to a Standstill as Protesters Clash with Police",
            image_keywords="protest, crowd, riot, police",
            created_at=datetime.now(timezone.utc)
        ),
        # 2. Cyclone in Odisha
        models.Incident(
            title="Cyclone Warning for Odisha Coast",
            description="Severe cyclonic storm approaching the eastern coast. Evacuation of coastal villages has commenced. High winds and heavy rainfall expected within 12 hours.",
            category="Natural Disaster",
            latitude=19.8135,
            longitude=85.8312, # Puri/Bhubaneswar coast
            severity=5.0,
            confidence=98.5,
            ai_summary="A severe cyclonic storm threatens the Odisha coast, prompting immediate mass evacuations.",
            news_headline="Cyclone Alert: Millions Evacuated as Monster Storm Barrels Toward Odisha",
            image_keywords="cyclone, storm, hurricane, ocean",
            created_at=datetime.now(timezone.utc)
        ),
        # 3. Industrial Fire in Mumbai
        models.Incident(
            title="Chemical Factory Fire in Mumbai Industrial Area",
            description="A massive fire broke out in a chemical storage facility in Navi Mumbai. Toxic fumes are spreading to nearby residential areas.",
            category="Industrial Hazard",
            latitude=19.0330,
            longitude=73.0297,
            severity=4.0,
            confidence=92.0,
            ai_summary="A large chemical factory fire in Navi Mumbai is releasing potentially toxic fumes into residential zones.",
            news_headline="Chemical Inferno: Navi Mumbai Residents Advised to Stay Indoors",
            image_keywords="fire, factory, smoke, industrial",
            created_at=datetime.now(timezone.utc)
        ),
        # 4. Highway Pileup in Bangalore
        models.Incident(
            title="Major Pileup on Bangalore-Mysore Expressway",
            description="Over 20 vehicles involved in a massive collision due to dense morning fog. Traffic is at a complete standstill.",
            category="Traffic Accident",
            latitude=12.7209,
            longitude=77.2783,
            severity=3.5,
            confidence=99.0,
            ai_summary="A 20-vehicle pileup caused by heavy fog has completely blocked the Bangalore-Mysore expressway.",
            news_headline="Chaos on Expressway: Fog Causes Massive 20-Car Pileup",
            image_keywords="car crash, traffic, highway, accident",
            created_at=datetime.now(timezone.utc)
        ),
        # 5. Suspicious Package in Hyderabad
        models.Incident(
            title="Suspicious Package at Hyderabad Airport",
            description="Security forces have evacuated Terminal 1 after an unidentified bag was left unattended near the check-in counters.",
            category="Security Threat",
            latitude=17.2403,
            longitude=78.4294,
            severity=2.5,
            confidence=85.0,
            ai_summary="Terminal 1 of Hyderabad Airport has been evacuated following the discovery of a suspicious unattended package.",
            news_headline="Hyderabad Airport Evacuated Amid Bomb Scare",
            image_keywords="airport, police, security, luggage",
            created_at=datetime.now(timezone.utc)
        )
    ]
    
    db.add_all(incidents_data)
    db.commit()
    print("Successfully seeded database with diverse crisis incidents!")
    db.close()

if __name__ == "__main__":
    seed_db()
