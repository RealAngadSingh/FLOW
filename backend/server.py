from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random
import tempfile
import cv2
import json
import asyncio
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

active_connections: List[WebSocket] = []

# Signal cycle logic
async def cycle_traffic_signals():
    """Automatically cycle through traffic signal states"""
    signal_cycle = {
        "green-ns": "yellow-ns",
        "yellow-ns": "red-ns",
        "red-ns": "green-ew",
        "green-ew": "yellow-ew",
        "yellow-ew": "red-ew",
        "red-ew": "green-ns"
    }
    
    while True:
        try:
            # Get current cycle interval from settings
            cycle_interval = await get_cycle_interval()
            await asyncio.sleep(cycle_interval)
            
            intersections = await db.intersections.find({"status": "online"}, {"_id": 0}).to_list(100)
            
            updates = []
            for intersection in intersections:
                current_state = intersection.get("current_signal_state", "green-ns")
                next_state = signal_cycle.get(current_state, "green-ns")
                
                await db.intersections.update_one(
                    {"id": intersection["id"]},
                    {"$set": {"current_signal_state": next_state}}
                )
                
                updates.append({
                    "intersection_id": intersection["id"],
                    "name": intersection["name"],
                    "from": current_state,
                    "to": next_state
                })
                logger.info(f"Updated {intersection['name']}: {current_state} -> {next_state}")
            
            # Broadcast updates to connected WebSocket clients
            if active_connections and updates:
                message = json.dumps({
                    "type": "signal_update",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "updates": updates
                })
                disconnected = []
                for connection in active_connections:
                    try:
                        await connection.send_text(message)
                    except:
                        disconnected.append(connection)
                
                for conn in disconnected:
                    active_connections.remove(conn)
            
        except Exception as e:
            logger.error(f"Error in signal cycling: {e}")
            await asyncio.sleep(5)

signal_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global signal_task
    logger.info("Starting SmartFlow AI Traffic Management System")
    await seed_demo_data()
    
    # Start background task for signal cycling
    signal_task = asyncio.create_task(cycle_traffic_signals())
    logger.info("Started automatic signal cycling")
    
    yield
    
    # Cancel background task on shutdown
    if signal_task:
        signal_task.cancel()
        try:
            await signal_task
        except asyncio.CancelledError:
            pass
    
    logger.info("Shutting down")
    client.close()

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

class TrafficMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    intersection_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    vehicle_count: int
    avg_speed: float
    queue_length: int
    lane_data: Dict[str, Any] = Field(default_factory=dict)

class Intersection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: Dict[str, float]
    current_signal_state: str
    signal_timing: Dict[str, int]
    coordination_mode: str = "adaptive"
    status: str = "online"

class VehicleDetection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    intersection_id: str
    vehicle_type: str
    lane: str
    speed: float
    confidence: float
    tracking_id: str
    bbox: Dict[str, float] = Field(default_factory=dict)

