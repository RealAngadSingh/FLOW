# SmartFlow AI

## Real-Time Traffic Intelligence Platform

SmartFlow AI is a full-stack prototype for intelligent traffic management. The system demonstrates how traffic data can be processed by a backend decision engine to dynamically select traffic-signal priorities, calculate green-light duration, monitor congestion, and manage traffic incidents.

The current prototype uses simulated traffic and incident data. The architecture is designed so that the simulated components can later be replaced with real camera feeds, YOLOv8-based vehicle detection, trained machine-learning models, and reinforcement-learning-based signal optimization.

---

## 1. Project Objective

Traditional traffic signals generally rely on fixed timings and may not respond efficiently to changing traffic density.

SmartFlow AI aims to demonstrate an adaptive approach where:

1. Traffic conditions are collected.
2. Vehicle density is analyzed.
3. The traffic optimizer determines the highest-priority approach.
4. An adaptive green-light duration is calculated.
5. Congestion is calculated.
6. Traffic incidents can be detected and displayed.
7. The results are sent to the frontend dashboard.

---

## 2. Current Project Status

### Implemented

* Full frontend dashboard
* Python FastAPI backend
* REST API
* Frontend-to-backend HTTP communication
* JSON data exchange
* Adaptive traffic decision algorithm
* Traffic congestion calculation
* Lane-level traffic visualization
* Traffic signal visualization
* AI reasoning log
* Incident management interface
* Backend health endpoint
* Interactive FastAPI API documentation
* One-click Windows launcher

### Currently Simulated

The following components are simulated for the prototype:

* Vehicle/camera sensor data
* Vehicle detection
* Traffic incidents
* Emergency response

The traffic optimizer is currently a rule-based decision engine and is not a trained reinforcement-learning model.

---

## 3. Technology Stack

| Technology | Purpose                              |
| ---------- | ------------------------------------ |
| HTML       | Structure of the web dashboard       |
| CSS        | UI design, layout and responsiveness |
| JavaScript | Frontend logic and API communication |
| Python     | Backend programming                  |
| FastAPI    | REST API and backend server          |
| Uvicorn    | Runs the FastAPI application         |
| JSON       | Frontend-backend data communication  |
| Git/GitHub | Source-code management               |
| Vercel     | Planned frontend deployment          |
| Render     | Planned backend deployment           |
| YOLOv8     | Planned real vehicle detection       |

---

## 4. Project Structure

```text
SmartFlow_AI_Project/
│
├── index.html
│
├── run.bat
│
├── README.md
│
├── css/
│   └── styles.css
│
├── js/
│   └── app.js
│
├── assets/
│
└── backend/
    │
    ├── main.py
    ├── requirements.txt
    ├── README.md
    │
    └── ai/
        ├── vehicle_detector.py
        ├── traffic_ai.py
        └── incident_detector.py
```

---

# 5. Folder and File Explanation

## `index.html`

The main webpage.

It contains the SmartFlow AI dashboard including:

* Navigation
* Problem section
* Solution section
* Traffic signal
* Traffic metrics
* Lane density
* Congestion indicator
* AI reasoning log
* Incident panel

---

## `css/styles.css`

Contains the complete styling for the dashboard.

It controls:

* Colors
* Fonts
* Cards
* Buttons
* Traffic lights
* Layout
* Animations
* Responsive behavior

---

## `js/app.js`

The frontend JavaScript application.

Its main responsibility is to communicate with the backend.

The frontend requests data from:

```text
http://127.0.0.1:8000/api/dashboard
```

and uses the returned JSON data to update the dashboard.

---

## `backend/main.py`

The main FastAPI server.

It provides the following API endpoints:

```text
GET /
GET /api/health
GET /api/traffic
GET /api/incidents
GET /api/dashboard
```

The `/api/dashboard` endpoint provides the main data required by the frontend.

---

## `backend/ai/vehicle_detector.py`

Contains the prototype vehicle detector.

