from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from ai.traffic_ai import TrafficOptimizer
from ai.vehicle_detector import VehicleDetector
from ai.incident_detector import IncidentDetector

app = FastAPI(
    title="SmartFlow AI Backend",
    description="Backend API for the SmartFlow AI traffic intelligence prototype",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vehicle_detector = VehicleDetector()
traffic_optimizer = TrafficOptimizer()
incident_detector = IncidentDetector()


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SmartFlow AI",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/traffic")
def traffic():
    """Return the current simulated sensor state and AI signal decision."""
    approaches = vehicle_detector.get_current_traffic()

    decision = traffic_optimizer.decide(approaches)

    return {
        "intersectionId": "IX-001",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "approaches": approaches,
        "decision": decision,
        "congestion": traffic_optimizer.congestion_index(approaches),
    }


@app.get("/api/incidents")
def incidents():
    """Generate/check the simulated incident stream."""
    incident = incident_detector.detect()
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "incident": incident,
        "active": incident_detector.get_active(),
    }


@app.get("/api/dashboard")
def dashboard():
    """Single endpoint the frontend can poll for the whole dashboard."""
    approaches = vehicle_detector.get_current_traffic()
    decision = traffic_optimizer.decide(approaches)
    incident = incident_detector.detect()

    return {
        "intersectionId": "IX-001",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "approaches": approaches,
        "decision": decision,
        "congestion": traffic_optimizer.congestion_index(approaches),
        "incident": incident,
        "activeIncidents": incident_detector.get_active(),
    }
