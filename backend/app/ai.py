import json
from google import genai
from pydantic import BaseModel, Field
from typing import Optional
from .config import settings

def augment_incident_with_ai(title: str, description: str) -> dict:
    """
    Takes an incoming incident report and uses Gemini to generate a structured summary,
    determine the severity (1-5), and assign a confidence score.
    """
    # If no API key is set, fallback gracefully so local testing isn't blocked.
    if not settings.GEMINI_API_KEY:
        return {
            "ai_summary": "[MOCK] AI analysis unavailable. Please provide a GEMINI_API_KEY in the environment.",
            "severity": 3.0,
            "confidence": 50.0,
            "news_headline": "[MOCK] BREAKING: Intelligence processing is currently offline.",
            "image_keywords": "crisis, emergency"
        }
        
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Define the schema we want Gemini to output
        class IncidentAnalysis(BaseModel):
            ai_summary: str = Field(description="A very concise, 1-2 sentence professional summary of the crisis event.")
            severity: float = Field(description="Severity level from 1.0 (lowest) to 5.0 (critical disaster).")
            confidence: float = Field(description="Confidence percentage (0.0 to 100.0) based on the clarity and detail of the report.")
            news_headline: str = Field(description="A simulated, highly engaging 'Breaking News' style headline for this event.")
            image_keywords: str = Field(description="2-3 comma-separated keywords representing the event, used to fetch a relevant stock photo (e.g. 'flood, rain, city').")
            
        prompt = f"""
        Analyze the following incident report and extract structured intelligence.
        
        Title: {title}
        Description: {description}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': IncidentAnalysis,
                'temperature': 0.1,
            },
        )
        
        result = json.loads(response.text)
        return {
            "ai_summary": result.get("ai_summary", ""),
            "severity": result.get("severity", 1.0),
            "confidence": result.get("confidence", 50.0),
            "news_headline": result.get("news_headline", "BREAKING: Major Incident Reported"),
            "image_keywords": result.get("image_keywords", "emergency")
        }
        
    except Exception as e:
        print(f"AI Generation failed: {e}")
        return {
            "ai_summary": "[ERROR] AI analysis failed due to an exception.",
            "severity": 1.0,
            "confidence": 0.0,
            "news_headline": "[ERROR] Failed to generate headline",
            "image_keywords": "error"
        }
