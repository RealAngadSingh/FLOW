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

      {/* Schedule Performance Section */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
        <h3 className="text-xl font-medium text-zinc-100 mb-6">Schedule Effectiveness Analytics</h3>
        {schedulePerformance.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">No schedule performance data available</div>
        ) : (
          <div className="space-y-4">
            {schedulePerformance.map((schedule) => (
              <div
                key={schedule.schedule_id}
                className="border border-zinc-800 rounded-sm p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-medium text-zinc-100 mb-1">{schedule.schedule_name}</h4>
                    <p className="text-xs text-zinc-500">Cycle Interval: {schedule.cycle_interval}s</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-blue-400">{schedule.efficiency_score}%</div>
                    <div className="text-xs text-zinc-500">Efficiency Score</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Avg Speed</div>
                    <div className="text-lg font-mono text-zinc-100">{schedule.avg_speed} mph</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Avg Queue</div>
                    <div className="text-lg font-mono text-zinc-100">{schedule.avg_queue_length}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Throughput</div>
                    <div className="text-lg font-mono text-zinc-100">{schedule.total_throughput}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</div>
                    <div className={`text-sm font-bold ${
                      schedule.efficiency_score > 70 ? 'text-emerald-400' :
                      schedule.efficiency_score > 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {schedule.recommendation}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      schedule.efficiency_score > 70 ? 'bg-emerald-500' :
                      schedule.efficiency_score > 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${schedule.efficiency_score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
