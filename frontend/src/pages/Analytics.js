import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const [hourlyData, setHourlyData] = useState([]);
  const [vehicleStats, setVehicleStats] = useState([]);
  const [schedulePerformance, setSchedulePerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [hourlyRes, vehicleRes, scheduleRes] = await Promise.all([
        axios.get(`${API}/analytics/hourly?hours=24`),
        axios.get(`${API}/vehicles/stats`),
        axios.get(`${API}/analytics/schedule-performance`),
      ]);
      setHourlyData(hourlyRes.data.analytics);
      setVehicleStats(vehicleRes.data.stats);
      setSchedulePerformance(scheduleRes.data.performance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-zinc-400">Loading analytics...</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Traffic Analytics</h2>
        <p className="text-sm text-zinc-500 mt-1">Historical traffic patterns and trends</p>
      </div>

      {/* Traffic Volume Over Time */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
        <h3 className="text-xl font-medium text-zinc-100 mb-6">Traffic Volume (24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hour" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '4px',
                color: '#fafafa',
              }}
            />
            <Legend wrapperStyle={{ color: '#a1a1aa' }} />
            <Line type="monotone" dataKey="total_vehicles" stroke="#3b82f6" strokeWidth={2} name="Total Vehicles" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Average Speed Over Time */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
        <h3 className="text-xl font-medium text-zinc-100 mb-6">Average Speed (24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hour" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '4px',
                color: '#fafafa',
              }}
            />
            <Legend wrapperStyle={{ color: '#a1a1aa' }} />
            <Line type="monotone" dataKey="avg_speed" stroke="#10b981" strokeWidth={2} name="Avg Speed (mph)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Length Over Time */}
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
          <h3 className="text-xl font-medium text-zinc-100 mb-6">Avg Queue Length (24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hour" stroke="#71717a" style={{ fontSize: '12px' }} />
              <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  color: '#fafafa',
                }}
              />
              <Bar dataKey="avg_queue" fill="#f59e0b" name="Avg Queue Length" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
          <h3 className="text-xl font-medium text-zinc-100 mb-6">Vehicle Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleStats}
                dataKey="count"
                nameKey="vehicle_type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.vehicle_type}
              >
                {vehicleStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  color: '#fafafa',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
