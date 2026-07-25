@echo off
echo Starting SentinelAI Backend...
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload"

echo Starting SentinelAI Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting up!
