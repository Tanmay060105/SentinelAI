import requests
import time
import sys

API_URL = "http://localhost:8000/incidents"

# A highly orchestrated global cyberattack simulation
DEMO_INCIDENTS = [
    {
        "title": "Massive DDoS Attack on US Eastern Seaboard Grid",
        "description": "Multiple energy providers reporting complete loss of external comms. Cascading failures expected.",
        "category": "CYBERSECURITY",
        "latitude": 40.7128,
        "longitude": -74.0060,
    },
    {
        "title": "London Financial District Network Outage",
        "description": "Stock exchange and major banking hubs have gone dark. Suspected coordinated malware injection.",
        "category": "CYBERSECURITY",
        "latitude": 51.5072,
        "longitude": -0.1276,
    },
    {
        "title": "Tokyo Transport System Hacked",
        "description": "High-speed rail network signaling systems compromised. All trains halted globally.",
        "category": "CYBERSECURITY",
        "latitude": 35.6762,
        "longitude": 139.6503,
    },
    {
        "title": "Global Communications Satellite Array Compromised",
        "description": "Unidentified actors have seized control of orbital routing systems. GPS and comms failing.",
        "category": "CYBERSECURITY",
        "latitude": 0.0,
        "longitude": 0.0,
    }
]

print("========================================")
print(" SENTINEL AI - GLOBAL CRISIS SIMULATOR")
print("========================================\n")
print("Injecting highly coordinated cyberattack sequence into live database...")
print("Make sure your dashboard is open. You should hear the alarms soon!\n")

for i, incident in enumerate(DEMO_INCIDENTS):
    print(f"[{i+1}/{len(DEMO_INCIDENTS)}] Triggering: {incident['title']}")
    try:
        response = requests.post(API_URL, json=incident)
        if response.status_code == 200:
            print("  -> SUCCESS: AI Engine processed threat and assigned severity.")
        else:
            print(f"  -> ERROR: {response.text}")
    except Exception as e:
        print(f"  -> CONNECTION FAILED: Is the backend running? ({e})")
    
    # Wait a few seconds between attacks for dramatic effect
    time.sleep(4)

print("\nSimulation complete. Check the Command Center dashboard.")