class Incident(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    type: str
    intersection_id: str
    location: str
    severity: str
    status: str = "active"
    description: str
    resolved_at: Optional[datetime] = None

class VideoFeed(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    source_type: str
    url: str
    intersection_id: str
    status: str = "active"
    fps: int = 30
    resolution: str = "1920x1080"
    last_frame_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreateIncident(BaseModel):
    type: str
    intersection_id: str
    location: str
    severity: str
    description: str

class UpdateIntersection(BaseModel):
    current_signal_state: Optional[str] = None
    signal_timing: Optional[Dict[str, int]] = None
    coordination_mode: Optional[str] = None
    status: Optional[str] = None

class SystemSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "system_settings"
    signal_cycle_interval: int = 30  # seconds
    manual_override: bool = False  # True if manually set, False if schedule-controlled

class Schedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    days_of_week: List[int]  # 0=Monday, 6=Sunday
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    cycle_interval: int  # seconds
    priority: int = 1  # Higher priority overrides lower
    active: bool = True

class CreateSchedule(BaseModel):
    name: str
    days_of_week: List[int]
    start_time: str
    end_time: str
    cycle_interval: int
    priority: int = 1
    active: bool = True

async def get_cycle_interval():
    """Get current signal cycle interval from database"""
    settings = await db.system_settings.find_one({"id": "system_settings"}, {"_id": 0})
    if settings:
        return settings.get("signal_cycle_interval", 30)
    return 30

async def seed_demo_data():
    """Seed database with demo data"""
    existing = await db.intersections.count_documents({})
    if existing > 0:
        logger.info("Demo data already exists")
        return
    
    logger.info("Seeding demo data...")
    
    # Seed system settings
    existing_settings = await db.system_settings.count_documents({})
    if existing_settings == 0:
        await db.system_settings.insert_one({
            "id": "system_settings",
            "signal_cycle_interval": 30
        })
        logger.info("Seeded system settings")
    
    intersections_data = [
        {"id": "int-001", "name": "Main St & 1st Ave", "location": {"lat": 40.7580, "lng": -73.9855}, "current_signal_state": "green-ns", "signal_timing": {"green": 45, "yellow": 5, "red": 50}, "coordination_mode": "adaptive", "status": "online"},
        {"id": "int-002", "name": "Broadway & 5th St", "location": {"lat": 40.7589, "lng": -73.9851}, "current_signal_state": "red-ns", "signal_timing": {"green": 40, "yellow": 5, "red": 45}, "coordination_mode": "adaptive", "status": "online"},
        {"id": "int-003", "name": "Park Ave & 12th St", "location": {"lat": 40.7595, "lng": -73.9845}, "current_signal_state": "green-ew", "signal_timing": {"green": 50, "yellow": 5, "red": 55}, "coordination_mode": "coordinated", "status": "online"},
        {"id": "int-004", "name": "Oak Blvd & Elm St", "location": {"lat": 40.7570, "lng": -73.9865}, "current_signal_state": "yellow-ns", "signal_timing": {"green": 35, "yellow": 5, "red": 40}, "coordination_mode": "fixed", "status": "maintenance"},
        {"id": "int-005", "name": "Market St & 3rd Ave", "location": {"lat": 40.7600, "lng": -73.9840}, "current_signal_state": "green-ns", "signal_timing": {"green": 45, "yellow": 5, "red": 50}, "coordination_mode": "adaptive", "status": "online"},
    ]
    await db.intersections.insert_many(intersections_data)
    
    video_feeds_data = [
        {"id": "feed-001", "name": "Main & 1st - North", "source_type": "static", "url": "https://images.unsplash.com/photo-1768295983463-7b148a5efe05", "intersection_id": "int-001", "status": "active", "fps": 30, "resolution": "1920x1080", "last_frame_at": datetime.now(timezone.utc).isoformat()},
        {"id": "feed-002", "name": "Broadway & 5th - East", "source_type": "static", "url": "https://images.unsplash.com/photo-1766367959391-a2d508ed766a", "intersection_id": "int-002", "status": "active", "fps": 30, "resolution": "1920x1080", "last_frame_at": datetime.now(timezone.utc).isoformat()},
        {"id": "feed-003", "name": "Park & 12th - South", "source_type": "static", "url": "https://images.unsplash.com/photo-1561642873-d31c251291e7", "intersection_id": "int-003", "status": "active", "fps": 30, "resolution": "1920x1080", "last_frame_at": datetime.now(timezone.utc).isoformat()},
        {"id": "feed-004", "name": "Oak & Elm - West", "source_type": "static", "url": "https://images.unsplash.com/photo-1712249236911-4051b2a3cd3a", "intersection_id": "int-004", "status": "inactive", "fps": 30, "resolution": "1920x1080", "last_frame_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.video_feeds.insert_many(video_feeds_data)
    
    incidents_data = [
        {"id": "inc-001", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(), "type": "collision", "intersection_id": "int-002", "location": "Broadway & 5th St - Northbound", "severity": "high", "status": "active", "description": "Two-vehicle collision blocking left lane", "resolved_at": None},
        {"id": "inc-002", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=45)).isoformat(), "type": "stopped_vehicle", "intersection_id": "int-001", "location": "Main St & 1st Ave - Westbound", "severity": "medium", "status": "active", "description": "Disabled vehicle in middle lane", "resolved_at": None},
        {"id": "inc-003", "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(), "type": "pedestrian_incident", "intersection_id": "int-003", "location": "Park Ave & 12th St - Crosswalk", "severity": "low", "status": "resolved", "description": "Pedestrian jaywalking detected", "resolved_at": (datetime.now(timezone.utc) - timedelta(hours=1, minutes=30)).isoformat()},
    ]
    await db.incidents.insert_many(incidents_data)
    
    vehicle_types = ["car", "truck", "bus", "motorcycle", "bicycle"]
    lanes = ["northbound", "southbound", "eastbound", "westbound"]
    detections_data = []
    
    for i in range(100):
        detection = {
            "id": f"det-{str(i+1).zfill(3)}",
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(0, 120))).isoformat(),
            "intersection_id": random.choice(["int-001", "int-002", "int-003", "int-005"]),
            "vehicle_type": random.choice(vehicle_types),
            "lane": random.choice(lanes),
            "speed": round(random.uniform(15, 50), 1),
            "confidence": round(random.uniform(0.85, 0.99), 2),
            "tracking_id": f"trk-{random.randint(1000, 9999)}",
            "bbox": {"x1": random.randint(100, 400), "y1": random.randint(100, 300), "x2": random.randint(500, 800), "y2": random.randint(400, 600)}
        }
        detections_data.append(detection)
    await db.vehicle_detections.insert_many(detections_data)
    
    traffic_metrics_data = []
    for i in range(288):
        for int_id in ["int-001", "int-002", "int-003", "int-004", "int-005"]:
            metric = {
                "id": str(uuid.uuid4()),
                "intersection_id": int_id,
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=i*5)).isoformat(),
                "vehicle_count": random.randint(10, 80),
                "avg_speed": round(random.uniform(20, 45), 1),
                "queue_length": random.randint(0, 15),
                "lane_data": {"northbound": random.randint(5, 20), "southbound": random.randint(5, 20), "eastbound": random.randint(5, 20), "westbound": random.randint(5, 20)}
            }
            traffic_metrics_data.append(metric)
    await db.traffic_metrics.insert_many(traffic_metrics_data)
    
    logger.info(f"Seeded {len(intersections_data)} intersections, {len(video_feeds_data)} feeds, {len(incidents_data)} incidents, {len(detections_data)} detections, {len(traffic_metrics_data)} metrics")