Currently it generates simulated traffic values for:

```text
N = North
S = South
E = East
W = West
```

Each approach contains:

* Vehicle count
* Lane 1 count
* Lane 2 count
* Average speed
* Occupancy

This file is designed to be replaced by a real camera/YOLO pipeline in a future version.

---

## `backend/ai/traffic_ai.py`

Contains the adaptive traffic optimization logic.

The optimizer considers:

* Vehicle density
* Waiting/starvation time

It calculates a priority score for each approach.

The approach with the highest score is selected.

The system then calculates an adaptive green duration.

Example:

```text
North = 20 vehicles
South = 14 vehicles
East  = 32 vehicles
West  = 10 vehicles

Highest priority = East

Green duration = calculated dynamically
```

---

## `backend/ai/incident_detector.py`

Contains the prototype incident detector.

Possible incident types include:

```text
CRASH
STALL
DEBRIS
PEDESTRIAN_EMERGENCY
```

Possible severity levels include:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

The current version generates incidents for demonstration purposes.

---

# 6. How the System Works

The complete data flow is:

```text
Traffic Data
     │
     ▼
Vehicle Detector
     │
     ▼
Traffic Optimizer
     │
     ├── Priority Approach
     ├── Green Duration
     └── Congestion
     │
     ▼
FastAPI Backend
     │
     │ JSON
     ▼
JavaScript Frontend
     │
     ▼
SmartFlow Dashboard
```

For incidents:

```text
Incident Detector
       │
       ▼
FastAPI
       │
       ▼
Frontend
       │
       ▼
Incident Panel
```

---

# 7. Requirements

Before running the project, install:

* Python 3
* A modern web browser
* Internet connection for the initial Python package installation

Python can be downloaded from:

https://www.python.org/downloads/

During Python installation on Windows, enable:

```text
Add Python to PATH
```

---

# 8. Installation

Open Command Prompt inside the project folder.

Check Python:

```bash
python --version
```

Then enter the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

---

# 9. Run the Backend

Inside the `backend` folder, run:

```bash
python -m uvicorn main:app --reload
```

The backend should start at:

```text
http://127.0.0.1:8000
```

---

# 10. Test the Backend

Open a browser and visit:

```text
http://127.0.0.1:8000
```

The server should return information indicating that SmartFlow AI is online.

### Health check

```text
http://127.0.0.1:8000/api/health
```

### Traffic API

```text
http://127.0.0.1:8000/api/traffic
```

### Incident API

```text
http://127.0.0.1:8000/api/incidents
```

### Complete dashboard API

```text
http://127.0.0.1:8000/api/dashboard
```

---

# 11. API Documentation

FastAPI automatically provides interactive API documentation.

Open:

```text
http://127.0.0.1:8000/docs
```

From there, individual endpoints can be tested using the **Try it out** and **Execute** buttons.

---

# 12. Run the Frontend

Once the backend is running, open:

```text
index.html
```

in a web browser.

The frontend connects to:

```text
http://127.0.0.1:8000
```

and retrieves traffic information from the backend.

Keep the backend terminal open while using the dashboard.

---

# 13. One-Click Run

For Windows, the project contains:

```text
run.bat
```

Double-clicking `run.bat` will:

1. Check for Python.
2. Create a virtual environment if required.
3. Install backend dependencies.
4. Start the FastAPI server.
5. Open the frontend.

Therefore, after the initial setup, the project can be started using:

```text
run.bat
```

---

# 14. Demonstration

During the demonstration, the dashboard shows:

### Traffic Signal

Displays:

```text
RED
AMBER
GREEN
```

and identifies the currently active approach.

### Queue Length

Shows the maximum number of vehicles detected on an approach.

### Vehicles Detected

Shows the total vehicles across all approaches.

### AI Green Duration

Shows the green-light duration calculated by the traffic optimizer.

### Lane Density

Displays traffic density separately for the four approaches.

### Congestion

