# SmartFlow AI — Real-Time Traffic Intelligence Platform

> An AI-powered traffic management platform featuring real-time signal control, live congestion analytics, and adaptive intersection simulation — all running directly in the browser.

---

## 📋 Overview

SmartFlow AI is a front-end web application that showcases a concept for an intelligent, AI-driven urban traffic management system. It presents the problem of static traffic signals, demonstrates the proposed smart solution, and includes a live in-browser simulation of a traffic light cycle with randomised real-time metrics.

---

## 🗂️ Project Structure

```
New folder/
├── index.html          # Main page — markup, layout, and inline styles
├── colors.css          # CSS design tokens (colour palette, card & logo base styles)
├── Layout.css          # Structural layout styles (nav, hero, grid)
├── cards.css           # Reusable card component styles
├── traffic light.js    # Traffic light state machine & cycling logic
└── live metrics.js     # Simulated live metric updates (queue, wait, vehicle count)
```

---

## ✨ Features

| Section | Description |
|---|---|
| **Hero** | Full-width landing area with an animated CTA and gradient background |
| **Problem** | Four illustrated problem cards highlighting pain points of static traffic systems |
| **Solution** | Four feature cards describing the AI-powered approach (YOLO, RL, WebSocket, Maps) |
| **Live Demo** | Interactive traffic light simulation + real-time updating metrics panel |

### Live Demo Details

- **Signal Controller** (`traffic light.js`) — cycles through Green (5 s) → Amber (2 s) → Red (4 s) states with glowing CSS transitions and a phase label.
- **Live Metrics** (`live metrics.js`) — updates every 1.5 s with randomised values for:
  - Queue Length (5–25 vehicles)
  - Average Wait Time (8–38 s)
  - Vehicles Detected (30–70)

---

## 🎨 Design System

Defined in `colors.css` via CSS custom properties:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0a0e1a` | Page background |
| `--card` | `#111827` | Card surfaces |
| `--border` | `#1f2d45` | Subtle borders |
| `--green` | `#00e5a0` | Primary accent, active signals |
| `--amber` | `#ffb800` | Amber signal state |
| `--red` | `#ff4d6d` | Red signal state, warning text |
| `--text` | `#e2e8f0` | Primary text |
| `--muted` | `#64748b` | Secondary / label text |

Typography: **Inter** (Google Fonts) — weights 400, 500, 600, 700, 800.

---

## 🚀 Getting Started

No build step or dependencies are required. Simply open the file in a browser:

```bash
# Option 1 — double-click
index.html

# Option 2 — VS Code Live Server
# Right-click index.html → "Open with Live Server"

# Option 3 — Python quick server (from project directory)
python -m http.server 8080
# Then visit http://localhost:8080
```

> **Note:** All assets are local and self-contained. An internet connection is only needed to load the **Inter** font from Google Fonts.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, CSS Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Inter |

---

## 🔮 Planned / Future Enhancements

Based on the full SmartFlow AI vision:

- [ ] **FastAPI backend** with MongoDB for real-time data persistence
- [ ] **WebSocket server** for live signal state broadcasting
- [ ] **YOLOv8 vehicle detection** pipeline from camera feeds
- [ ] **Reinforcement learning** signal optimisation engine
- [ ] **Interactive city-wide map** with congestion heatmaps (Leaflet / Mapbox)
- [ ] **React dashboard** for multi-intersection monitoring

---

## 📄 License

This project is for demonstration and portfolio purposes. All rights reserved © SmartFlow AI.
