import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Truck, Bus, Bike, Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Vehicles = () => {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const fetchData = async () => {
    try {
      const params = filterType ? { vehicle_type: filterType } : {};
      const [detectionsRes, statsRes] = await Promise.all([
        axios.get(`${API}/vehicles/detections`, { params }),
        axios.get(`${API}/vehicles/stats`),
      ]);
      setDetections(detectionsRes.data.detections);
      setStats(statsRes.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'car':
        return Car;
      case 'truck':
        return Truck;
      case 'bus':
        return Bus;
      case 'motorcycle':
      case 'bicycle':
        return Bike;
      default:
        return Car;
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading vehicle detection logs...</div>;
  }

  return (
    <div className="space-y-6" data-testid="vehicles-page">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Vehicle Detection Logs</h2>
        <p className="text-sm text-zinc-500 mt-1">Real-time vehicle tracking and classification</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = getVehicleIcon(stat.vehicle_type);
          return (
            <div
              key={stat.vehicle_type}
              data-testid={`vehicle-stat-${stat.vehicle_type}`}
              className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {stat.vehicle_type}
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-zinc-50">{stat.count}</div>
              <div className="text-xs text-zinc-500 mt-1">Avg: {stat.avg_speed} mph</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            data-testid="vehicle-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm"
          >
            <option value="">All Vehicle Types</option>
            <option value="car">Car</option>
            <option value="truck">Truck</option>
            <option value="bus">Bus</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="bicycle">Bicycle</option>
          </select>
          <span className="text-sm text-zinc-500">{detections.length} detections</span>
        </div>
      </div>

      {/* Detection Table */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="vehicle-detection-table">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Vehicle Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Lane</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Speed</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Tracking ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {detections.map((detection) => (
                <tr key={detection.id} data-testid={`detection-row-${detection.id}`} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-sm font-mono text-zinc-300">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="flex items-center text-zinc-100">
                      {React.createElement(getVehicleIcon(detection.vehicle_type), {
                        className: 'w-4 h-4 mr-2 text-blue-500',
                      })}
                      {detection.vehicle_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-100">{detection.lane}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-100">{detection.speed} mph</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-emerald-400 font-mono">{(detection.confidence * 100).toFixed(0)}%</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-500">{detection.tracking_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