Displays the calculated network congestion percentage.

### AI Reasoning Log

Shows the traffic scores used to select the priority approach.

### Active Incidents

Displays detected incidents, severity and response information.

---

# 15. Deployment

The planned deployment architecture is:

```text
                    SMARTFLOW AI
                         │
             ┌───────────┴───────────┐
             │                       │
          FRONTEND                 BACKEND
           Vercel                  Render
             │                       │
             │       HTTPS API       │
             └───────────────────────┘
```

The frontend can be deployed to Vercel.

The FastAPI backend can be deployed to Render.

After deployment, the frontend API address will be changed from:

```text
http://127.0.0.1:8000
```

to the public backend URL.

---

# 16. Future Improvements

## YOLOv8 Vehicle Detection

Replace the simulated vehicle detector with a real YOLOv8-based computer-vision system.

Possible workflow:

```text
Camera / Video
      ↓
YOLOv8
      ↓
Vehicle Detection
      ↓
Vehicle Tracking
      ↓
Lane-wise Counting
      ↓
Traffic Backend
```

The model could detect and count vehicles such as:

* Cars
* Buses
* Trucks
* Motorcycles

---

## Machine Learning

Future versions can use trained ML models for:

* Traffic prediction
* Congestion prediction
* Queue-length forecasting
* Traffic-flow analysis

Historical traffic data can be stored and used for model training.

---

## Reinforcement Learning

A future reinforcement-learning system could learn traffic-signal policies using:

* Queue length
* Waiting time
* Traffic density
* Vehicle arrival rate
* Signal phase

The objective would be to optimize traffic flow compared with fixed signal timings.

---

## Real Camera Integration

Future versions can connect:

* CCTV cameras
* IP cameras
* Webcams
* Recorded traffic videos

This would replace the current simulated sensor data.

---

## Database

A database can be added to store:

```text
Traffic history
Vehicle counts
Signal decisions
Incidents
Waiting times
Congestion levels
```

This would enable historical analytics and ML training.

---

## Multi-Intersection Support

The current prototype demonstrates one intersection:

```text
IX-001
```

A future version can support multiple intersections and coordinate signal timing between them.

---

# 17. Current vs Future

| Component              | Current Prototype | Future Version             |
| ---------------------- | ----------------- | -------------------------- |
| Frontend               | Implemented       | Further UI improvements    |
| FastAPI Backend        | Implemented       | Cloud deployment           |
| REST API               | Implemented       | Authentication/scaling     |
| Traffic Data           | Simulated         | Real camera/YOLO           |
| Vehicle Detection      | Simulated         | YOLOv8                     |
| Traffic Optimization   | Rule-based        | ML/RL                      |
| Incident Detection     | Simulated         | Computer vision            |
| Database               | Not included      | Traffic history database   |
| Deployment             | Local             | Vercel + Render            |
| Multiple Intersections | Prototype: 1      | Multi-intersection network |

---

# 18. Important Project Note

SmartFlow AI is currently a **working full-stack prototype**.

The backend is a real FastAPI application and the frontend communicates with it through HTTP/JSON APIs.

However, the current traffic sensor and incident inputs are simulated.

The project architecture is intentionally modular so that future versions can replace the simulated components with real computer-vision and machine-learning systems without redesigning the complete frontend/backend architecture.

---

## 19. Quick Start

For the simplest setup:

```bash
# 1. Extract the project

# 2. Open the project folder

# 3. Double-click:
run.bat
```

Or manually:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Then open:

```text
index.html
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 20. Project Summary

**SmartFlow AI** demonstrates a modern approach to traffic management by combining a web dashboard, backend API and adaptive traffic decision engine.

The current prototype proves the complete software architecture and data flow while leaving the system ready for future integration of:

* YOLOv8
* Real-time camera feeds
* Machine-learning models
* Reinforcement learning
* Database analytics
* Cloud deployment
* Multi-intersection traffic coordination
