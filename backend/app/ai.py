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

def generate_playbook(title: str, description: str, category: str, severity: float) -> str:
    """
    Generates a 5-step tactical response playbook in Markdown.
    """
    if not settings.GEMINI_API_KEY:
        return "# Simulated Playbook\\n\\n1. **Alert Authorities**: Notify local police.\\n2. **Establish Perimeter**: Secure the area.\\n3. **Deploy Medical**: Dispatch ambulances.\\n4. **Public Advisory**: Issue warnings.\\n5. **Monitor Situation**: Continuous intelligence gathering."
        
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = f"""
        Act as an elite military-grade Crisis Commander.
        Generate a tactical 5-step emergency response playbook for the following crisis:
        
        Crisis: {title}
        Category: {category}
        Severity: {severity}/5.0
        Details: {description}
        
        Output the playbook in beautiful, clean Markdown format. 
        Start directly with the steps. Make it actionable, professional, and specific to the crisis type.
        Use bolding for keywords.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'temperature': 0.4,
            },
        )
        
        return response.text
        
    except Exception as e:
        error_msg = str(e)
        print(f"Playbook Generation failed: {error_msg}")
        
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return """
> [!WARNING]
> **AI Command Center Offline (Quota Exceeded)**
> The Gemini AI API rate limit has been reached. Please wait a few minutes before requesting another custom playbook.

### Standard Fallback Playbook

1. **Assess and Secure**: Immediately secure the perimeter and assess the scale of the incident.
2. **Dispatch Responders**: Deploy relevant emergency services (Police/Fire/Medical) based on incident category.
3. **Establish Comms**: Open a direct communication channel with ground units.
4. **Public Advisory**: Issue a public safety warning to avoid the affected area.
5. **Monitor & Escalate**: Continuously monitor the situation and escalate to higher authorities if severity increases.
            """
            
        return f"**Error generating playbook:** {error_msg}"
