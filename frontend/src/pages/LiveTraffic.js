import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LiveTraffic = () => {
  const [intersections, setIntersections] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [intersectionsRes, metricsRes] = await Promise.all([
        axios.get(`${API}/intersections`),
        axios.get(`${API}/traffic/metrics?hours=1`),
      ]);
      setIntersections(intersectionsRes.data);
      setMetrics(metricsRes.data.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live traffic data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-zinc-400">Loading live traffic data...</div>;
  }

  const getIntersectionMetrics = (intId) => {
    const intMetrics = metrics.filter((m) => m.intersection_id === intId);
    if (intMetrics.length === 0) return null;
    const latest = intMetrics[0];
    return latest;
  };

  return (
    <div className="space-y-6" data-testid="live-traffic-page">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Live Traffic View</h2>
        <p className="text-sm text-zinc-500 mt-1">Real-time traffic monitoring and control</p>
      </div>

      {/* Map */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium text-zinc-100">Live Intersection Map</h3>
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse-red">
            LIVE
          </span>
        </div>
        <div data-testid="live-traffic-map" className="h-[500px] rounded-sm overflow-hidden relative z-0">
          <MapContainer center={[40.7589, -73.9851]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {intersections.map((int) => (
              <Marker key={int.id} position={[int.location.lat, int.location.lng]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold mb-1">{int.name}</div>
                    <div>Status: <span className={int.status === 'online' ? 'text-green-500' : 'text-red-500'}>{int.status}</span></div>
                    <div>Signal: {int.current_signal_state}</div>
                    {getIntersectionMetrics(int.id) && (
                      <>
                        <div>Vehicles: {getIntersectionMetrics(int.id).vehicle_count}</div>
                        <div>Avg Speed: {getIntersectionMetrics(int.id).avg_speed} mph</div>
                        <div>Queue: {getIntersectionMetrics(int.id).queue_length}</div>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Intersection Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intersections.map((int) => {
          const intMetric = getIntersectionMetrics(int.id);
          return (
            <div
              key={int.id}
              data-testid={`intersection-card-${int.id}`}
              className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-medium text-zinc-100">{int.name}</h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    int.status === 'online'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-zinc-700/10 text-zinc-500 border border-zinc-700/20'
                  }`}
                >
                  {int.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Signal State:</span>
                  <span className="text-zinc-100 font-mono">{int.current_signal_state}</span>
                </div>
                {intMetric && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vehicles:</span>
                      <span className="text-zinc-100 font-mono">{intMetric.vehicle_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Avg Speed:</span>
                      <span className="text-zinc-100 font-mono">{intMetric.avg_speed} mph</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Queue Length:</span>
                      <span className="text-zinc-100 font-mono">{intMetric.queue_length}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mode:</span>
                  <span className="text-zinc-100 font-mono text-xs">{int.coordination_mode}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveTraffic;
