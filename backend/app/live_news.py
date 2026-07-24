import feedparser
from bs4 import BeautifulSoup
import json
import requests
import html
from google import genai
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random

from . import models
from .config import settings

def sync_live_news(db: Session):
    if not settings.GEMINI_API_KEY:
        print("GEMINI_API_KEY is not set. Cannot fetch live news.")
        return 0

    print("Fetching live news from Times of India RSS...")
    feed = feedparser.parse('https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms')
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    class NewsLocation(BaseModel):
        is_relevant: bool = Field(description="Is this a localized event in India (like an accident, protest, disaster, crime, or specific political rally)? Return false if it's a generic national opinion piece or international news.")
        category: str = Field(description="Category: Civil Unrest, Natural Disaster, Security Threat, Traffic Accident, Industrial Hazard, or Other.")
        severity: float = Field(description="Severity from 1.0 to 5.0")
        latitude: float = Field(description="Latitude of the city/state in India where this is happening.")
        longitude: float = Field(description="Longitude of the city/state in India.")
        ai_summary: str = Field(description="1-2 sentence professional intelligence summary.")

    added_count = 0
    # Process the top 10 news items to avoid hitting rate limits too quickly
    for entry in feed.entries[:10]:
        # Check if we already have this news article
        exists = db.query(models.Incident).filter(models.Incident.title == entry.title).first()
        if exists:
            continue

        print(f"Analyzing: {entry.title}")
        
        # Extract image and text from description HTML
        image_url = None
        clean_title = html.unescape(entry.title) if hasattr(entry, 'title') else "Unknown"
        full_text = clean_title
        source_url = entry.link if hasattr(entry, 'link') else None
        
        if hasattr(entry, 'description'):
            soup = BeautifulSoup(entry.description, 'html.parser')
            img_tag = soup.find('img')
            if img_tag and img_tag.get('src'):
                image_url = img_tag.get('src')
            # Extract text, removing HTML tags
            full_text = soup.get_text(separator='\n\n', strip=True)
            if not full_text:
                full_text = entry.title
                
        # If RSS doesn't provide an image, scrape the real article for an og:image
        if not image_url and source_url:
            try:
                # Follow the Google News redirect and get the real page
                res = requests.get(source_url, timeout=4)
                html_soup = BeautifulSoup(res.text, 'html.parser')
                og_img = html_soup.find('meta', property='og:image')
                if og_img and og_img.get('content'):
                    image_url = og_img.get('content')
            except Exception as e:
                pass
        
        prompt = f"""
        Analyze this live news headline from India:
        Title: {clean_title}
        
        Determine if it represents a localized, mappable event. If so, determine its precise coordinates in India.
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': NewsLocation,
                    'temperature': 0.1,
                },
            )
            result = json.loads(response.text)
            
            if result.get("is_relevant"):
                # Save to database
                db_incident = models.Incident(
                    title=clean_title,
                    description=full_text,
                    category=result.get("category", "Other"),
                    latitude=result.get("latitude", 22.0),
                    longitude=result.get("longitude", 78.0),
                    severity=result.get("severity", 2.0),
                    confidence=random.uniform(85.0, 99.0),
                    ai_summary=result.get("ai_summary", ""),
                    news_headline=clean_title,
                    image_keywords=image_url,
                    source_link=source_url
                )
                db.add(db_incident)
                db.commit()
                added_count += 1
                print(f"Added: {entry.title} at {result.get('latitude')}, {result.get('longitude')}")
                
        except Exception as e:
            print(f"Failed to process {entry.title}: {e}")
            
    return added_count
