# SmartFlow AI - Traffic Management System

A comprehensive AI-powered traffic management platform for real-time monitoring, vehicle detection, and intelligent signal control.

## 🚦 Features

### Core Functionality
- **Real-time Dashboard**: Live traffic metrics, intersection status, and active incidents
- **Interactive Map**: OpenStreetMap integration showing all intersections with real-time data
- **Vehicle Detection**: AI-ready vehicle classification (cars, trucks, buses, motorcycles, bicycles)
- **Intersection Control**: Dynamic signal timing adjustment and coordination modes
- **Incident Management**: Real-time incident tracking and resolution workflow
- **Video Feed Management**: Multi-camera support with video upload and processing
- **Analytics**: Historical traffic patterns with interactive charts

### Technical Features
- **Dark Theme**: Professional mission control aesthetic
- **MongoDB Database**: Scalable data storage with demo data included
- **RESTful API**: Comprehensive backend with 15+ endpoints
- **Real-time Updates**: Auto-refresh dashboard every 5 seconds
- **Mock Vehicle Detection**: Prototype-ready structure for YOLO integration

## 🏗️ Architecture

### Backend (FastAPI + MongoDB)
- **FastAPI**: High-performance async API
- **MongoDB**: Document database for traffic data
- **Motor**: Async MongoDB driver
- **OpenCV**: Video processing (ready for YOLO integration)
- **Ultralytics**: YOLO model support (structure implemented)

### Frontend (React + Tailwind)
- **React 19**: Modern UI framework
- **React Router**: Multi-page navigation
- **Leaflet**: Interactive maps
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first styling

## 📊 Database Collections

### Intersections
- Signal states and timing
- Coordination modes (adaptive, coordinated, fixed)
- Geographic locations
- Status monitoring

### Traffic Metrics
- Vehicle counts per intersection
- Average speeds
- Queue lengths
- Lane-level data

### Vehicle Detections
- Vehicle type classification
- Speed and confidence scores
- Tracking IDs and bounding boxes
- Timestamp and location data

### Incidents
- Incident types (collision, stopped vehicle, etc.)
- Severity levels (high, medium, low)
- Status tracking (active, resolved)
- Location and description

### Video Feeds
- Camera metadata
- Feed status and resolution
- FPS and last frame timestamp

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn package manager

### Installation

Backend dependencies are already installed:
```bash
cd /app/backend
pip install -r requirements.txt
```

Frontend dependencies are already installed:
```bash
cd /app/frontend
yarn install
```

### Environment Variables

**Backend** (`/app/backend/.env`):
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

**Frontend** (`/app/frontend/.env`):
```
REACT_APP_BACKEND_URL=https://pdf-to-deploy.preview.emergentagent.com
```

### Running the Application

The application is already running via Supervisor:
```bash
sudo supervisorctl status
```

Access the app at: https://pdf-to-deploy.preview.emergentagent.com

## 📡 API Endpoints

### Dashboard & Metrics
- `GET /api/` - System status
- `GET /api/traffic/dashboard` - Aggregated dashboard statistics
- `GET /api/traffic/metrics` - Traffic metrics with filtering

### Intersections
- `GET /api/intersections` - List all intersections
- `GET /api/intersections/{id}` - Get intersection details
- `PATCH /api/intersections/{id}` - Update signal control

### Vehicle Detection
- `GET /api/vehicles/detections` - Vehicle detection logs
- `GET /api/vehicles/stats` - Vehicle type statistics

### Incidents
- `GET /api/incidents` - List incidents (filterable by status)
- `POST /api/incidents` - Create new incident
- `PATCH /api/incidents/{id}` - Update incident status

### Video Feeds
- `GET /api/feeds` - List all video feeds
- `POST /api/feeds/upload` - Upload video for processing

### Analytics
- `GET /api/analytics/hourly` - Hourly traffic analytics

## 🎨 Design System

