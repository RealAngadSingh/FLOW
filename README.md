# SmartFlow AI — Full-Stack Prototype

## Structure

SmartFlow_AI_Project/
├── index.html
├── run.bat
├── README.md
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│   └── ai/
│       ├── vehicle_detector.py
│       ├── traffic_ai.py
│       └── incident_detector.py
└── assets/

## Run everything

On Windows, double-click:

run.bat

The launcher creates a Python virtual environment, installs the backend
dependencies, starts FastAPI, and opens the frontend.

## Manual run

Terminal 1:

cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload

Then open:

index.html

## Backend API

http://127.0.0.1:8000/
http://127.0.0.1:8000/api/health
http://127.0.0.1:8000/api/traffic
http://127.0.0.1:8000/api/incidents
http://127.0.0.1:8000/api/dashboard
http://127.0.0.1:8000/docs

## What is real vs simulated?

REAL:
- Python backend process
- FastAPI REST API
- frontend-to-backend HTTP communication
- backend traffic decision engine
- congestion calculation
- JSON data flow
- API documentation

SIMULATED:
- camera/vehicle sensor data
- YOLO vehicle detection
- incident detection
- reinforcement learning

The project is therefore a real full-stack prototype, but it does not yet
connect to a physical camera or trained ML/RL model.
