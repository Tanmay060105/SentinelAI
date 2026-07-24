FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Also install apscheduler and beautifulsoup4 which we added later
RUN pip install apscheduler beautifulsoup4 feedparser

COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
