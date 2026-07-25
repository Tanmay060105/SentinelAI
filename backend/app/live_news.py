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
import time

from . import models
from .config import settings

def sync_live_news(db: Session):
    if not settings.GEMINI_API_KEY:
        print("GEMINI_API_KEY is not set. Cannot fetch live news.")
        return 0

    rss_feeds = [
        'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', # TOI India
        'https://feeds.feedburner.com/ndtvnews-india-news',           # NDTV India
        'https://indianexpress.com/section/india/feed/'               # Indian Express
    ]
    
    print("Fetching live news from multiple RSS feeds...")
    all_articles = []
    
    for url in rss_feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:25]: # Max 25 per feed
                clean_title = html.unescape(entry.title) if hasattr(entry, 'title') else ""
                if not clean_title:
                    continue
                # Skip if already in DB
                exists = db.query(models.Incident).filter(models.Incident.title == clean_title).first()
                if exists:
                    continue
                
                full_text = clean_title
                image_url = None
                source_url = entry.link if hasattr(entry, 'link') else None
                
                # 1. Try to get high-res image from media_content (NDTV, Indian Express)
                if hasattr(entry, 'media_content') and len(entry.media_content) > 0:
                    image_url = entry.media_content[0].get('url')
                
                # 2. Try to get image from enclosures (Times of India)
                if not image_url and hasattr(entry, 'enclosures') and len(entry.enclosures) > 0:
                    for enc in entry.enclosures:
                        if enc.get('type', '').startswith('image/'):
                            image_url = enc.get('href')
                            break
                            
                # 3. Fallback to description img tag
                if not image_url and hasattr(entry, 'description'):
                    soup = BeautifulSoup(entry.description, 'html.parser')
                    img_tag = soup.find('img')
                    if img_tag and img_tag.get('src'):
                        src = img_tag.get('src')
                        # Ignore TOI .cms placeholders as they break frontend
                        if not src.endswith('.cms'):
                            image_url = src
                    text = soup.get_text(separator='\n', strip=True)
                    if text:
                        full_text = text
                
                all_articles.append({
                    "title": clean_title,
                    "description": full_text,
                    "url": source_url,
                    "image": image_url
                })
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")

    if not all_articles:
        print("No new articles to process.")
        return 0
        
    print(f"Total new articles to analyze: {len(all_articles)}")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    class NewsLocation(BaseModel):
        index: int = Field(description="The index number (1-N) of the article from the provided list.")
        is_relevant: bool = Field(description="Is this news related to a crisis, disaster, or physical incident in India? ONLY return true for protests, floods, cyclones, landslides, natural disasters, terrorism, riots, severe accidents, or other physical crises. Return false for politics, sports, business, or international news.")
        category: str = Field(description="Category: Civil Unrest, Natural Disaster, Security Threat, Traffic Accident, Industrial Hazard, or Other Crisis.")
        severity: float = Field(description="Severity of the crisis from 1.0 (minor incident) to 5.0 (catastrophic disaster).")
        latitude: float = Field(description="Latitude of the specific city/state in India where the crisis is occurring.")
        longitude: float = Field(description="Longitude of the specific city/state in India where the crisis is occurring.")
        ai_summary: str = Field(description="1-2 sentence professional intelligence summary.")
        image_prompt: str = Field(description="A short 3-5 word generic visual description for a stock photo (e.g. 'flood rescue boat', 'police riot gear barricade', 'train derailment disaster'). No names or specific text.")

    class BatchNewsResult(BaseModel):
        results: list[NewsLocation]

    added_count = 0
    batch_size = 15
    
    for i in range(0, len(all_articles), batch_size):
        batch = all_articles[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1} of {(len(all_articles) + batch_size - 1)//batch_size}...")
        
        prompt = "Analyze the following live news headlines from India.\n\n"
        for idx, article in enumerate(batch):
            prompt += f"[{idx+1}] Title: {article['title']}\nSummary: {article['description'][:200]}...\n\n"
        
        prompt += "Determine which of these represent a localized physical crisis, disaster, or emergency event in India. For those that do, determine precise coordinates."

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': BatchNewsResult,
                        'temperature': 0.1,
                    },
                )
                result_data = json.loads(response.text)
                
                for item in result_data.get("results", []):
                    idx = item.get("index", 0) - 1
                    if 0 <= idx < len(batch) and item.get("is_relevant"):
                        article = batch[idx]
                        db_incident = models.Incident(
                            title=article["title"],
                            description=article["description"],
                            category=item.get("category", "Other"),
                            latitude=item.get("latitude", 22.0),
                            longitude=item.get("longitude", 78.0),
                            severity=item.get("severity", 2.0),
                            confidence=random.uniform(85.0, 99.0),
                            ai_summary=item.get("ai_summary", ""),
                            news_headline=article["title"],
                            image_keywords=article["image"] if article["image"] else item.get("image_prompt", ""),
                            source_link=article["url"]
                        )
                        db.add(db_incident)
                        added_count += 1
                
                db.commit()
                print(f"Batch {i//batch_size + 1} committed. Total relevant added so far: {added_count}")
                time.sleep(5) # Respect rate limits between batches
                break # Success, exit retry loop
                
            except Exception as e:
                print(f"Failed to process batch (Attempt {attempt+1}/{max_retries}): {e}")
                db.rollback()
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    print("Rate limit hit. Waiting 45 seconds before retrying...")
                    time.sleep(45)
                else:
                    time.sleep(5)
            
    return added_count