### Dark Theme (Mission Control)
- **Background**: #09090b (zinc-950)
- **Cards**: Semi-transparent with zinc-800 borders
- **Typography**: Barlow Condensed (headings), Manrope (body), JetBrains Mono (data)
- **Status Colors**: 
  - Green (#10b981) - Good/Online
  - Amber (#f59e0b) - Warning/Medium
  - Red (#ef4444) - Critical/High

### Key Components
- Metric cards with real-time updates
- Color-coded signal timing displays
- LIVE badges with pulse animation
- Scanline overlay on video feeds
- Flat, bordered design with minimal radius

## 🤖 Vehicle Recognition

### Current Implementation (Prototype)
The system includes a **mock vehicle detection** function that simulates YOLO output:
- Generates realistic vehicle detection data
- Random vehicle types, speeds, and confidence scores
- Bounding box coordinates
- Tracking IDs

### Integration with YOLO (Ready to Deploy)

The backend is **structured and ready** for YOLO integration:

1. **Dependencies Installed**: `ultralytics`, `opencv-python-headless`, `torch`
2. **Function Structure**: `process_video_mock()` can be replaced with actual YOLO processing
3. **Model Path**: Configure in environment or load from `/app/models/`

#### To Integrate Real YOLO:

Replace `process_video_mock()` in `/app/backend/server.py` with:

```python
async def process_video_yolo(video_path: str, intersection_id: str):
    from ultralytics import YOLO
    
    # Load YOLO model (download on first run)
    model = YOLO('yolov8n.pt')  # or yolov11n.pt
    
    cap = cv2.VideoCapture(video_path)
    detections = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Run inference
        results = model(frame, conf=0.5, device='cpu')
        
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                confidence = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                detection = VehicleDetection(
                    intersection_id=intersection_id,
                    vehicle_type=class_name,
                    lane="detected",
                    speed=0.0,  # Calculate from tracking
                    confidence=confidence,
                    tracking_id=f"trk-{random.randint(1000, 9999)}",
                    bbox={"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                )
                detections.append(detection)
    
    cap.release()
    return detections
```

#### For Live Camera Streams:

The system supports WebSocket connections for real-time streaming (see `/api/ws/live`).

## 📦 Demo Data

The system includes pre-seeded demo data:
- **5 Intersections** across a city grid
- **100+ Vehicle Detections** with various types
- **3 Incidents** (2 active, 1 resolved)
- **4 Video Feeds** with static camera images
- **24 Hours** of traffic metrics (5-minute intervals)

Demo data is automatically seeded on application startup.

## 🔧 Deployment

### Production Checklist
- [ ] Replace demo MongoDB with production instance
- [ ] Update CORS_ORIGINS to specific domains
- [ ] Configure YOLO model path and weights
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Add authentication middleware
- [ ] Set up monitoring and logging
- [ ] Configure backup schedules
- [ ] Test with actual video feeds

### Sensor/Camera Integration

The system is ready for sensor and camera integration:

1. **REST API**: POST video files to `/api/feeds/upload`
2. **WebSocket**: Connect to `/api/ws/live` for real-time streaming
3. **RTSP Support**: Extend with OpenCV RTSP stream handling

## 🧪 Testing

Backend API testing:
```bash
cd /app/backend
python backend_test.py
```

Frontend testing:
```bash
cd /app/frontend
yarn test
```

## 📈 Monitoring

### System Status
- Check backend: `curl https://pdf-to-deploy.preview.emergentagent.com/api/`
- Dashboard stats: `GET /api/traffic/dashboard`
- Health check: Monitor supervisor status

### Logs
- Backend: `/var/log/supervisor/backend.err.log`
- Frontend: `/var/log/supervisor/frontend.err.log`

## 🤝 Contributing

### Code Structure
```
/app/
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── components/   # Reusable components
│   │   └── pages/        # Page components
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend configuration
└── design_guidelines.json # UI/UX specifications
```

## 📄 License

Built with Emergent AI Platform

## 🌟 Future Enhancements

- Multi-city support with region selection
- Predictive traffic modeling with ML
- Integration with emergency services
- Mobile app for field operators
- Advanced analytics with AI insights
- Weather condition integration
- Public API for third-party apps
- Real-time collaboration features

## 📞 Support

For issues or questions about deployment, refer to the integration playbook or Emergent documentation.

---

**SmartFlow AI** - Revolutionizing Urban Traffic Management with Artificial Intelligence
