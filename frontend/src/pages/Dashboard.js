import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Car, AlertTriangle, TrendingUp, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MetricCard = ({ title, value, unit, icon: Icon, status, testId }) => {
  const statusColors = {
    good: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  return (
    <div data-testid={testId} className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-colors duration-200 p-6 rounded-sm">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</span>
        <Icon className={`w-5 h-5 ${status ? statusColors[status] : 'text-zinc-400'}`} />
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-mono font-bold text-zinc-50">{value}</span>
        {unit && <span className="ml-2 text-sm text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [intersections, setIntersections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, incidentsRes, intersectionsRes] = await Promise.all([
        axios.get(`${API}/traffic/dashboard`),
        axios.get(`${API}/incidents?status=active`),
        axios.get(`${API}/intersections`),
      ]);
      setStats(statsRes.data);
      setIncidents(incidentsRes.data);
      setIntersections(intersectionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const getCongestionStatus = (level) => {
    if (level === 'low') return 'good';
    if (level === 'medium') return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Dashboard Overview</h2>
        <p className="text-sm text-zinc-500 mt-1">Real-time traffic management and monitoring</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          testId="metric-intersections"
          title="Active Intersections"
          value={stats?.active_intersections || 0}
          unit={`/ ${stats?.total_intersections || 0}`}
          icon={Navigation}
          status="good"
        />
        <MetricCard
          testId="metric-avg-speed"
          title="Avg Traffic Speed"
          value={stats?.avg_speed || 0}
          unit="mph"
          icon={TrendingUp}
          status={stats?.avg_speed > 30 ? 'good' : 'warning'}
        />
        <MetricCard
          testId="metric-vehicles"
          title="Vehicles Detected"
          value={stats?.total_vehicles_detected || 0}
          icon={Car}
          status="good"
        />
        <MetricCard
          testId="metric-incidents"
          title="Active Incidents"
          value={stats?.active_incidents || 0}
          icon={AlertTriangle}
          status={stats?.active_incidents === 0 ? 'good' : 'critical'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium text-zinc-100">Intersection Map</h3>
            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse-red">
              LIVE
            </span>
          </div>
          <div data-testid="traffic-map" className="h-96 rounded-sm overflow-hidden relative z-0">
            <MapContainer
              center={[40.7589, -73.9851]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {intersections.map((int) => (
                <Marker
                  key={int.id}
                  position={[int.location.lat, int.location.lng]}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold">{int.name}</div>
                      <div>Status: {int.status}</div>
                      <div>Signal: {int.current_signal_state}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4">
          <h3 className="text-xl font-medium text-zinc-100 mb-4">Active Incidents</h3>
          <div className="space-y-3 overflow-y-auto scrollbar-thin max-h-96">
            {incidents.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No active incidents</div>
            ) : (
              incidents.map((incident) => {
                const severityColors = {
                  high: 'border-red-500/50 bg-red-900/20 text-red-400',
                  medium: 'border-amber-500/50 bg-amber-900/20 text-amber-400',
                  low: 'border-blue-500/50 bg-blue-900/20 text-blue-400',
                };

                return (
                  <div
                    key={incident.id}
                    data-testid={`incident-${incident.id}`}
                    className={`border rounded-sm p-3 ${severityColors[incident.severity]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {incident.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase">{incident.severity}</span>
                    </div>
                    <div className="text-xs mb-2">{incident.description}</div>
                    <div className="text-[10px] text-zinc-400">{incident.location}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium text-zinc-100">System Status</h3>
            <p className="text-sm text-zinc-500 mt-1">All systems operational</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Congestion</div>
              <div className={`text-lg font-bold ${stats?.congestion_level === 'low' ? 'text-emerald-500' : stats?.congestion_level === 'medium' ? 'text-amber-500' : 'text-red-500'}`}>
                {stats?.congestion_level?.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</div>
              <div className="text-lg font-bold text-emerald-500">OPERATIONAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