@api_router.get("/")
async def root():
    return {"message": "SmartFlow AI Traffic Management System", "version": "1.0.0", "status": "operational"}

@api_router.get("/traffic/dashboard")
async def get_dashboard_stats():
    """Get aggregated dashboard statistics"""
    recent_time = datetime.now(timezone.utc) - timedelta(minutes=10)
    
    total_intersections = await db.intersections.count_documents({})
    active_intersections = await db.intersections.count_documents({"status": "online"})
    active_incidents = await db.incidents.count_documents({"status": "active"})
    
    recent_metrics = await db.traffic_metrics.find(
        {"timestamp": {"$gte": recent_time.isoformat()}},
        {"_id": 0}
    ).to_list(1000)
    
    avg_speed = sum(m["avg_speed"] for m in recent_metrics) / len(recent_metrics) if recent_metrics else 0
    total_vehicles = sum(m["vehicle_count"] for m in recent_metrics) if recent_metrics else 0
    avg_queue = sum(m["queue_length"] for m in recent_metrics) / len(recent_metrics) if recent_metrics else 0
    
    congestion_level = "low" if avg_queue < 5 else "medium" if avg_queue < 10 else "high"
    
    return {
        "total_intersections": total_intersections,
        "active_intersections": active_intersections,
        "active_incidents": active_incidents,
        "avg_speed": round(avg_speed, 1),
        "total_vehicles_detected": total_vehicles,
        "avg_queue_length": round(avg_queue, 1),
        "congestion_level": congestion_level,
        "system_status": "operational",
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/traffic/metrics")
async def get_traffic_metrics(intersection_id: Optional[str] = None, hours: int = 1):
    """Get traffic metrics"""
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = {"timestamp": {"$gte": time_threshold.isoformat()}}
    if intersection_id:
        query["intersection_id"] = intersection_id
    
    metrics = await db.traffic_metrics.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return {"metrics": metrics, "count": len(metrics)}

@api_router.get("/intersections", response_model=List[Intersection])
async def get_intersections():
    """Get all intersections"""
    intersections = await db.intersections.find({}, {"_id": 0}).to_list(100)
    return intersections

@api_router.get("/intersections/{intersection_id}")
async def get_intersection(intersection_id: str):
    """Get single intersection details"""
    intersection = await db.intersections.find_one({"id": intersection_id}, {"_id": 0})
    if not intersection:
        raise HTTPException(status_code=404, detail="Intersection not found")
    return intersection

@api_router.patch("/intersections/{intersection_id}")
async def update_intersection(intersection_id: str, update: UpdateIntersection):
    """Update intersection signal control"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    # Get current state before update
    current = await db.intersections.find_one({"id": intersection_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Intersection not found")
    
    result = await db.intersections.update_one(
        {"id": intersection_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Intersection not found")
    
    updated = await db.intersections.find_one({"id": intersection_id}, {"_id": 0})
    
    # Broadcast manual update to WebSocket clients
    if active_connections and "current_signal_state" in update_data:
        message = json.dumps({
            "type": "manual_signal_update",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "updates": [{
                "intersection_id": intersection_id,
                "name": current["name"],
                "from": current.get("current_signal_state"),
                "to": update_data["current_signal_state"]
            }]
        })
        disconnected = []
        for connection in active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        for conn in disconnected:
            active_connections.remove(conn)
    
    return updated

@api_router.get("/vehicles/detections")
async def get_vehicle_detections(intersection_id: Optional[str] = None, vehicle_type: Optional[str] = None, limit: int = 100):
    """Get vehicle detection logs"""
    query = {}
    if intersection_id:
        query["intersection_id"] = intersection_id
    if vehicle_type:
        query["vehicle_type"] = vehicle_type
    
    detections = await db.vehicle_detections.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return {"detections": detections, "count": len(detections)}

@api_router.get("/vehicles/stats")
async def get_vehicle_stats():
    """Get vehicle type breakdown statistics"""
    pipeline = [
        {"$group": {"_id": "$vehicle_type", "count": {"$sum": 1}, "avg_speed": {"$avg": "$speed"}}},
        {"$sort": {"count": -1}}
    ]
    stats = await db.vehicle_detections.aggregate(pipeline).to_list(100)
    
    formatted_stats = [
        {"vehicle_type": s["_id"], "count": s["count"], "avg_speed": round(s["avg_speed"], 1)}
        for s in stats
    ]
    
    return {"stats": formatted_stats}

@api_router.get("/incidents", response_model=List[Incident])
async def get_incidents(status: Optional[str] = None):
    """Get incidents"""
    query = {}
    if status:
        query["status"] = status
    
    incidents = await db.incidents.find(query, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return incidents

@api_router.post("/incidents", response_model=Incident)
async def create_incident(incident: CreateIncident):
    """Create new incident"""
    incident_obj = Incident(**incident.model_dump())
    doc = incident_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    
    await db.incidents.insert_one(doc)
    return incident_obj

@api_router.patch("/incidents/{incident_id}")
async def update_incident(incident_id: str, status: str):
    """Update incident status"""
    update_data = {"status": status}
    if status == "resolved":
        update_data["resolved_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.incidents.update_one(
        {"id": incident_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    updated = await db.incidents.find_one({"id": incident_id}, {"_id": 0})
    return updated

@api_router.get("/feeds", response_model=List[VideoFeed])
async def get_video_feeds():
    """Get all video feeds"""
    feeds = await db.video_feeds.find({}, {"_id": 0}).to_list(100)
    return feeds

@api_router.post("/feeds/upload")
async def upload_video(file: UploadFile = File(...), intersection_id: str = Form(...), background_tasks: BackgroundTasks = None):
    """Upload video file for processing"""
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: .mp4, .avi, .mov")
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            if tmp_path and Path(tmp_path).exists():
                Path(tmp_path).unlink()
            raise HTTPException(status_code=400, detail="Cannot open video file. Please upload a valid video file.")
        
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS)) if cap.get(cv2.CAP_PROP_FPS) > 0 else 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) if cap.get(cv2.CAP_PROP_FRAME_WIDTH) > 0 else 1920
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) if cap.get(cv2.CAP_PROP_FRAME_HEIGHT) > 0 else 1080
        cap.release()
        
        detections = await process_video_mock(tmp_path, intersection_id)
        
        if background_tasks and tmp_path:
            background_tasks.add_task(cleanup_temp_file, tmp_path)
        elif tmp_path and Path(tmp_path).exists():
            Path(tmp_path).unlink()
        
        return {
            "status": "success",
            "filename": file.filename,
            "frame_count": frame_count if frame_count > 0 else 1,
            "fps": fps,
            "resolution": f"{width}x{height}",
            "detections_count": len(detections),
            "message": "Video processed successfully (mock detection - ready for YOLO integration)"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing video: {e}")
        if tmp_path and Path(tmp_path).exists():
            try:
                Path(tmp_path).unlink()
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

async def process_video_mock(video_path: str, intersection_id: str):
    """Mock vehicle detection processing"""
    vehicle_types = ["car", "truck", "bus", "motorcycle", "bicycle"]
    lanes = ["northbound", "southbound", "eastbound", "westbound"]
    
    detections = []
    for i in range(random.randint(20, 50)):
        detection = VehicleDetection(
            intersection_id=intersection_id,
            vehicle_type=random.choice(vehicle_types),
            lane=random.choice(lanes),
            speed=round(random.uniform(15, 50), 1),
            confidence=round(random.uniform(0.85, 0.99), 2),
            tracking_id=f"trk-{random.randint(1000, 9999)}",
            bbox={"x1": random.randint(100, 400), "y1": random.randint(100, 300), "x2": random.randint(500, 800), "y2": random.randint(400, 600)}
        )
        doc = detection.model_dump()
        doc["timestamp"] = doc["timestamp"].isoformat()
        detections.append(doc)
    
    if detections:
        await db.vehicle_detections.insert_many(detections)
    
    return detections

async def cleanup_temp_file(file_path: str):
    """Clean up temporary files"""
    try:
        Path(file_path).unlink()
        logger.info(f"Cleaned up: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to clean up {file_path}: {e}")

@api_router.get("/analytics/hourly")
async def get_hourly_analytics(hours: int = 24):
    """Get hourly traffic analytics"""
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": time_threshold.isoformat()}}},
        {"$group": {
            "_id": {"$substr": ["$timestamp", 0, 13]},
            "avg_speed": {"$avg": "$avg_speed"},
            "total_vehicles": {"$sum": "$vehicle_count"},
            "avg_queue": {"$avg": "$queue_length"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.traffic_metrics.aggregate(pipeline).to_list(1000)
    
    formatted = [
        {
            "hour": r["_id"],
            "avg_speed": round(r["avg_speed"], 1),
            "total_vehicles": r["total_vehicles"],
            "avg_queue": round(r["avg_queue"], 1)
        }
        for r in results
    ]
    
    return {"analytics": formatted}

@api_router.get("/settings")
async def get_settings():
    """Get system settings"""
    settings = await db.system_settings.find_one({"id": "system_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        return {"id": "system_settings", "signal_cycle_interval": 30}
    return settings

@api_router.patch("/settings")
async def update_settings(signal_cycle_interval: int):
    """Update system settings"""
    if signal_cycle_interval < 5 or signal_cycle_interval > 300:
        raise HTTPException(status_code=400, detail="Cycle interval must be between 5 and 300 seconds")
    
    await db.system_settings.update_one(
        {"id": "system_settings"},
        {"$set": {"signal_cycle_interval": signal_cycle_interval}},
        upsert=True
    )
    
    logger.info(f"Updated signal cycle interval to {signal_cycle_interval} seconds")
    
    settings = await db.system_settings.find_one({"id": "system_settings"}, {"_id": 0})
    return settings

@api_router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(json.dumps({"status": "connected", "timestamp": datetime.now(timezone.utc).isoformat()}))
    except WebSocketDisconnect:
        active_connections.remove(websocket)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
